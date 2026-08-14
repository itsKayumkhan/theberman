#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import middleware from '../middleware.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');
const contaminatedHtml = indexHtml.replace(
  '</head>',
  `  <meta name="description" content="stale tenant description" />
  <link rel="canonical" href="https://wrong-tenant.example/" />
  <meta property="og:title" content="Wrong tenant" />
  <script type="application/ld+json">{"name":"Wrong tenant"}</script>
</head>`,
);

const cases = [
  {
    host: 'www.theberman.eu',
    tenant: 'ireland',
    title: "The Berman – Ireland's Largest BER Website | BER Certificates & Energy Ratings",
    description: "Ireland's largest BER website.",
    canonical: 'https://www.theberman.eu/',
  },
  {
    host: 'www.xn--certificadoenergtico-q2b.eu',
    tenant: 'spain',
    title: 'Certificado Energético en España | Precio desde 60€ | Técnicos Acreditados',
    description: '¿Necesitas tu certificado energético?',
    canonical: 'https://www.xn--certificadoenergtico-q2b.eu/',
  },
  {
    host: 'www.epccert.com',
    tenant: 'england',
    title: 'EPC Certificate England | Domestic & Commercial EPC',
    description: 'Book Accredited EPC Assessments Across England.',
    canonical: 'https://www.epccert.com/',
  },
  {
    host: 'www.dpecert.fr',
    tenant: 'france',
    title: 'Certificat DPE France | Prix à partir de 60€ | Experts Certifiés',
    description: 'Obtenez votre certificat DPE en France.',
    canonical: 'https://www.dpecert.fr/',
  },
  {
    host: 'www.certificadoenergia.com',
    tenant: 'portugal',
    title: 'Certificado Energético Portugal | Preço desde 60€ | Técnicos Acreditados',
    description: 'Obtenha o seu certificado energético em Portugal.',
    canonical: 'https://www.certificadoenergia.com/',
  },
];

const count = (html, pattern) => (html.match(pattern) || []).length;
const tenantHosts = [
  'theberman.eu',
  'epccert.com',
  'dpecert.fr',
  'xn--certificadoenergtico-q2b.eu',
  'certificadoenergia.com',
];

for (const testCase of cases) {
  globalThis.fetch = async () => new Response(contaminatedHtml, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

  // Exercise x-forwarded-host (including a proxy port), which is what the edge
  // runtime uses to retain the original tenant domain.
  const request = new Request('https://deployment.internal/', {
    headers: {
      host: 'deployment.internal',
      'x-forwarded-host': `${testCase.host}:443`,
    },
  });
  const response = await middleware(request);
  const html = await response.text();

  assert.equal(count(html, /<title(?:\s[^>]*)?>/gi), 1, `${testCase.host}: title count`);
  assert.equal(count(html, /<meta\s+[^>]*name="description"/gi), 1, `${testCase.host}: description count`);
  assert.equal(count(html, /<link\s+[^>]*rel="canonical"/gi), 1, `${testCase.host}: canonical count`);
  assert.match(html, new RegExp(`tenant-seo:start \\(${testCase.tenant}\\)`));
  assert.ok(html.includes(`<title>${testCase.title.replace(/&/g, '&amp;')}</title>`), `${testCase.host}: correct title`);
  assert.ok(html.includes(testCase.description), `${testCase.host}: correct description`);
  assert.ok(html.includes(`<link rel="canonical" href="${testCase.canonical}" />`), `${testCase.host}: correct canonical`);
  assert.ok(!html.includes('stale tenant description'), `${testCase.host}: stale description removed`);
  assert.ok(!html.includes('wrong-tenant.example'), `${testCase.host}: stale canonical removed`);
  assert.ok(!html.includes('Wrong tenant'), `${testCase.host}: stale structured data removed`);
  for (const otherHost of tenantHosts.filter(host => !testCase.host.includes(host))) {
    assert.ok(!html.includes(otherHost), `${testCase.host}: must not reference tenant ${otherHost}`);
  }
  const seoStart = html.indexOf(`tenant-seo:start (${testCase.tenant})`);
  const seoEnd = html.indexOf(`tenant-seo:end (${testCase.tenant})`);
  const descriptionPosition = html.indexOf('<meta name="description"');
  const themeColorPosition = html.indexOf('<meta name="theme-color"');
  assert.ok(seoStart < descriptionPosition && descriptionPosition < seoEnd, `${testCase.host}: metadata is one block`);
  assert.ok(seoEnd < themeColorPosition, `${testCase.host}: SEO block replaces original title slot`);
  assert.match(response.headers.get('vary') || '', /Host/);
}

// Older deployed builds used this fallback comment instead of tenant-seo
// markers. Keep this fixture because it is the exact shape visible in Ctrl+U.
const legacyHtml = indexHtml.replace(
  /<!--\s*tenant-seo:start[\s\S]*?tenant-seo:end\s*-->/i,
  `<!-- Fallback title (overridden by middleware + react-helmet-async per-page). -->
  <title>Energy Rating Certificates & Assessments</title>`,
);
globalThis.fetch = async () => new Response(legacyHtml, {
  headers: { 'content-type': 'text/html; charset=utf-8' },
});
const legacyResponse = await middleware(new Request('https://www.epccert.com/'));
const legacySource = await legacyResponse.text();
const legacyStart = legacySource.indexOf('tenant-seo:start (england)');
const legacyEnd = legacySource.indexOf('tenant-seo:end (england)');
assert.ok(!legacySource.includes('Fallback title'), 'legacy fallback comment removed');
assert.ok(legacyStart < legacySource.indexOf('<meta name="description"') && legacySource.indexOf('<meta name="description"') < legacyEnd, 'legacy source metadata is one block');
assert.ok(legacyEnd < legacySource.indexOf('<meta name="theme-color"'), 'legacy source block replaces fallback position');

console.log(`Tenant SEO isolation passed for ${cases.length} tenants and the legacy Ctrl+U source.`);
