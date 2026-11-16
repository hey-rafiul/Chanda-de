export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'stormy';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type HeroExpression = 'neutral' | 'happy' | 'shocked' | 'angry' | 'laugh' | 'thinking';

export type NPCArchetype =
  | 'tea_vendor'
  | 'grocer'
  | 'rickshaw_driver'
  | 'bus_driver'
  | 'police_officer'
  | 'female_citizen'
  | 'boss_villain';

export type NPCMood = 'friendly' | 'busy' | 'alert' | 'cheerful' | 'intimidating';

export interface NPCInteractionAction {
  id: string;
  labelBn: string;
  sublabelBn: string;
  type: 'chat' | 'tea_heal' | 'snack_tip' | 'ride_shortcut' | 'police_bribe' | 'boss_mission' | 'gossip_rep';
  cost?: number;
  rewardMoney?: number;
  rewardXP?: number;
}

export interface WorldNPCData {
  id: string;
  archetype: NPCArchetype;
  name: string;
  nameBn: string;
  roleBn: string;
  zoneId: string;
  position: [number, number, number];
  rotation: number;
  patrolRadius: number;
  patrolSpeed: number;
  mood: NPCMood;
  moodLabelBn: string;
  greetingBn: string;
  dialoguesBn: string[];
  actions: NPCInteractionAction[];
  linkedVehicleId?: string;
}

export interface EquippedOutfit {
  shirt: string;
  bottom: string;
  glasses: string;
  hat: string;
  shoes: string;
  watch: string;
  necklace: string;
}

export interface LocationZone {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  position: [number, number, number];
  color: string;
  icon: string;
  unlocked: boolean;
  minLevel: number;
}

export interface ShopData {
  id: string;
  name: string;
  nameBn: string;
  category:
    | 'tea'
    | 'grocery'
    | 'restaurant'
    | 'clothing'
    | 'electronics'
    | 'vegetable'
    | 'pharmacy'
    | 'mobile'
    | 'hardware'
    | 'bakery'
    | 'salon'
    | 'furniture'
    | 'books'
    | 'tailor'
    | 'gold';
  ownerName: string;
  ownerMood: 'chill' | 'angry' | 'nervous' | 'generous';
  position: [number, number, number];
  rotation: number;
  baseContribution: number;
  currentBalance: number;
  dialogues: {
    greeting: string[];
    reluctant: string[];
    agreed: string[];
    angry: string[];
  };
  hasTask: boolean;
  taskReward: number;
  destructibleProps: string[];
}

export interface VehicleData {
  id: string;
  name: string;
  nameBn: string;
  type: 'rickshaw' | 'cng' | 'bus' | 'truck' | 'car' | 'van' | 'bike';
  driverName: string;
  position: [number, number, number];
  rotation: number;
  fareOrFee: number;
  dialogue: string;
  destinations: string[];
}

export interface DestructibleObject {
  id: string;
  name: string;
  nameBn: string;
  type: 'signboard' | 'table' | 'chair' | 'crate' | 'barrel' | 'umbrella';
  shopId?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  maxHealth: number;
  health: number; // 0 = broken, maxHealth = intact
  isDestroyed: boolean;
  repairCost: number;
  lastDamagedTime: number;
}

export interface Mission {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  rewardMoney: number;
  rewardXP: number;
  type: 'visit_shops' | 'negotiate' | 'deliver' | 'repair' | 'earn' | 'evade_police' | 'upgrade_business';
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
}

export interface BusinessItem {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  cost: number;
  incomePerMinute: number;
  owned: boolean;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  icon: string;
  assistantName?: string;
}

export interface CustomizationItem {
  id: string;
  name: string;
  nameBn: string;
  type: 'shirt' | 'bottom' | 'hat' | 'glasses' | 'shoes' | 'watch' | 'necklace';
  color: string;
  unlocked: boolean;
  price: number;
  styleName: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  category: 'consumable' | 'mission' | 'collectible' | 'decor';
  quantity: number;
  icon: string;
  usable: boolean;
  effectText?: string;
}

export interface Achievement {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  rewardMoney: number;
  rewardXP: number;
  unlocked: boolean;
  claimed: boolean;
  icon: string;
}

export interface DeliveryJob {
  id: string;
  titleBn: string;
  fromNameBn: string;
  toZoneId: string;
  toZoneNameBn: string;
  targetPosition: [number, number, number];
  rewardMoney: number;
  rewardXP: number;
  startedAt: number;
}

export interface ShopBrawlState {
  shopId: string;
  shopNameBn: string;
  ownerName: string;
  keeperHp: number;
  maxKeeperHp: number;
  shopResistance: number;
  maxResistance: number;
  surrendered: boolean;
  rewardMoney: number;
}

export interface PlayerStats {
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  balance: number;
  totalCollected: number;
  totalExpenses: number;
  dailyIncome: number;
  businessIncomeEarned: number;
  reputation: number; // 0 - 100
  wantedStars: number; // 0 - 5
  timesCaught: number;
  objectsDestroyedCount: number;
  totalRepairExpenses: number;
  repairedCount: number;
  deliveriesCompleted: number;
  negotiationsWon: number;
}

export interface GameTransaction {
  id: string;
  type: 'income' | 'expense';
  category: 'chanda' | 'mission' | 'delivery' | 'business' | 'repair' | 'fine' | 'shop' | 'transport';
  title: string;
  titleBn: string;
  amount: number;
  timestamp: string;
}

export interface CityEvent {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  effect: string;
  durationMs: number;
  startTime: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  showMinimap: boolean;
  controlsHelp: boolean;
}
