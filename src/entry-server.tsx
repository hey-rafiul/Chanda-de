import { renderToString } from 'react-dom/server';
import App from './App';
import {
  SEO_PAGES,
  PublicRoutePath,
  normalizeRoutePath,
  buildAbsoluteUrl,
  buildStructuredDataGraph,
} from './seo/seoConfig';

export interface PrerenderResult {
  html: string;
  title: string;
  description: string;
  keywords?: string;
  robots: string;
  canonicalUrl: string;
  ogType: string;
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  jsonLd: string;
}

export function renderRouteHtml(rawPath: string, siteUrl: string): PrerenderResult {
  const normalized: PublicRoutePath | '/404' = normalizeRoutePath(rawPath);
  const meta = SEO_PAGES[normalized] || SEO_PAGES['/404'];
  const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
  const canonicalPath = meta.path === '/404' ? '/' : meta.path;
  const canonicalUrl = buildAbsoluteUrl(cleanSiteUrl, canonicalPath);
  const ogImage = buildAbsoluteUrl(cleanSiteUrl, meta.imagePath);

  const html = renderToString(<App initialPath={normalized} />);
  const jsonLd = JSON.stringify(buildStructuredDataGraph(normalized, cleanSiteUrl));

  return {
    html,
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: meta.robots,
    canonicalUrl,
    ogType: meta.ogType,
    ogUrl: canonicalUrl,
    ogImage,
    ogImageAlt: meta.imageAlt,
    jsonLd,
  };
}
