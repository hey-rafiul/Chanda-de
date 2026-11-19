export type PublicRoutePath = '/' | '/about' | '/how-to-play' | '/features' | '/updates';

export interface PageSeoMeta {
  path: PublicRoutePath | '/404';
  title: string;
  description: string;
  keywords?: string;
  robots: string;
  ogType: 'website' | 'article';
  imagePath: string;
  imageAlt: string;
  breadcrumbs: { name: string; path: string }[];
}

const AUTHOR_NAME = 'MD Rafiul Islam';
const DEFAULT_OG_IMAGE_PATH = '/images/chanda-de-og-preview.jpg';
const DEFAULT_LOGO_PATH = '/images/chanda-de-logo.png';

export const SEO_PAGES: Record<PublicRoutePath | '/404', PageSeoMeta> = {
  '/': {
    path: '/',
    title: 'Chanda De Game – Free Bangladeshi 3D Open World Browser Game',
    description:
      'Play CHANDA DE (চান্দা দে), a fun Bangladeshi 3D open-world cartoon game. Explore Chanda City, interact with NPCs, complete missions, discover shops and enjoy a unique browser gaming experience.',
    keywords:
      'Chanda De, চান্দা দে, Chanda De Game, Bangladeshi 3D Game, Bangla Browser Game, Open World Game Bangladesh, Bengali Cartoon Game',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    imagePath: DEFAULT_OG_IMAGE_PATH,
    imageAlt: 'CHANDA DE (চান্দা দে) 3D Bangladeshi open-world cartoon game hero in Chanda City',
    breadcrumbs: [{ name: 'Home', path: '/' }],
  },
  '/about': {
    path: '/about',
    title: 'About CHANDA DE (চান্দা দে) – Bangladeshi 3D Comedy Browser Game',
    description:
      'Discover the story behind CHANDA DE (চান্দা দে), a fictional Bangladeshi 3D cartoon open-world browser game set in Chanda City and created for pure comedy entertainment.',
    keywords:
      'About Chanda De, চান্দা দে গেম সম্পর্কে, Bangladeshi 3D Game, MD Rafiul Islam, Chanda City Simulator',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    ogType: 'article',
    imagePath: '/images/chanda-city-streets-bangladesh.webp',
    imageAlt: 'Colorful streets and shops of fictional Chanda City in CHANDA DE',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ],
  },
  '/how-to-play': {
    path: '/how-to-play',
    title: 'How to Play CHANDA DE (চান্দা দে) – Controls, Missions & Tips',
    description:
      'Learn how to play CHANDA DE (চান্দা দে) on desktop and mobile. Complete guide to movement controls, shop destruction, rickshaw delivery jobs, police chases, and business income.',
    keywords:
      'How to Play Chanda De, চান্দা দে খেলার নিয়ম, Chanda De Controls, Bangla Open World Game Guide',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    ogType: 'article',
    imagePath: '/images/chanda-de-cartoon-gameplay.webp',
    imageAlt: 'CHANDA DE gameplay scene with hero, tea stall, rickshaw, and street police',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'How to Play', path: '/how-to-play' },
    ],
  },
  '/features': {
    path: '/features',
    title: 'CHANDA DE Game Features – 3D Chanda City, Vehicles & Businesses',
    description:
      'Explore every feature inside CHANDA DE (চান্দা দে): 50+ shops, 7 animated 3D street characters, rickshaw and CNG rides, passive business empire, wardrobe outfits, and dynamic weather.',
    keywords:
      'Chanda De Features, চান্দা দে গেমের ফিচার, Bangladesh Simulator Game, Free Browser Game',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    ogType: 'article',
    imagePath: '/images/chanda-city-streets-bangladesh.webp',
    imageAlt: 'Chanda City 3D shops, CNG auto-rickshaws, and neighborhood streets in CHANDA DE',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Features', path: '/features' },
    ],
  },
  '/updates': {
    path: '/updates',
    title: 'Latest Updates & Changelog – CHANDA DE (চান্দা দে)',
    description:
      'View the latest game updates, UI enhancements, police encounter updates, mission fixes, and web performance improvements for CHANDA DE (চান্দা দে).',
    keywords:
      'Chanda De Updates, চান্দা দে আপডেট, Chanda De Game Patch Notes, Bangla Browser Game',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    ogType: 'article',
    imagePath: DEFAULT_OG_IMAGE_PATH,
    imageAlt: 'CHANDA DE latest game updates and optimization preview',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Updates', path: '/updates' },
    ],
  },
  '/404': {
    path: '/404',
    title: 'Page Not Found – CHANDA DE (চান্দা দে)',
    description: 'The requested page could not be found on CHANDA DE (চান্দা দে).',
    robots: 'noindex, follow',
    ogType: 'website',
    imagePath: DEFAULT_OG_IMAGE_PATH,
    imageAlt: 'CHANDA DE Bangladeshi 3D Browser Game',
    breadcrumbs: [{ name: 'Home', path: '/' }],
  },
};

export function normalizeRoutePath(rawPath: string): PublicRoutePath | '/404' {
  const clean = (rawPath || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  if (clean === '/index.html') return '/';
  if (
    clean === '/' ||
    clean === '/about' ||
    clean === '/how-to-play' ||
    clean === '/features' ||
    clean === '/updates'
  ) {
    return clean;
  }
  return '/404';
}

export function resolveRuntimeOrigin(explicitOrigin?: string): string {
  if (explicitOrigin) {
    return explicitOrigin.replace(/\/+$/, '');
  }
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
      ? String(import.meta.env.VITE_SITE_URL)
      : '';
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://chanda-de.vercel.app';
}

export function buildAbsoluteUrl(origin: string, path: string): string {
  const normalizedPath = path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is CHANDA DE (চান্দা দে) free to play in the browser?',
    answer:
      'Yes. CHANDA DE is a 100% free Bangladeshi 3D browser game. You can play directly inside any modern desktop or mobile web browser without installing an app or paying any fee.',
  },
  {
    question: 'Can I play CHANDA DE on Android or iPhone mobile browsers?',
    answer:
      'Yes. CHANDA DE includes dedicated mobile touch controls featuring a virtual movement joystick, swipe camera control, sprint toggle, and one-tap smash and interaction buttons.',
  },
  {
    question: 'Does CHANDA DE require downloading files or creating an account?',
    answer:
      'No download or sign-up is required. Your game progress, balance, missions, businesses, and unlocked outfits are automatically saved locally in your browser.',
  },
  {
    question: 'চান্দা দে গেমটি কি কোনো বাস্তব ঘটনা বা প্রতিষ্ঠানের ওপর ভিত্তি করে তৈরি?',
    answer:
      'না। চান্দা দে (CHANDA DE) সম্পূর্ণ কাল্পনিক একটি শহুরে কমেডি ও প্যারোডি সিমুলেশন গেম, যা শুধুমাত্র নিখাদ বিনোদন ও হাস্যরসের উদ্দেশ্যে তৈরি করা হয়েছে।',
  },
  {
    question: 'What can players do inside Chanda City?',
    answer:
      'Players can explore 50+ Bangladeshi street shops, break cartoon props and shop setups for coins and XP, take rickshaw/CNG delivery jobs, evade comical police chases, customize outfits, and buy passive-income street businesses.',
  },
];

export function buildStructuredDataGraph(
  routePath: PublicRoutePath | '/404',
  origin: string
): Record<string, unknown> {
  const page = SEO_PAGES[routePath];
  const canonicalUrl = buildAbsoluteUrl(origin, page.path === '/404' ? '/' : page.path);
  const homeUrl = buildAbsoluteUrl(origin, '/');
  const ogImageUrl = buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH);
  const logoUrl = buildAbsoluteUrl(origin, DEFAULT_LOGO_PATH);

  const websiteSchema: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': `${homeUrl}#website`,
    name: 'CHANDA DE',
    alternateName: 'চান্দা দে',
    url: homeUrl,
    inLanguage: ['bn', 'en'],
  };

  const videoGameSchema: Record<string, unknown> = {
    '@type': 'VideoGame',
    '@id': `${homeUrl}#videogame`,
    name: 'CHANDA DE',
    alternateName: 'চান্দা দে',
    genre: ['Open World', 'Simulation', 'Casual', 'Adventure'],
    gamePlatform: 'Web Browser',
    operatingSystem: 'Windows, Android, macOS, Linux through compatible browsers',
    applicationCategory: 'GameApplication',
    description: 'A fictional Bangladeshi 3D cartoon open-world browser game.',
    inLanguage: ['bn', 'en'],
    url: homeUrl,
    image: ogImageUrl,
    screenshot: buildAbsoluteUrl(origin, '/images/chanda-city-streets-bangladesh.webp'),
    thumbnailUrl: logoUrl,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
    },
  };

  const webPageSchema: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${homeUrl}#website` },
    about: { '@id': `${homeUrl}#videogame` },
    inLanguage: ['bn', 'en'],
  };

  const graph: Record<string, unknown>[] = [websiteSchema, videoGameSchema, webPageSchema];

  if (routePath === '/how-to-play') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: HOME_FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  if (routePath !== '/' && routePath !== '/404') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: buildAbsoluteUrl(origin, crumb.path),
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
