import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const ssrDir = path.join(rootDir, 'dist-ssr');
const ssrEntryPath = path.join(ssrDir, 'entry-server.js');

function resolveBuildSiteUrl() {
  const raw =
    process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://chanda-de.vercel.app';
  return raw.trim().replace(/\/+$/, '');
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceMetaAttr(html, attrName, attrValue, content) {
  const regex = new RegExp(
    `<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*\\/?>`,
    'i'
  );
  const tag = `<meta ${attrName}="${attrValue}" content="${escapeAttr(content)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function removeMetaAttr(html, attrName, attrValue) {
  const regex = new RegExp(
    `\\s*<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*\\/?>`,
    'gi'
  );
  return html.replace(regex, '');
}

function escapeTitle(value) {
  return String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtmlDocument(template, rendered) {
  let doc = template;
  doc = doc.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeTitle(rendered.title)}</title>`);
  doc = replaceMetaAttr(doc, 'name', 'description', rendered.description);
  if (rendered.keywords) {
    doc = replaceMetaAttr(doc, 'name', 'keywords', rendered.keywords);
  } else {
    doc = removeMetaAttr(doc, 'name', 'keywords');
  }
  doc = replaceMetaAttr(doc, 'name', 'robots', rendered.robots);

  const canonicalTag = `<link rel="canonical" href="${escapeAttr(rendered.canonicalUrl)}" />`;
  if (doc.includes('<!--SEO_CANONICAL-->')) {
    doc = doc.replace('<!--SEO_CANONICAL-->', canonicalTag);
  } else {
    doc = doc.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      canonicalTag
    );
  }

  doc = replaceMetaAttr(doc, 'property', 'og:type', rendered.ogType);
  doc = replaceMetaAttr(doc, 'property', 'og:title', rendered.title);
  doc = replaceMetaAttr(doc, 'property', 'og:description', rendered.description);
  doc = replaceMetaAttr(doc, 'property', 'og:url', rendered.ogUrl);
  doc = replaceMetaAttr(doc, 'property', 'og:image', rendered.ogImage);
  doc = replaceMetaAttr(doc, 'property', 'og:image:alt', rendered.ogImageAlt);

  doc = replaceMetaAttr(doc, 'name', 'twitter:title', rendered.title);
  doc = replaceMetaAttr(doc, 'name', 'twitter:description', rendered.description);
  doc = replaceMetaAttr(doc, 'name', 'twitter:image', rendered.ogImage);
  doc = replaceMetaAttr(doc, 'name', 'twitter:image:alt', rendered.ogImageAlt);

  const jsonLdTag = `<script id="chanda-jsonld" type="application/ld+json">${rendered.jsonLd}</script>`;
  doc = doc.replace('<!--SEO_JSONLD-->', jsonLdTag);

  doc = doc.replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`);
  return doc;
}

async function main() {
  if (!fs.existsSync(ssrEntryPath)) {
    throw new Error(`SSR entry bundle missing at ${ssrEntryPath}`);
  }

  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  const { renderRouteHtml } = await import(pathToFileURL(ssrEntryPath).href);

  const siteUrl = resolveBuildSiteUrl();
  const routes = [
    { path: '/', outFile: 'index.html', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', outFile: 'about.html', priority: '0.8', changefreq: 'monthly' },
    { path: '/how-to-play', outFile: 'how-to-play.html', priority: '0.9', changefreq: 'monthly' },
    { path: '/features', outFile: 'features.html', priority: '0.9', changefreq: 'monthly' },
    { path: '/updates', outFile: 'updates.html', priority: '0.8', changefreq: 'weekly' },
    { path: '/404', outFile: '404.html', noindex: true },
  ];

  for (const route of routes) {
    const rendered = renderRouteHtml(route.path, siteUrl);
    const fullHtml = buildHtmlDocument(template, rendered);
    fs.writeFileSync(path.join(distDir, route.outFile), fullHtml, 'utf-8');
  }

  const today = new Date().toISOString().split('T')[0];
  const indexableRoutes = routes.filter((r) => !r.noindex);
  const urlEntries = indexableRoutes
    .map((r) => {
      const loc = siteUrl ? `${siteUrl}${r.path}` : r.path;
      return [
        '  <url>',
        `    <loc>${escapeAttr(loc)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${r.changefreq}</changefreq>`,
        `    <priority>${r.priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  const sitemapRef = siteUrl ? `${siteUrl}/sitemap.xml` : '/sitemap.xml';
  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${sitemapRef}`,
    '',
  ].join('\n');

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');

  fs.rmSync(ssrDir, { recursive: true, force: true });

  console.log(
    `[SEO Prerender] Generated ${routes.length} HTML routes, sitemap.xml, and robots.txt (siteUrl: ${
      siteUrl || 'relative — automatically populated on Vercel via VERCEL_PROJECT_PRODUCTION_URL or VITE_SITE_URL'
    })`
  );
}

main().catch((err) => {
  console.error('[SEO Prerender] Failed:', err);
  process.exit(1);
});
