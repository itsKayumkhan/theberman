import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

// Minimal static server for dist/ with SPA fallback
const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    let filePath = path.join(process.cwd(), 'dist', decodeURIComponent(url.pathname));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mime = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.ico': 'image/x-icon',
        }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
    } else if (fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(process.cwd(), 'dist', 'index.html')).pipe(res);
    } else {
        res.writeHead(404).end('Not found');
    }
});

await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
console.log(`Server running at ${BASE_URL}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const failures = [];

async function checkLink(page, url, expectedText, expectedHref) {
    await page.goto(`${BASE_URL}${url}?tenant=portugal`, { waitUntil: 'networkidle' });
    const el = page.locator(`a:has-text("${expectedText}")`).first();
    if (!await el.count()) {
        failures.push(`${url}: could not find link "${expectedText}"`);
        return;
    }
    const href = await el.getAttribute('href');
    if (href !== expectedHref) {
        failures.push(`${url}: "${expectedText}" href="${href}" expected "${expectedHref}"`);
    } else {
        console.log(`OK: ${url} "${expectedText}" -> ${href}`);
    }
}

try {
    // Home
    await checkLink(page, '/', 'Pedir Orçamento Grátis', '/get-quote');
    await checkLink(page, '/', 'Certificado Energético?', '/services');
    await checkLink(page, '/', 'Perito Qualificado', '/catalogue');
    await checkLink(page, '/', 'Explore Our Catalogue', '/catalogue');
    await checkLink(page, '/', 'Ver todas as perguntas', '/faq');

    // Services
    await checkLink(page, '/services', 'legislação', '/catalogue');
    await checkLink(page, '/services', 'perito certificador', '/contact-us');
    await checkLink(page, '/services', 'Certificado Residencial', '/get-quote');

    // Pricing
    await checkLink(page, '/pricing', 'Obtenha um orçamento gratuito', '/get-quote');

    // About
    await checkLink(page, '/about-us', 'certificação energética em Portugal', '/services');

    // Contact
    await checkLink(page, '/contact-us', 'certificados energéticos', '/faq');

    // Energy Advisor
    await checkLink(page, '/energy-advisor', 'Consultor Energético Grátis', '/contact-us');
} catch (err) {
    failures.push(`Unexpected error: ${err.message}`);
} finally {
    await browser.close();
    server.close();
}

if (failures.length) {
    console.error('Failures:');
    failures.forEach(f => console.error(' -', f));
    process.exit(1);
}

console.log('All Portugal interlink checks passed.');
