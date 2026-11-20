import { create } from 'zustand';
import {
  PlayerStats,
  GameTransaction,
  DestructibleObject,
  Mission,
  BusinessItem,
  CustomizationItem,
  WeatherType,
  TimeOfDay,
  CityEvent,
  GameSettings,
  ShopData,
  VehicleData,
  InventoryItem,
  Achievement,
  DeliveryJob,
  ShopBrawlState,
  HeroExpression,
  EquippedOutfit,
} from '../types/game';
import {
  CITY_ZONES,
  SHOPS_DATA,
  VEHICLES_DATA,
  INITIAL_DESTRUCTIBLE_OBJECTS,
  INITIAL_MISSIONS,
  INITIAL_BUSINESS_ITEMS,
  INITIAL_CUSTOMIZATION,
  INITIAL_INVENTORY,
  INITIAL_ACHIEVEMENTS,
  DELIVERY_JOBS_POOL,
  PROGRESSION_LEVELS,
  RANDOM_CITY_EVENTS,
} from '../data/cityData';
import { soundManager } from '../audio/soundManager';

const STORAGE_KEY = 'chanda_de_save_v2';
const LEGACY_STORAGE_KEY = 'chanda_de_save_v1';

export interface GameState {
  // Navigation & UI
  gameMode: 'menu' | 'playing' | 'paused';
  activeModal:
    | 'vehicle'
    | 'business'
    | 'repair'
    | 'customization'
    | 'missions'
    | 'settings'
    | 'map'
    | 'police_encounter'
    | 'inventory'
    | 'economy'
    | 'achievements'
    | null;
  selectedVehicle: VehicleData | null;
  heroExpression: HeroExpression;
  notificationMessage: {
    title: string;
    subtitle: string;
    type: 'success' | 'warning' | 'info' | 'danger';
  } | null;
  screenShakeTick: number;
  currentZoneId: string;
  activeBrawl: ShopBrawlState | null;
  comicHitPopup: { id: number; text: string } | null;
  chandaCallout: { shopName: string; tick: number } | null;

  // Player
  playerStats: PlayerStats;
  playerPosition: [number, number, number];
  playerRotation: number;
  equipped: EquippedOutfit;

  // World & Environment
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  gameTimeMinutes: number;
  activeEvent: CityEvent | null;

  // Systems
  shops: ShopData[];
  vehicles: VehicleData[];
  destructibles: DestructibleObject[];
  missions: Mission[];
  businesses: BusinessItem[];
  customizations: CustomizationItem[];
  inventory: InventoryItem[];
  achievements: Achievement[];
  transactions: GameTransaction[];
  settings: GameSettings;
  activeDelivery: DeliveryJob | null;
  visitedShopIds: string[];
  demandedChandaShopIds: string[];
  shopCooldowns: Record<string, number>;
  vehicleCooldowns: Record<string, number>;
  policeState: {
    status: 'idle' | 'arriving' | 'chasing' | 'caught';
    displaySec: number;
    lastShopId: string | null;
    pendingShopId: string | null;
    lastPoliceFine: number;
    noticeIndex: number;
  };

  // Actions
  setGameMode: (mode: 'menu' | 'playing' | 'paused') => void;
  openModal: (modal: GameState['activeModal']) => void;
  closeModal: () => void;
  setSelectedVehicle: (vehicle: VehicleData | null) => void;
  setHeroExpression: (expr: HeroExpression) => void;
  notify: (
    title: string,
    subtitle: string,
    type?: 'success' | 'warning' | 'info' | 'danger'
  ) => void;

  // Player & Economy
  setPlayerPosition: (pos: [number, number, number], rot?: number) => void;
  processTransaction: (
    type: 'income' | 'expense',
    category: GameTransaction['category'],
    amount: number,
    title: string,
    titleBn: string,
    silent?: boolean
  ) => boolean;
  addMoney: (
    amount: number,
    title: string,
    titleBn: string,
    category?: GameTransaction['category']
  ) => boolean;
  spendMoney: (
    amount: number,
    title: string,
    titleBn: string,
    category?: GameTransaction['category']
  ) => boolean;
  addXP: (amount: number) => void;
  adjustReputation: (delta: number) => void;
  setWantedStars: (stars: number) => void;
  caughtByPolice: () => void;
  showPoliceEncounterNotice: () => void;
  reportVangchurToPolice: (shopId?: string) => void;
  activateArrivedPoliceChase: () => void;
  endPoliceChase: () => void;
  setPoliceDisplaySec: (sec: number) => void;

  // Shops, Proximity Callout & Brawl
  markShopVisited: (shopId: string) => void;
  recordNegotiationWin: (shopId: string) => void;
  setVehicleCooldown: (vehicleId: string, durationMs?: number) => void;
  triggerChandaCallout: (shopNameBn: string, shopId?: string) => void;
  damageShopBrawl: (shopId: string, keeperDmg: number, resistanceDmg: number, hitWord?: string) => void;

  // Deliveries
  startDeliveryJob: (fromNameBn?: string) => DeliveryJob | null;
  completeActiveDelivery: () => boolean;
  cancelDeliveryJob: () => void;

  // Destruction & Repair
  damageObject: (id: string, damage?: number) => void;
  repairObject: (id: string) => boolean;
  repairAllObjects: () => boolean;

  // Missions & Achievements
  updateMissionProgress: (type: Mission['type'], count?: number) => void;
  claimMissionReward: (missionId: string) => void;
  checkAchievements: () => void;
  claimAchievement: (achievementId: string) => void;

  // Business Empire
  buyBusiness: (id: string) => boolean;
  upgradeBusiness: (id: string) => boolean;
  collectPassiveIncome: () => void;

  // Inventory & Customization
  useInventoryItem: (id: string) => boolean;
  addInventoryItem: (item: InventoryItem) => void;
  buyCustomization: (id: string) => boolean;
  equipCustomization: (type: keyof EquippedOutfit, id: string) => void;

  // World controls
  advanceGameTime: (deltaMinutes: number) => void;
  triggerRandomEvent: () => void;
  clearEvent: () => void;

  // Settings & Saves
  updateSettings: (partial: Partial<GameSettings>) => void;
  saveGame: () => void;
  loadGame: () => boolean;
  resetGame: () => void;
}

const initialPlayerStats: PlayerStats = {
  name: 'Chanda Bhai',
  level: 1,
  xp: 0,
  nextLevelXp: 300,
  balance: 500,
  totalCollected: 0,
  totalExpenses: 0,
  dailyIncome: 0,
  businessIncomeEarned: 0,
  reputation: 60,
  wantedStars: 0,
  timesCaught: 0,
  objectsDestroyedCount: 0,
  totalRepairExpenses: 0,
  repairedCount: 0,
  deliveriesCompleted: 0,
  negotiationsWon: 0,
};

const initialSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.45,
  graphicsQuality: 'medium',
  showMinimap: true,
  controlsHelp: true,
};

const initialTransactions: GameTransaction[] = [
  {
    id: 'tx_init',
    type: 'income',
    category: 'chanda',
    title: 'Pocket Starting Cash',
    titleBn: 'শুরুর পকেট খরচ',
    amount: 500,
    timestamp: '০৯:০০',
  },
];

function computeNearestZoneId(pos: [number, number, number]): string {
  let nearestId = CITY_ZONES[0].id;
  let minD = Infinity;
  for (const z of CITY_ZONES) {
    const d = (z.position[0] - pos[0]) ** 2 + (z.position[2] - pos[2]) ** 2;
    if (d < minD) {
      minD = d;
      nearestId = z.id;
    }
  }
  return nearestId;
}

const defaultEquippedOutfit: EquippedOutfit = {
  shirt: 'shirt_black_polo',
  bottom: 'bottom_black_cargo',
  glasses: 'glasses_black_shades',
  hat: 'hat_none',
  shoes: 'shoes_combat_boots',
  watch: 'watch_none',
  necklace: 'necklace_none',
};

let notifyTimeoutId: ReturnType<typeof setTimeout> | null = null;
let eventTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  gameMode: 'menu',
  activeModal: null,
  selectedVehicle: null,
  heroExpression: 'neutral',
  notificationMessage: null,
  screenShakeTick: 0,
  currentZoneId: 'bazaar',
  activeBrawl: null,
  comicHitPopup: null,
  chandaCallout: null,

  playerStats: { ...initialPlayerStats },
  playerPosition: [0, 0, 12],
  playerRotation: 0,
  equipped: { ...defaultEquippedOutfit },

  timeOfDay: 'morning',
  weather: 'sunny',
  gameTimeMinutes: 540,
  activeEvent: null,

  shops: SHOPS_DATA.map((s) => ({ ...s })),
  vehicles: VEHICLES_DATA.map((v) => ({ ...v })),
  destructibles: INITIAL_DESTRUCTIBLE_OBJECTS.map((d) => ({ ...d })),
  missions: INITIAL_MISSIONS.map((m) => ({ ...m })),
  businesses: INITIAL_BUSINESS_ITEMS.map((b) => ({ ...b })),
  customizations: INITIAL_CUSTOMIZATION.map((c) => ({ ...c })),
  inventory: INITIAL_INVENTORY.map((i) => ({ ...i })),
  achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
  transactions: [...initialTransactions],
  settings: { ...initialSettings },
  activeDelivery: null,
  visitedShopIds: [],
  demandedChandaShopIds: [],
  shopCooldowns: {},
  vehicleCooldowns: {},
  policeState: {
    status: 'idle',
    displaySec: 0,
    lastShopId: null,
    pendingShopId: null,
    lastPoliceFine: 0,
    noticeIndex: 0,
  },

  setGameMode: (mode) => {
    set({ gameMode: mode });
    if (mode === 'playing') {
      const { weather, policeState, activeModal } = get();
      if (policeState.status !== 'caught' && activeModal !== 'police_encounter') {
        soundManager.startBGM();
      }
      soundManager.setRain(weather === 'rainy' || weather === 'stormy');
    } else {
      soundManager.stopBGM(mode === 'menu');
      soundManager.stopShopChandaAudio();
      if (mode === 'menu') {
        soundManager.setRain(false);
        soundManager.stopPoliceCaughtAudio();
        soundManager.stopPoliceReleaseAudio();
      }
    }
  },

  openModal: (modal) => {
    soundManager.playDialogueBlip(1.2);
    set({ activeModal: modal });
  },

  closeModal: () => {
    const wasPoliceNotice = get().activeModal === 'police_encounter';
    set({ activeModal: null, selectedVehicle: null });
    if (wasPoliceNotice) {
      soundManager.stopPoliceCaughtAudio();
      soundManager.playPoliceReleaseAudio();
      if (get().gameMode === 'playing') {
        soundManager.startBGM();
      }
    }
  },

  setSelectedVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
  },

  setHeroExpression: (expr) => {
    set({ heroExpression: expr });
  },

  notify: (title, subtitle, type = 'info') => {
    if (notifyTimeoutId !== null) {
      clearTimeout(notifyTimeoutId);
    }
    set({ notificationMessage: { title, subtitle, type } });
    notifyTimeoutId = setTimeout(() => {
      notifyTimeoutId = null;
      set({ notificationMessage: null });
    }, 3800);
  },

  setPlayerPosition: (pos, rot) => {
    const zoneId = computeNearestZoneId(pos);
    set((state) => ({
      playerPosition: pos,
      playerRotation: rot !== undefined ? rot : state.playerRotation,
      currentZoneId: zoneId,
    }));
  },

  processTransaction: (type, category, amount, title, titleBn, silent = false) => {
    const cleanAmount = Math.round(amount);
    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) return false;

    const { playerStats } = get();
    if (type === 'expense' && playerStats.balance < cleanAmount) {
      if (!silent) {
        soundManager.playHit();
        get().notify('পর্যাপ্ত টাকা নেই!', `প্রয়োজন: ৳${cleanAmount} (পকেটে আছে ৳${playerStats.balance})`, 'warning');
      }
      return false;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    set((state) => {
      const nextBalance =
        type === 'income'
          ? state.playerStats.balance + cleanAmount
          : Math.max(0, state.playerStats.balance - cleanAmount);

      const newTx: GameTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        category,
        title,
        titleBn,
        amount: cleanAmount,
        timestamp: timeStr,
      };

      return {
        playerStats: {
          ...state.playerStats,
          balance: nextBalance,
          totalCollected:
            type === 'income'
              ? state.playerStats.totalCollected + cleanAmount
              : state.playerStats.totalCollected,
          dailyIncome:
            type === 'income'
              ? state.playerStats.dailyIncome + cleanAmount
              : state.playerStats.dailyIncome,
          totalExpenses:
            type === 'expense'
              ? state.playerStats.totalExpenses + cleanAmount
              : state.playerStats.totalExpenses,
        },
        transactions: [newTx, ...state.transactions.slice(0, 59)],
      };
    });

    if (type === 'income') {
      soundManager.playCash();
      get().updateMissionProgress('earn', get().playerStats.balance);
      if (!silent) get().notify(`+৳${cleanAmount}`, titleBn, 'success');
    } else if (!silent) {
      get().notify(`-৳${cleanAmount}`, titleBn, 'warning');
    }

    get().saveGame();
    return true;
  },

  addMoney: (amount, title, titleBn, category = 'chanda') => {
    return get().processTransaction('income', category, amount, title, titleBn, false);
  },

  spendMoney: (amount, title, titleBn, category = 'shop') => {
    return get().processTransaction('expense', category, amount, title, titleBn, false);
  },

  addXP: (amount) => {
    if (amount <= 0) return;
    const { playerStats } = get();
    const currentXp = playerStats.xp + Math.round(amount);
    let currentLevel = playerStats.level;
    let nextLevel = PROGRESSION_LEVELS.find((l) => l.level === currentLevel + 1);

    let leveledUp = false;
    while (nextLevel && currentXp >= nextLevel.reqXp) {
      currentLevel++;
      leveledUp = true;
      nextLevel = PROGRESSION_LEVELS.find((l) => l.level === currentLevel + 1);
    }

    const nextXp = nextLevel ? nextLevel.reqXp : currentXp + 5000;

    set((state) => ({
      playerStats: {
        ...state.playerStats,
        xp: currentXp,
        level: currentLevel,
        nextLevelXp: nextXp,
      },
    }));

    if (leveledUp) {
      soundManager.playMissionComplete();
      const currentLevelData = PROGRESSION_LEVELS.find((l) => l.level === currentLevel);
      get().notify(
        `লেভেল আপ! Level ${currentLevel}: ${currentLevelData?.titleBn}`,
        `নতুন সুবিধা: ${currentLevelData?.perk}`,
        'success'
      );
    }
  },

  adjustReputation: (delta) => {
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        reputation: Math.max(0, Math.min(100, state.playerStats.reputation + delta)),
      },
    }));
  },

  setWantedStars: (stars) => {
    const clamped = Math.max(0, Math.min(5, stars));
    const prev = get().playerStats.wantedStars;
    if (clamped > prev) {
      soundManager.playPoliceSiren();
      get().notify(
        `ওয়ান্টেড লেভেল: ${'★'.repeat(clamped)}`,
        '৭ সেকেন্ড পুলিশ আপনার পিছু নেবে — দৌড়ে পালান!',
        'danger'
      );
    } else if (clamped < prev && clamped === 0) {
      get().updateMissionProgress('evade_police', 1);
      set((state) => ({
        achievements: state.achievements.map((a) =>
          a.id === 'ach_police_evade' ? { ...a, unlocked: true } : a
        ),
      }));
      get().notify('পুলিশ ধাওয়া থামিয়েছে!', '৭ সেকেন্ড পর পুলিশ আর পিছু দৌড়াচ্ছে না।', 'info');
    }

    set((state) => ({
      playerStats: {
        ...state.playerStats,
        wantedStars: clamped,
      },
      policeState:
        clamped > 0 && state.policeState.status === 'idle'
          ? {
              ...state.policeState,
              status: 'chasing',
              displaySec: 7,
            }
          : clamped === 0
          ? {
              ...state.policeState,
              status: 'idle',
              displaySec: 0,
              pendingShopId: null,
            }
          : state.policeState,
    }));
  },

  reportVangchurToPolice: (shopId) => {
    const targetShopId = shopId || 'street_prop';
    const { policeState, playerStats, activeEvent } = get();
    if (policeState.status === 'chasing' || policeState.status === 'arriving' || policeState.status === 'caught') {
      return;
    }

    if (policeState.lastShopId === null) {
      const inc = activeEvent?.effect === 'police_boost' ? 2 : 1;
      set((state) => ({
        policeState: {
          ...state.policeState,
          status: 'chasing',
          displaySec: 7,
          lastShopId: targetShopId,
          pendingShopId: null,
        },
      }));
      get().setWantedStars(Math.min(5, Math.max(1, playerStats.wantedStars + inc)));
    } else if (targetShopId !== policeState.lastShopId) {
      set((state) => ({
        policeState: {
          ...state.policeState,
          status: 'arriving',
          displaySec: 5,
          pendingShopId: targetShopId,
        },
      }));
      get().notify('ভাঙচুরের খবর থানায় গেছে!', '৫ সেকেন্ড পর পুলিশ ঘটনাস্থলে আসবে!', 'warning');
    }
  },

  activateArrivedPoliceChase: () => {
    const { policeState, playerStats, activeEvent } = get();
    const targetShopId = policeState.pendingShopId || policeState.lastShopId;
    const inc = activeEvent?.effect === 'police_boost' ? 2 : 1;
    set((state) => ({
      policeState: {
        ...state.policeState,
        status: 'chasing',
        displaySec: 7,
        lastShopId: targetShopId,
        pendingShopId: null,
      },
    }));
    get().setWantedStars(Math.min(5, Math.max(1, playerStats.wantedStars + inc)));
  },

  endPoliceChase: () => {
    if (get().playerStats.wantedStars > 0) {
      get().setWantedStars(0);
    } else {
      set((state) => ({
        policeState: {
          ...state.policeState,
          status: 'idle',
          displaySec: 0,
          pendingShopId: null,
        },
      }));
    }
  },

  setPoliceDisplaySec: (sec) => {
    if (get().policeState.displaySec !== sec) {
      set((state) => ({
        policeState: {
          ...state.policeState,
          displaySec: sec,
        },
      }));
    }
  },

  caughtByPolice: () => {
    if (get().policeState.status === 'caught') return;
    soundManager.stopBGM(true);
    soundManager.playPoliceCaughtAudio();
    set((state) => ({
      heroExpression: 'shocked',
      screenShakeTick: state.screenShakeTick + 1,
      policeState: {
        ...state.policeState,
        status: 'caught',
        displaySec: 2,
      },
    }));

    get().notify(
      'হাতেনাতে ধরা খাইছেন মামা!',
      'পুলিশ ধরে ফেলেছে — ২ সেকেন্ড পর থানার নোটিশ আসছে!',
      'danger'
    );
  },

  showPoliceEncounterNotice: () => {
    const { playerStats, policeState } = get();
    const fine = Math.min(playerStats.balance, 150 + playerStats.wantedStars * 100);
    if (fine > 0) {
      get().processTransaction('expense', 'fine', fine, 'Police Fine', 'থানায় জরিমানা আদায়', true);
    }

    const totalNotices = 8;
    const step = 1 + Math.floor(Math.random() * (totalNotices - 1));
    const nextNoticeIndex = (policeState.noticeIndex + step) % totalNotices;

    set((state) => ({
      heroExpression: 'angry',
      playerStats: {
        ...state.playerStats,
        wantedStars: 0,
        timesCaught: state.playerStats.timesCaught + 1,
        reputation: Math.max(10, state.playerStats.reputation - 15),
      },
      policeState: {
        ...state.policeState,
        status: 'idle',
        displaySec: 0,
        pendingShopId: null,
        lastPoliceFine: fine,
        noticeIndex: nextNoticeIndex,
      },
      playerPosition: [-18, 0, 84],
      currentZoneId: 'police_station',
      activeModal: 'police_encounter',
    }));
  },

  markShopVisited: (shopId) => {
    const { visitedShopIds } = get();
    if (!visitedShopIds.includes(shopId)) {
      const nextVisited = [...visitedShopIds, shopId];
      set({ visitedShopIds: nextVisited });
      get().updateMissionProgress('visit_shops', 1);
      get().checkAchievements();
    }
  },

  recordNegotiationWin: (shopId) => {
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        negotiationsWon: state.playerStats.negotiationsWon + 1,
        reputation: Math.min(100, state.playerStats.reputation + 2),
      },
      shopCooldowns: {
        ...state.shopCooldowns,
        [shopId]: Date.now() + 45000, // 45s cooldown per shop
      },
    }));
    get().updateMissionProgress('negotiate', 1);
    get().checkAchievements();
    get().saveGame();
  },

  setVehicleCooldown: (vehicleId, durationMs = 55000) => {
    set((state) => ({
      vehicleCooldowns: {
        ...state.vehicleCooldowns,
        [vehicleId]: Date.now() + durationMs,
      },
    }));
  },

  triggerChandaCallout: (shopNameBn, shopId) => {
    if (shopId && get().demandedChandaShopIds.includes(shopId)) {
      return;
    }
    if (shopId) {
      set((state) => ({
        demandedChandaShopIds: state.demandedChandaShopIds.includes(shopId)
          ? state.demandedChandaShopIds
          : [...state.demandedChandaShopIds, shopId],
      }));
    }
    soundManager.playChandaDeVoice(true, true, shopId);
    const tick = Date.now();
    set({ chandaCallout: { shopName: shopNameBn, tick } });
    setTimeout(() => {
      if (get().chandaCallout?.tick === tick) {
        set({ chandaCallout: null });
      }
    }, 3200);
  },

  damageShopBrawl: (shopId, keeperDmg, resistanceDmg, hitWord) => {
    const state = get();
    let brawl = state.activeBrawl;
    if (!brawl || brawl.shopId !== shopId) {
      const cooldownUntil = state.shopCooldowns[shopId] || 0;
      const remSec = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (remSec > 0) {
        get().notify(
          'দোকানদার একটু আগেই টাকা দিয়েছে!',
          `${remSec} সেকেন্ড পর আবার এই দোকানে হানা দিতে পারবেন।`,
          'info'
        );
        return;
      }

      const shop = state.shops.find((s) => s.id === shopId);
      if (!shop) return;
      const eventMult = state.activeEvent?.effect === 'double_chanda' ? 1.5 : 1.0;
      brawl = {
        shopId: shop.id,
        shopNameBn: shop.nameBn,
        ownerName: shop.ownerName,
        keeperHp: 100,
        maxKeeperHp: 100,
        shopResistance: 100,
        maxResistance: 100,
        surrendered: false,
        rewardMoney: Math.round(shop.baseContribution * 1.4 * eventMult),
      };
    }

    if (brawl.surrendered) return;

    const nextHp = Math.max(0, brawl.keeperHp - keeperDmg);
    const nextRes = Math.max(0, brawl.shopResistance - resistanceDmg);
    const surrendered = nextHp <= 0 || nextRes <= 0;

    const words = ['ধুম!', 'ঠাস!', 'ভাঙ!', 'চান্দা দে!', 'ফটাশ!'];
    const popupText = hitWord || words[Math.floor(Math.random() * words.length)];
    const popupId = Date.now() + Math.random();

    set((s) => ({
      activeBrawl: {
        ...brawl!,
        keeperHp: nextHp,
        shopResistance: nextRes,
        surrendered,
      },
      comicHitPopup: { id: popupId, text: popupText },
      screenShakeTick: s.screenShakeTick + 1,
    }));

    setTimeout(() => {
      if (get().comicHitPopup?.id === popupId) {
        set({ comicHitPopup: null });
      }
    }, 650);

    if (surrendered) {
      soundManager.playShopSurrender();
      const shop = get().shops.find((s) => s.id === shopId);
      get().addMoney(
        brawl.rewardMoney,
        `Force Chanda: ${shop?.name || shopId}`,
        `ভাঙচুরের চাপে ${brawl.shopNameBn} থেকে আদায়`,
        'chanda'
      );
      get().addXP(100);
      get().recordNegotiationWin(shopId);
      get().reportVangchurToPolice(shopId);
      get().notify(
        `দোকানদার নতি স্বীকার করেছে! +৳${brawl.rewardMoney}`,
        `${brawl.ownerName} ভয় পেয়ে হাতে নগদ টাকা তুলে দিয়েছেন!`,
        'success'
      );

      setTimeout(() => {
        if (get().activeBrawl?.shopId === shopId && get().activeBrawl?.surrendered) {
          set({ activeBrawl: null });
        }
      }, 2400);
    } else {
      get().reportVangchurToPolice(shopId);
    }
  },

  startDeliveryJob: (fromNameBn) => {
    if (get().activeDelivery) {
      get().notify('আগে বর্তমান ডেলিভারি শেষ করুন!', get().activeDelivery!.toZoneNameBn, 'warning');
      return null;
    }
    const candidates = fromNameBn
      ? DELIVERY_JOBS_POOL.filter((j) => j.fromNameBn.includes(fromNameBn.slice(0, 6)))
      : DELIVERY_JOBS_POOL;
    const pool = candidates.length > 0 ? candidates : DELIVERY_JOBS_POOL;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const job: DeliveryJob = {
      ...chosen,
      id: `deliv_${Date.now()}`,
      startedAt: Date.now(),
    };
    set({ activeDelivery: job });
    soundManager.playRickshawBell();
    get().notify(
      `নতুন ডেলিভারি কাজ: ${job.titleBn}`,
      `গন্তব্য: ${job.toZoneNameBn} • পুরষ্কার: ৳${job.rewardMoney}`,
      'info'
    );
    return job;
  },

  completeActiveDelivery: () => {
    const job = get().activeDelivery;
    if (!job) return false;

    set({ activeDelivery: null });
    soundManager.playMissionComplete();
    get().addMoney(job.rewardMoney, `Delivery: ${job.toZoneNameBn}`, `ডেলিভারি সম্পন্ন: ${job.titleBn}`, 'delivery');
    get().addXP(job.rewardXP);

    set((state) => ({
      playerStats: {
        ...state.playerStats,
        deliveriesCompleted: state.playerStats.deliveriesCompleted + 1,
        reputation: Math.min(100, state.playerStats.reputation + 5),
      },
    }));

    get().updateMissionProgress('deliver', 1);
    get().checkAchievements();
    get().saveGame();
    return true;
  },

  cancelDeliveryJob: () => {
    set({ activeDelivery: null });
    get().notify('ডেলিভারি বাতিল করা হয়েছে', 'নতুন পার্সেল চাইলে ডেলিভারি ভ্যানের সামনে গিয়ে [E] চাপুন।', 'info');
  },

  damageObject: (id, damage = 45) => {
    const { destructibles } = get();
    const target = destructibles.find((d) => d.id === id);
    if (!target || target.isDestroyed) return;

    soundManager.playHit();

    const newHealth = Math.max(0, target.health - damage);
    const becameDestroyed = target.health > 0 && newHealth === 0;

    const updated = destructibles.map((obj) =>
      obj.id === id
        ? {
            ...obj,
            health: newHealth,
            isDestroyed: newHealth === 0,
            lastDamagedTime: Date.now(),
          }
        : obj
    );

    set((state) => ({
      destructibles: updated,
      screenShakeTick: state.screenShakeTick + 1,
      playerStats: {
        ...state.playerStats,
        objectsDestroyedCount: state.playerStats.objectsDestroyedCount + (becameDestroyed ? 1 : 0),
        reputation: Math.max(10, state.playerStats.reputation - (becameDestroyed ? 5 : 1)),
      },
    }));

    if (becameDestroyed) {
      soundManager.playBreak();
      get().reportVangchurToPolice(target.shopId || target.id);
      get().notify('ভাঙচুর!', `"${target.nameBn}" চূর্ণ-বিচূর্ণ!`, 'warning');
    }
    get().saveGame();
  },

  repairObject: (id) => {
    const { destructibles, playerStats } = get();
    const target = destructibles.find((d) => d.id === id);
    if (!target || (!target.isDestroyed && target.health >= target.maxHealth)) return false;

    const damageRatio = target.isDestroyed ? 1 : Math.max(0.25, 1 - target.health / target.maxHealth);
    const exactCost = Math.max(15, Math.round(target.repairCost * damageRatio));

    if (playerStats.balance < exactCost) {
      get().notify('মেরামত খরচের টাকা নেই!', `প্রয়োজন: ৳${exactCost}`, 'warning');
      return false;
    }

    soundManager.playHammerRepair();
    get().spendMoney(exactCost, `Repair ${target.name}`, `${target.nameBn} মেরামত`, 'repair');

    const updated = destructibles.map((obj) =>
      obj.id === id ? { ...obj, health: obj.maxHealth, isDestroyed: false } : obj
    );

    set((state) => ({
      destructibles: updated,
      playerStats: {
        ...state.playerStats,
        repairedCount: state.playerStats.repairedCount + 1,
        totalRepairExpenses: state.playerStats.totalRepairExpenses + exactCost,
        reputation: Math.min(100, state.playerStats.reputation + 4),
      },
    }));

    get().updateMissionProgress('repair', 1);
    get().checkAchievements();
    get().notify('মেরামত সম্পন্ন!', `"${target.nameBn}" আগের মতো ঝকঝকে হয়েছে!`, 'success');
    get().saveGame();
    return true;
  },

  repairAllObjects: () => {
    const { destructibles, playerStats } = get();
    const damaged = destructibles.filter((d) => d.isDestroyed || d.health < d.maxHealth);
    if (damaged.length === 0) {
      get().notify('কোনো ক্ষতিগ্রস্ত বস্তু নেই!', 'শহরের সব জিনিস একদম ঠিক আছে!', 'info');
      return false;
    }

    const totalCost = damaged.reduce((sum, item) => {
      const ratio = item.isDestroyed ? 1 : Math.max(0.25, 1 - item.health / item.maxHealth);
      return sum + Math.max(15, Math.round(item.repairCost * ratio));
    }, 0);

    if (playerStats.balance < totalCost) {
      get().notify('পর্যাপ্ত টাকা নেই!', `মোট মেরামত খরচ: ৳${totalCost}`, 'warning');
      return false;
    }

    soundManager.playHammerRepair();
    get().spendMoney(totalCost, 'Repair All City Props', 'শহরের সব ক্ষতিগ্রস্ত জিনিস মেরামত', 'repair');

    const updated = destructibles.map((obj) => ({
      ...obj,
      health: obj.maxHealth,
      isDestroyed: false,
    }));

    set((state) => ({
      destructibles: updated,
      playerStats: {
        ...state.playerStats,
        repairedCount: state.playerStats.repairedCount + damaged.length,
        totalRepairExpenses: state.playerStats.totalRepairExpenses + totalCost,
        reputation: Math.min(100, state.playerStats.reputation + damaged.length * 4),
      },
    }));

    get().updateMissionProgress('repair', damaged.length);
    get().checkAchievements();
    get().notify('সব মেরামত শেষ!', `${damaged.length}টি জিনিস পুনরায় সচল করা হলো!`, 'success');
    get().saveGame();
    return true;
  },

  updateMissionProgress: (type, count = 1) => {
    set((state) => {
      const updatedMissions = state.missions.map((m) => {
        if (m.type === type && !m.completed) {
          const newCount = type === 'earn' ? count : m.currentCount + count;
          const isDone = newCount >= m.targetCount;
          if (isDone && !m.completed) {
            soundManager.playMissionComplete();
            get().notify(
              `মিশন সম্পন্ন: ${m.titleBn}!`,
              `পুরষ্কার ৳${m.rewardMoney} + ${m.rewardXP} XP! মিশন প্যানেল থেকে সংগ্রহ করুন।`,
              'success'
            );
          }
          return {
            ...m,
            currentCount: Math.min(m.targetCount, newCount),
            completed: isDone,
          };
        }
        return m;
      });
      return { missions: updatedMissions };
    });
  },

  claimMissionReward: (missionId) => {
    const { missions } = get();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    set((state) => ({
      missions: state.missions.map((m) => (m.id === missionId ? { ...m, claimed: true } : m)),
    }));
    get().addMoney(mission.rewardMoney, `Mission: ${mission.title}`, `মিশন পুরষ্কার: ${mission.titleBn}`, 'mission');
    get().addXP(mission.rewardXP);
    get().saveGame();
  },

  checkAchievements: () => {
    const { playerStats, visitedShopIds, businesses, achievements } = get();
    const hasOwnedBiz = businesses.some((b) => b.owned);

    const updated = achievements.map((ach) => {
      if (ach.unlocked) return ach;
      let unlock = false;
      if (ach.id === 'ach_first_chanda' && playerStats.negotiationsWon >= 1) unlock = true;
      if (ach.id === 'ach_explorer' && visitedShopIds.length >= 5) unlock = true;
      if (ach.id === 'ach_smash_fix' && playerStats.repairedCount >= 3) unlock = true;
      if (ach.id === 'ach_delivery_pro' && playerStats.deliveriesCompleted >= 2) unlock = true;
      if (ach.id === 'ach_tycoon' && hasOwnedBiz) unlock = true;
      if (unlock) {
        soundManager.playMissionComplete();
        get().notify(`নতুন অর্জন আনলক: ${ach.titleBn}!`, 'অর্জন প্যানেল থেকে বোনাস সংগ্রহ করুন।', 'success');
        return { ...ach, unlocked: true };
      }
      return ach;
    });

    set({ achievements: updated });
  },

  claimAchievement: (achievementId) => {
    const ach = get().achievements.find((a) => a.id === achievementId);
    if (!ach || !ach.unlocked || ach.claimed) return;

    set((state) => ({
      achievements: state.achievements.map((a) => (a.id === achievementId ? { ...a, claimed: true } : a)),
    }));
    get().addMoney(ach.rewardMoney, `Achievement: ${ach.title}`, `অর্জন বোনাস: ${ach.titleBn}`, 'mission');
    get().addXP(ach.rewardXP);
    get().saveGame();
  },

  buyBusiness: (id) => {
    const { businesses } = get();
    const biz = businesses.find((b) => b.id === id);
    if (!biz || biz.owned) return false;

    if (!get().spendMoney(biz.cost, `Purchased ${biz.name}`, `${biz.nameBn} ক্রয়`, 'business')) {
      return false;
    }

    soundManager.playMissionComplete();
    set({
      businesses: businesses.map((b) => (b.id === id ? { ...b, owned: true } : b)),
    });

    get().updateMissionProgress('upgrade_business', 1);
    get().addXP(250);
    get().checkAchievements();
    get().notify('নতুন ব্যবসা মালিক!', `${biz.nameBn} এখন আপনার! নিয়মিত আয় শুরু হলো।`, 'success');
    return true;
  },

  upgradeBusiness: (id) => {
    const { businesses } = get();
    const biz = businesses.find((b) => b.id === id);
    if (!biz || !biz.owned || biz.level >= biz.maxLevel) return false;

    if (!get().spendMoney(biz.upgradeCost, `Upgraded ${biz.name}`, `${biz.nameBn} লেভেল আপ`, 'business')) {
      return false;
    }

    soundManager.playCash();
    set({
      businesses: businesses.map((b) =>
        b.id === id
          ? {
              ...b,
              level: b.level + 1,
              incomePerMinute: Math.round(b.incomePerMinute * 1.5),
              upgradeCost: Math.round(b.upgradeCost * 1.6),
            }
          : b
      ),
    });
    get().addXP(150);
    get().notify('ব্যবসা উন্নত হলো!', `${biz.nameBn} এখন লেভেল ${biz.level + 1}!`, 'success');
    return true;
  },

  collectPassiveIncome: () => {
    const { businesses, playerStats } = get();
    const baseIncome = businesses.filter((b) => b.owned).reduce((sum, b) => sum + b.incomePerMinute, 0);
    if (baseIncome <= 0) return;

    const bonusMultiplier = playerStats.level >= 7 ? 1.5 : 1;
    const finalIncome = Math.round(baseIncome * bonusMultiplier);

    get().processTransaction(
      'income',
      'business',
      finalIncome,
      'Business Empire Dividend',
      'ব্যবসা প্রতিষ্ঠান থেকে লভ্যাংশ',
      true
    );
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        businessIncomeEarned: state.playerStats.businessIncomeEarned + finalIncome,
      },
    }));
    get().notify(`ব্যবসার আয়: +৳${finalIncome}`, 'ফ্র্যাঞ্চাইজি ও ফ্লিট থেকে নিয়মিত আয় জমা হয়েছে।', 'info');
  },

  useInventoryItem: (id) => {
    const item = get().inventory.find((i) => i.id === id);
    if (!item || !item.usable || item.quantity <= 0) return false;

    if (id === 'inv_malai_cha') {
      get().adjustReputation(10);
      soundManager.playDialogueBlip(1.4);
      get().notify('আহা, দারুণ মালাই চা!', 'সম্মান +১০% বেড়েছে!', 'success');
    } else if (id === 'inv_samosa_plate') {
      const currentStars = get().playerStats.wantedStars;
      if (currentStars > 0) {
        get().setWantedStars(currentStars - 1);
        get().notify('সিঙ্গারা কাজে লেগেছে!', 'পুলিশ খুশি হয়ে ওয়ান্টেড স্টার ১টি কমিয়েছে!', 'success');
      } else {
        soundManager.playDialogueBlip(1.2);
        get().adjustReputation(5);
        get().notify('গরম সিঙ্গারা খাওয়া হলো!', 'মেজাজ ভালো হয়ে সম্মান +৫% বাড়ল!', 'info');
      }
    }

    set((state) => ({
      inventory: state.inventory
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0 || !i.usable),
    }));
    get().saveGame();
    return true;
  },

  addInventoryItem: (newItem) => {
    set((state) => {
      const existing = state.inventory.find((i) => i.id === newItem.id);
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
          ),
        };
      }
      return { inventory: [...state.inventory, newItem] };
    });
  },

  buyCustomization: (id) => {
    const { customizations } = get();
    const item = customizations.find((c) => c.id === id);
    if (!item || item.unlocked) return false;

    if (!get().spendMoney(item.price, `Bought ${item.name}`, `${item.nameBn} কেনা`, 'shop')) {
      return false;
    }

    soundManager.playCash();
    set({
      customizations: customizations.map((c) => (c.id === id ? { ...c, unlocked: true } : c)),
    });
    get().equipCustomization(item.type, item.id);
    get().notify('নতুন পোশাক আনলক!', `${item.nameBn} পরা হয়েছে!`, 'success');
    return true;
  },

  equipCustomization: (type, id) => {
    soundManager.playDialogueBlip(1.4);
    set((state) => ({
      equipped: {
        ...state.equipped,
        [type]: id,
      },
    }));
    get().saveGame();
  },

  advanceGameTime: (deltaMinutes) => {
    const { gameTimeMinutes } = get();
    const newTime = (gameTimeMinutes + deltaMinutes) % 1440;

    let timeLabel: TimeOfDay = 'morning';
    if (newTime >= 360 && newTime < 720) timeLabel = 'morning';
    else if (newTime >= 720 && newTime < 1020) timeLabel = 'afternoon';
    else if (newTime >= 1020 && newTime < 1200) timeLabel = 'evening';
    else timeLabel = 'night';

    // Reset daily income counter at midnight
    if (newTime < gameTimeMinutes) {
      set((state) => ({
        playerStats: { ...state.playerStats, dailyIncome: 0 },
      }));
    }

    // Passive business tick every ~15 game minutes
    if (Math.floor(newTime / 15) !== Math.floor(gameTimeMinutes / 15)) {
      get().collectPassiveIncome();
    }

    // Random event trigger occasionally
    if (Math.random() < 0.006 * deltaMinutes && !get().activeEvent) {
      get().triggerRandomEvent();
    }

    set({ gameTimeMinutes: newTime, timeOfDay: timeLabel });
  },

  triggerRandomEvent: () => {
    const ev = RANDOM_CITY_EVENTS[Math.floor(Math.random() * RANDOM_CITY_EVENTS.length)];
    soundManager.playRickshawBell();
    set({
      activeEvent: {
        id: ev.id,
        title: ev.title,
        titleBn: ev.titleBn,
        description: ev.description,
        effect: ev.effect,
        durationMs: ev.durationMs,
        startTime: Date.now(),
      },
    });

    get().notify(`বিশেষ ঘটনা: ${ev.titleBn}`, ev.description, 'warning');

    if (eventTimeoutId !== null) {
      clearTimeout(eventTimeoutId);
    }
    eventTimeoutId = setTimeout(() => {
      eventTimeoutId = null;
      if (get().activeEvent?.id === ev.id) {
        get().clearEvent();
      }
    }, ev.durationMs);
  },

  clearEvent: () => {
    if (eventTimeoutId !== null) {
      clearTimeout(eventTimeoutId);
      eventTimeoutId = null;
    }
    set({ activeEvent: null });
  },

  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    soundManager.setSettings(
      newSettings.soundEnabled,
      newSettings.musicEnabled,
      newSettings.sfxVolume,
      newSettings.musicVolume
    );
    const { gameMode, weather } = get();
    soundManager.setRain(
      newSettings.soundEnabled &&
        gameMode === 'playing' &&
        (weather === 'rainy' || weather === 'stormy')
    );
    get().saveGame();
  },

  saveGame: () => {
    try {
      const state = get();
      const payload = {
        playerStats: state.playerStats,
        playerPosition: state.playerPosition,
        playerRotation: state.playerRotation,
        equipped: state.equipped,
        businesses: state.businesses,
        customizations: state.customizations,
        destructibles: state.destructibles,
        missions: state.missions,
        inventory: state.inventory,
        achievements: state.achievements,
        visitedShopIds: state.visitedShopIds,
        transactions: state.transactions,
        settings: state.settings,
        gameTimeMinutes: state.gameTimeMinutes,
        timeOfDay: state.timeOfDay,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save game to localStorage', e);
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      const mergedStats: PlayerStats = { ...initialPlayerStats, ...(data.playerStats || {}) };
      if (!mergedStats.name || mergedStats.name.includes('Boss Mama')) {
        mergedStats.name = 'Chanda Bhai';
      }
      const mergedSettings: GameSettings = { ...initialSettings, ...(data.settings || {}) };

      // Ensure new destructible coordinates from cityData replace stale saved positions if keys changed
      const savedDestructibles: DestructibleObject[] = Array.isArray(data.destructibles)
        ? INITIAL_DESTRUCTIBLE_OBJECTS.map((base) => {
            const match = data.destructibles.find((d: DestructibleObject) => d.id === base.id);
            return match
              ? { ...base, health: match.health ?? base.maxHealth, isDestroyed: Boolean(match.isDestroyed) }
              : { ...base };
          })
        : INITIAL_DESTRUCTIBLE_OBJECTS.map((d) => ({ ...d }));

      // Merge customizations cleanly so new items from updates appear without losing unlocked items
      const savedCustomizations: CustomizationItem[] = Array.isArray(data.customizations)
        ? INITIAL_CUSTOMIZATION.map((base) => {
            const match = data.customizations.find((c: CustomizationItem) => c.id === base.id);
            return match ? { ...base, unlocked: Boolean(match.unlocked) } : { ...base };
          })
        : INITIAL_CUSTOMIZATION.map((c) => ({ ...c }));

      const rawEquipped: EquippedOutfit = {
        ...defaultEquippedOutfit,
        ...(data.equipped || {}),
      };
      const isUntouchedLegacyDefault =
        rawEquipped.shirt === 'shirt_black_floral' &&
        rawEquipped.bottom === 'bottom_black_cargo' &&
        rawEquipped.glasses === 'glasses_black_shades' &&
        rawEquipped.hat === 'hat_none' &&
        rawEquipped.shoes === 'shoes_white_red' &&
        rawEquipped.watch === 'watch_gold_black' &&
        rawEquipped.necklace === 'necklace_none';
      const mergedEquipped: EquippedOutfit = isUntouchedLegacyDefault
        ? { ...defaultEquippedOutfit }
        : rawEquipped;

      const savedBusinesses: BusinessItem[] = Array.isArray(data.businesses)
        ? INITIAL_BUSINESS_ITEMS.map((base) => {
            const match = data.businesses.find((b: BusinessItem) => b.id === base.id);
            return match
              ? {
                  ...base,
                  owned: Boolean(match.owned),
                  level: match.level ?? base.level,
                  incomePerMinute: match.incomePerMinute ?? base.incomePerMinute,
                  upgradeCost: match.upgradeCost ?? base.upgradeCost,
                }
              : { ...base };
          })
        : INITIAL_BUSINESS_ITEMS.map((b) => ({ ...b }));

      const savedMissions: Mission[] = Array.isArray(data.missions)
        ? INITIAL_MISSIONS.map((base) => {
            const match = data.missions.find((m: Mission) => m.id === base.id);
            return match
              ? {
                  ...base,
                  currentCount: match.currentCount ?? 0,
                  completed: Boolean(match.completed),
                  claimed: Boolean(match.claimed),
                }
              : { ...base };
          })
        : INITIAL_MISSIONS.map((m) => ({ ...m }));

      const savedAchievements: Achievement[] = Array.isArray(data.achievements)
        ? INITIAL_ACHIEVEMENTS.map((base) => {
            const match = data.achievements.find((a: Achievement) => a.id === base.id);
            return match
              ? {
                  ...base,
                  unlocked: Boolean(match.unlocked),
                  claimed: Boolean(match.claimed),
                }
              : { ...base };
          })
        : INITIAL_ACHIEVEMENTS.map((a) => ({ ...a }));

      set({
        playerStats: mergedStats,
        playerPosition: Array.isArray(data.playerPosition) ? data.playerPosition : [0, 0, 12],
        playerRotation: typeof data.playerRotation === 'number' ? data.playerRotation : 0,
        equipped: mergedEquipped,
        businesses: savedBusinesses,
        customizations: savedCustomizations,
        destructibles: savedDestructibles,
        missions: savedMissions,
        inventory: Array.isArray(data.inventory) ? data.inventory : INITIAL_INVENTORY.map((i) => ({ ...i })),
        achievements: savedAchievements,
        visitedShopIds: Array.isArray(data.visitedShopIds) ? data.visitedShopIds : [],
        transactions: Array.isArray(data.transactions) ? data.transactions : [...initialTransactions],
        settings: mergedSettings,
        gameTimeMinutes: typeof data.gameTimeMinutes === 'number' ? data.gameTimeMinutes : 540,
        timeOfDay: data.timeOfDay || 'morning',
        activeModal: null,
        activeBrawl: null,
        policeState: {
          status: 'idle',
          displaySec: 0,
          lastShopId: null,
          pendingShopId: null,
          lastPoliceFine: 0,
          noticeIndex: 0,
        },
      });

      soundManager.setSettings(
        mergedSettings.soundEnabled,
        mergedSettings.musicEnabled,
        mergedSettings.sfxVolume,
        mergedSettings.musicVolume
      );
      get().setGameMode('playing');
      soundManager.playMissionComplete();
      get().notify('খেলার সেভ ফাইল লোড হয়েছে!', 'চান্দা সিটিতে আবার স্বাগতম!', 'success');
      return true;
    } catch (e) {
      console.warn('Failed to load save', e);
      return false;
    }
  },

  resetGame: () => {
    if (eventTimeoutId !== null) {
      clearTimeout(eventTimeoutId);
      eventTimeoutId = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
    set({
      playerStats: { ...initialPlayerStats },
      playerPosition: [0, 0, 12],
      playerRotation: 0,
      currentZoneId: 'bazaar',
      equipped: { ...defaultEquippedOutfit },
      heroExpression: 'neutral',
      businesses: INITIAL_BUSINESS_ITEMS.map((b) => ({ ...b })),
      customizations: INITIAL_CUSTOMIZATION.map((c) => ({ ...c })),
      destructibles: INITIAL_DESTRUCTIBLE_OBJECTS.map((d) => ({ ...d })),
      missions: INITIAL_MISSIONS.map((m) => ({ ...m })),
      inventory: INITIAL_INVENTORY.map((i) => ({ ...i })),
      achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
      visitedShopIds: [],
      demandedChandaShopIds: [],
      shopCooldowns: {},
      vehicleCooldowns: {},
      policeState: {
        status: 'idle',
        displaySec: 0,
        lastShopId: null,
        pendingShopId: null,
        lastPoliceFine: 0,
        noticeIndex: 0,
      },
      activeDelivery: null,
      transactions: [...initialTransactions],
      timeOfDay: 'morning',
      weather: 'sunny',
      gameTimeMinutes: 540,
      activeEvent: null,
      activeModal: null,
      activeBrawl: null,
      comicHitPopup: null,
      chandaCallout: null,
    });
    soundManager.resetShopRefusals();
    soundManager.stopShopChandaAudio();
    soundManager.stopPoliceCaughtAudio();
    soundManager.stopPoliceReleaseAudio();
    soundManager.setRain(false);
    get().setGameMode('playing');
    get().notify('নতুন খেলা শুরু হলো!', 'চান্দা সিটির নতুন যাত্রা শুভ হোক!', 'info');
  },
}));
