#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import middleware from '../middleware.js';
import { PAGE_SEO } from '../seo-metadata.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');

const tenants = {
  ireland: { host: 'www.theberman.eu', baseUrl: 'https://www.theberman.eu' },
  england: { host: 'www.epccert.com', baseUrl: 'https://www.epccert.com' },
  spain: {
    host: 'www.xn--certificadoenergtico-q2b.eu',
    baseUrl: 'https://www.xn--certificadoenergtico-q2b.eu',
  },
};

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const tag = (name, value) => `<${name}>${escapeHtml(value)}</${name}>`;
const meta = (attribute, name, value) => `<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`;
const count = (html, pattern) => (html.match(pattern) || []).length;

let checked = 0;
for (const [tenant, config] of Object.entries(tenants)) {
  for (const [pagePath, expected] of Object.entries(PAGE_SEO[tenant])) {
    globalThis.fetch = async () => new Response(indexHtml, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });

    const request = new Request(`https://${config.host}${pagePath}`);
    const response = await middleware(request);
    assert.equal(response.status, 200, `${tenant}${pagePath}: must not redirect`);
    const html = await response.text();
    const canonical = `${config.baseUrl}${expected.canonical}`;

    assert.ok(html.includes(tag('title', expected.title)), `${tenant}${pagePath}: title`);
    assert.ok(html.includes(meta('name', 'description', expected.description)), `${tenant}${pagePath}: description`);
    assert.ok(html.includes(meta('property', 'og:title', expected.ogTitle)), `${tenant}${pagePath}: og:title`);
    assert.ok(html.includes(meta('property', 'og:description', expected.ogDescription)), `${tenant}${pagePath}: og:description`);
    assert.ok(html.includes(meta('name', 'twitter:title', expected.twitterTitle)), `${tenant}${pagePath}: twitter:title`);
    assert.ok(html.includes(meta('name', 'twitter:description', expected.twitterDescription)), `${tenant}${pagePath}: twitter:description`);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}" />`), `${tenant}${pagePath}: canonical`);

    assert.equal(count(html, /<title(?:\s[^>]*)?>/gi), 1, `${tenant}${pagePath}: title count`);
    assert.equal(count(html, /<meta\s+[^>]*name="description"/gi), 1, `${tenant}${pagePath}: description count`);
    assert.equal(count(html, /<meta\s+[^>]*property="og:title"/gi), 1, `${tenant}${pagePath}: og:title count`);
    assert.equal(count(html, /<link\s+[^>]*rel="canonical"/gi), 1, `${tenant}${pagePath}: canonical count`);
    checked += 1;
  }
}

console.log(`Workbook SEO metadata passed for ${checked} tenant pages.`);
