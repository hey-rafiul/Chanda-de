export interface FeatureDetail {
  id: string;
  number: string;
  titleEn: string;
  titleBn: string;
  summary: string;
  highlights: string[];
}

export interface CharacterProfile {
  nameEn: string;
  nameBn: string;
  role: string;
  description: string;
}

export interface CityZoneInfo {
  nameEn: string;
  nameBn: string;
  description: string;
}

export interface GameUpdateEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
}

export const CORE_FEATURES: FeatureDetail[] = [
  {
    id: 'open-world',
    number: '01',
    titleEn: '3D Fictional Chanda City',
    titleBn: '৩ডি কাল্পনিক চান্দা সিটি',
    summary:
      'Explore a colorful low-poly Bangladeshi neighborhood packed with roadside tong tea stalls, grocery shops, neon signboards, benches, and lively streets built with Three.js.',
    highlights: [
      'Dynamic Morning, Afternoon, Golden Evening, and Night cycle',
      'Toggleable monsoon rain atmosphere with puddles and ambient rain audio',
      'Interactive full world map and live minimap with fast-travel landmarks',
    ],
  },
  {
    id: 'shops-brawl',
    number: '02',
    titleEn: '50+ Interactive Shops & Cartoon Smash',
    titleBn: '৫০+ দোকান ও কার্টুন ভাঙচুর',
    summary:
      'Approach shops and street props with your wooden stick to trigger comical cartoon physics, earn virtual taka and XP, and track neighborhood exploration missions.',
    highlights: [
      '50+ distinct fictional storefronts across multiple city blocks',
      'Breakable benches, crates, signs, and shop counters with repair mechanics',
      'Balanced 45-second shop cooldown timers and floating visual notifications',
    ],
  },
  {
    id: 'vehicles-delivery',
    number: '03',
    titleEn: 'Bangladeshi Vehicles & Delivery Jobs',
    titleBn: 'যানবাহন ও ডেলিভারি জব',
    summary:
      'Hop onto traditional decorated rickshaws, green CNG auto-rickshaws, buses, or vans for quick district travel and timed delivery contracts.',
    highlights: [
      'Fast transit between Tong More, Boro Bazar, and major city stops',
      'Accept parcel delivery runs from parked vehicles for extra taka rewards',
      'Authentic procedural Web Audio rickshaw bells and street soundscape',
    ],
  },
  {
    id: 'police-chase',
    number: '04',
    titleEn: 'Police Alert & Notice System',
    titleBn: 'পুলিশ ধাওয়া ও নোটিশ সিস্টেম',
    summary:
      'Causing too much street chaos raises your alert meter and brings patrolling cartoon officers into the chase with an interactive left-docked fine notice.',
    highlights: [
      'Escape patrol zones on foot using sprint stamina',
      'Clear fine button showing exact release penalty in Bengali',
      'Balanced street heat recovery when laying low',
    ],
  },
  {
    id: 'business-empire',
    number: '05',
    titleEn: 'Passive Business Empire & Upgrades',
    titleBn: 'ব্যবসা সাম্রাজ্য ও প্যাসিভ আয়',
    summary:
      'Reinvest virtual coins earned on the streets into neighborhood stalls, rickshaw fleets, and local shops that generate ongoing passive income.',
    highlights: [
      'Own multiple street businesses and upgrade income tiers',
      'Track wallet balance, street respect, and heat in the Economy panel',
      'Complete daily & milestone missions and unlock achievements',
    ],
  },
  {
    id: 'wardrobe',
    number: '06',
    titleEn: 'Hero Wardrobe & Mood Expressions',
    titleBn: 'হিরো কাস্টমাইজেশন ও এক্সপ্রেশন',
    summary:
      'Customize your 3D character with colorful Bangladeshi panjabis, stylish dark sunglasses, accessories, and expressive animated moods.',
    highlights: [
      'Unlockable outfits, eyewear, and street gear in the Wardrobe',
      'Five interactive character expressions in the 3D Hero Showcase',
      'Instant visual updates in both showcase and city exploration',
    ],
  },
];

export const CITY_ZONES: CityZoneInfo[] = [
  {
    nameEn: 'Tong More (Tea Stall Square)',
    nameBn: 'টং মোড়',
    description:
      'The glowing heart of Chanda City where roadside tea stalls, benches, pedestrians, and rickshaws keep the neighborhood bustling from dawn to midnight.',
  },
  {
    nameEn: 'Boro Bazar Market Strip',
    nameBn: 'বড় বাজার রোড',
    description:
      'A dense avenue lined with colorful grocery stores, sweet shops, electronics corners, and sweet neon signage perfect for exploration missions.',
  },
  {
    nameEn: 'Rickshaw & CNG Stand',
    nameBn: 'রিকশা ও সিএনজি স্ট্যান্ড',
    description:
      'Transport hub where players pick up fast rides across districts or launch timed delivery jobs across the city.',
  },
  {
    nameEn: 'Police Checkpost & Park Lane',
    nameBn: 'পুলিশ ফাঁড়ি ও পার্ক লেন',
    description:
      'Patrolled avenue watched closely by cartoon city officers. Move smartly when your wanted heat level climbs.',
  },
];

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    nameEn: 'The Street Hero (Player)',
    nameBn: 'হিরো (আপনি)',
    role: 'Playable Protagonist',
    description:
      'Equipped with a stylish panjabi, sunglasses, and comic street swagger. Walk, sprint, smash props, complete deliveries, and grow a comedic business empire.',
  },
  {
    nameEn: 'Cha-Wala Mama (Tea Stall Owner)',
    nameBn: 'চা-ওয়ালা মামা',
    role: 'Street Vendor NPC',
    description:
      'The cheerful roadside tong keeper brewing hot tea and snacks while neighborhood gossip unfolds nearby.',
  },
  {
    nameEn: 'Rickshaw Puller & CNG Driver',
    nameBn: 'রিকশা ও সিএনজি চালক',
    role: 'Transit & Delivery NPC',
    description:
      'Keeps Chanda City moving with colorful floral-painted rickshaws and quick-fare cross-town transport.',
  },
  {
    nameEn: 'Shopkeepers & Traders',
    nameBn: 'দোকানদার ও ব্যবসায়ী',
    role: 'Storefront NPCs',
    description:
      'Run the 50+ fictional grocery, sweets, tea, and neighborhood shops scattered across Chanda City.',
  },
  {
    nameEn: 'Chanda City Patrol Police',
    nameBn: 'শহরের পুলিশ',
    role: 'Patrol & Fine Enforcement',
    description:
      'Comical uniformed officers patrolling the main squares who issue fine notices when street mischief escalates.',
  },
];

export const CONTROL_GUIDE = {
  desktop: [
    { key: 'W A S D / Arrow Keys', action: 'Walk & steer camera direction across Chanda City' },
    { key: 'Shift', action: 'Hold to sprint faster while escaping police' },
    { key: 'F / Action Button', action: 'Smash nearby shop props or street objects' },
    { key: 'E', action: 'Interact with vehicles for travel or delivery jobs' },
    { key: 'Space', action: 'Jump over curbs, benches, and street obstacles' },
    { key: 'Esc', action: 'Open Pause menu or close active panels' },
  ],
  mobile: [
    { key: 'Left Touch Joystick', action: '360-degree movement with smooth camera follow' },
    { key: 'Screen Drag', action: 'Look around streets and rotate camera view' },
    { key: 'Sprint Toggle', action: 'Switch between walking and fast running' },
    { key: 'লাথি / ভাঙচুর Button', action: 'One-tap cartoon smash & shop action' },
    { key: 'যাত্রা / ভাড়া Prompt', action: 'Tap near rickshaws, CNGs, or vans to travel or deliver' },
    { key: 'Top-Right মেনু Icon', action: 'Open Missions, Map, Wardrobe, Businesses & Settings' },
  ],
};

export const LATEST_UPDATES: GameUpdateEntry[] = [
  {
    version: 'Update 2.4',
    date: 'November 2026',
    title: 'SEO Landing Experience, WebP Optimization & Faster Initial Load',
    summary:
      'Introduced a fast, crawlable bilingual landing page with lazy-loaded 3D WebGL assets so visitors only download the 3D engine when launching gameplay.',
    changes: [
      'Lazy code-splitting separates the Three.js 3D world from landing & guide pages',
      'Added dedicated /about, /how-to-play, /features, and /updates information pages',
      'Optimized WebP showcase imagery, Open Graph social preview, sitemap.xml, and Schema.org VideoGame metadata',
    ],
  },
  {
    version: 'Update 2.3',
    date: 'November 2026',
    title: 'Streamlined Top Menu, Notification Placement & Police Notice Polish',
    summary:
      'Refined desktop and mobile HUD clarity based on player feedback while keeping every mission and business feature responsive.',
    changes: [
      'Moved the Menu icon directly above the top-right Wallet/Income HUD card',
      'Positioned gameplay toast notifications cleanly beneath the Location indicator',
      'Docked the semi-transparent Police Fine notice cleanly on the left side on desktop with clear release button pricing',
      'Fixed shop visit tracking for area exploration missions and eliminated WebGL resource leaks',
    ],
  },
  {
    version: 'Update 2.2',
    date: 'November 2026',
    title: '3D Hero Mood Showcase & Dynamic Weather Controls',
    summary:
      'Expanded player expression previews and atmospheric controls inside Chanda City.',
    changes: [
      'Added interactive 3D hero moods (Style, Smile, Laugh, Shocked, Serious)',
      'Enabled morning, afternoon, evening, and night lighting transitions plus rain mode',
      'Added full mobile touch joystick support with camera orientation lock',
    ],
  },
];
