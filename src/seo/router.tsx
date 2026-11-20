import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PublicRoutePath,
  SEO_PAGES,
  normalizeRoutePath,
  resolveRuntimeOrigin,
  buildAbsoluteUrl,
  buildStructuredDataGraph,
} from './seoConfig';

interface RouterContextValue {
  path: PublicRoutePath | '/404';
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
});

function upsertMetaTag(
  attrName: 'name' | 'property',
  attrValue: string,
  content?: string
): void {
  if (typeof document === 'undefined') return;
  const selector = `meta[${attrName}="${attrValue}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLdScript(data: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;
  let script = document.head.querySelector<HTMLScriptElement>(
    'script#chanda-jsonld[type="application/ld+json"]'
  );
  if (!script) {
    script = document.createElement('script');
    script.id = 'chanda-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function syncDocumentHeadForPath(routePath: PublicRoutePath | '/404'): void {
  if (typeof document === 'undefined') return;
  const meta = SEO_PAGES[routePath] || SEO_PAGES['/404'];
  const origin = resolveRuntimeOrigin();
  const canonicalUrl = buildAbsoluteUrl(origin, meta.path === '/404' ? '/' : meta.path);
  const ogImageUrl = buildAbsoluteUrl(origin, meta.imagePath);

  document.title = meta.title;
  upsertMetaTag('name', 'description', meta.description);
  upsertMetaTag('name', 'keywords', meta.keywords);
  upsertMetaTag('name', 'robots', meta.robots);
  upsertCanonicalLink(canonicalUrl);

  upsertMetaTag('property', 'og:type', meta.ogType);
  upsertMetaTag('property', 'og:title', meta.title);
  upsertMetaTag('property', 'og:description', meta.description);
  upsertMetaTag('property', 'og:url', canonicalUrl);
  upsertMetaTag('property', 'og:image', ogImageUrl);
  upsertMetaTag('property', 'og:image:alt', meta.imageAlt);
  upsertMetaTag('property', 'og:site_name', 'CHANDA DE');
  upsertMetaTag('property', 'og:locale', 'bn_BD');

  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', meta.title);
  upsertMetaTag('name', 'twitter:description', meta.description);
  upsertMetaTag('name', 'twitter:image', ogImageUrl);
  upsertMetaTag('name', 'twitter:image:alt', meta.imageAlt);

  upsertJsonLdScript(buildStructuredDataGraph(routePath, origin));
}

interface RouterProviderProps {
  initialPath?: string;
  children: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ initialPath, children }) => {
  const [path, setPath] = useState<PublicRoutePath | '/404'>(() => {
    if (initialPath) return normalizeRoutePath(initialPath);
    if (typeof window !== 'undefined') return normalizeRoutePath(window.location.pathname);
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizeRoutePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    syncDocumentHeadForPath(path);
  }, [path]);

  const navigate = useCallback((to: string) => {
    if (typeof window === 'undefined') return;
    const [rawPathname, hashPart] = to.split('#');
    const nextPath = normalizeRoutePath(rawPathname || '/');

    if (window.location.pathname !== (rawPathname || '/')) {
      window.history.pushState({}, '', to);
    }
    setPath(nextPath);

    if (hashPart) {
      window.setTimeout(() => {
        const el = document.getElementById(hashPart);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
};

export function useSeoRouter() {
  return useContext(RouterContext);
}

interface SeoLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export const SeoLink: React.FC<SeoLinkProps> = ({ to, onClick, children, ...rest }) => {
  const { navigate } = useSeoRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      rest.target === '_blank'
    ) {
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
