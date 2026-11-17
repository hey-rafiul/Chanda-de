import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MiniMap } from './MiniMap';
import { SceneInteractionTarget } from '../../game/three/ChandaCityScene';
import { CITY_ZONES, PROGRESSION_LEVELS } from '../../data/cityData';
import {
  Coins,
  ShieldAlert,
  Sun,
  CloudRain,
  Cloud,
  CloudLightning,
  Sparkles,
  MapPin,
  PackageCheck,
  XCircle,
  Swords,
  Volume2,
  Menu,
  X,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface GameHUDProps {
  nearbyTarget: SceneInteractionTarget | null;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onOpenFullMap: () => void;
  onOpenEconomy: () => void;
  onInteract: () => void;
  onSmash: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  nearbyTarget,
  isMenuOpen,
  onToggleMenu,
  onOpenFullMap,
  onOpenEconomy,
  onInteract,
  onSmash,
}) => {
  const playerStats = useGameStore((state) => state.playerStats);
  const policeState = useGameStore((state) => state.policeState);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const currentZoneId = useGameStore((state) => state.currentZoneId);
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const weather = useGameStore((state) => state.weather);
  const activeEvent = useGameStore((state) => state.activeEvent);
  const activeDelivery = useGameStore((state) => state.activeDelivery);
  const cancelDeliveryJob = useGameStore((state) => state.cancelDeliveryJob);
  const notification = useGameStore((state) => state.notificationMessage);
  const settings = useGameStore((state) => state.settings);
  const screenShakeTick = useGameStore((state) => state.screenShakeTick);
  const activeBrawl = useGameStore((state) => state.activeBrawl);
  const comicHitPopup = useGameStore((state) => state.comicHitPopup);
  const chandaCallout = useGameStore((state) => state.chandaCallout);
  const missions = useGameStore((state) => state.missions);
  const achievements = useGameStore((state) => state.achievements);

  const claimableCount =
    missions.filter((m) => m.completed && !m.claimed).length +
    achievements.filter((a) => a.unlocked && !a.claimed).length;

  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (screenShakeTick === 0) return;
    setIsShaking(true);
    const id = window.setTimeout(() => setIsShaking(false), 320);
    return () => clearTimeout(id);
  }, [screenShakeTick]);

  const timeBn = {
    morning: 'সকাল',
    afternoon: 'দুপুর',
    evening: 'সন্ধ্যা',
    night: 'রাত',
  }[timeOfDay];

  const WeatherIcon = {
    sunny: Sun,
    rainy: CloudRain,
    cloudy: Cloud,
    stormy: CloudLightning,
  }[weather];

  const currentZone = CITY_ZONES.find((z) => z.id === currentZoneId) || CITY_ZONES[0];

  const currentLevelReq = PROGRESSION_LEVELS.find((l) => l.level === playerStats.level)?.reqXp || 0;
  const xpRange = Math.max(1, playerStats.nextLevelXp - currentLevelReq);
  const xpInLevel = Math.max(0, playerStats.xp - currentLevelReq);
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpRange) * 100));

  const deliveryDist = activeDelivery
    ? Math.round(
        Math.hypot(
          activeDelivery.targetPosition[0] - playerPosition[0],
          activeDelivery.targetPosition[2] - playerPosition[2]
        )
      )
    : 0;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden ${
        isShaking ? 'animate-cartoon-shake' : ''
      }`}
    >
      {/* Subtle atmospheric vignette */}
      <div className="game-vignette absolute inset-0 pointer-events-none" />

      {/* ================= TOP BAR ================= */}
      <div className="relative z-10 flex justify-between items-start gap-1.5 sm:gap-3">
        {/* Top-Left Column: Player Profile Card + Mobile District & Delivery Badges */}
        <div className="flex flex-col items-start gap-1.5 min-w-0 max-w-[58vw] sm:max-w-none">
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 p-1.5 sm:p-3 rounded-2xl bg-[#0B101E]/92 border border-slate-700/90 shadow-2xl w-full sm:w-auto">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-xl">
                🕶️
              </div>
              <div className="absolute -bottom-1 -right-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] shadow border border-slate-950 tabular-nums">
                Lv.{playerStats.level}
              </div>
            </div>

            <div className="flex flex-col min-w-0 sm:min-w-[175px] gap-0.5 sm:gap-1 flex-1">
              <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                <span className="font-bold text-white text-[11px] sm:text-sm leading-tight truncate">
                  {playerStats.name}
                </span>
                <span className="px-1 sm:px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-[9px] sm:text-[10px] font-bold text-amber-300 whitespace-nowrap tabular-nums flex-shrink-0">
                  মান {playerStats.reputation}%
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden border border-slate-700/70">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 tabular-nums">
                <span>XP: {playerStats.xp.toLocaleString()}</span>
                <span className="hidden sm:inline">লক্ষ্য: {playerStats.nextLevelXp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Mobile District & Delivery Pill stacked neatly on left so center stays open */}
          <div className="md:hidden flex flex-col items-start gap-1 max-w-full">
            <div className="px-2.5 py-0.5 rounded-lg bg-[#0B101E]/92 border border-slate-700/90 text-[10px] font-bold text-amber-300 flex items-center gap-1 max-w-full">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{currentZone.nameBn}</span>
              <span className="text-slate-500">•</span>
              <WeatherIcon className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="flex-shrink-0">{timeBn}</span>
            </div>
            {activeEvent && (
              <div className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow text-[10px] font-bold flex items-center gap-1 border border-amber-300 max-w-full">
                <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{activeEvent.titleBn}</span>
              </div>
            )}
            {activeDelivery && (
              <div className="pointer-events-auto px-2 py-0.5 rounded-lg bg-emerald-950/95 border border-emerald-400/70 text-[10px] font-bold text-emerald-200 flex items-center gap-1 max-w-full">
                <PackageCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">
                  {activeDelivery.toZoneNameBn} ({deliveryDist}m)
                </span>
                <button
                  onClick={cancelDeliveryJob}
                  className="text-rose-400 hover:text-rose-300 ml-0.5 flex-shrink-0"
                  title="ডেলিভারি বাতিল করুন"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Mobile Notification: positioned cleanly just below Location */}
            {notification && (
              <div
                className={`mt-0.5 animate-toast-drop pointer-events-none w-fit max-w-full px-2 py-1 rounded-xl bg-[#0B101E]/95 shadow-xl text-left flex flex-col items-start gap-0.5 border ${
                  notification.type === 'danger'
                    ? 'border-red-500/90 bg-gradient-to-r from-red-950/95 to-[#0B101E]/95'
                    : notification.type === 'warning'
                    ? 'border-amber-500/90'
                    : notification.type === 'success'
                    ? 'border-emerald-500/90'
                    : 'border-amber-400/75'
                }`}
              >
                <div
                  className={`font-bold text-[10px] leading-tight flex items-center gap-1 max-w-full ${
                    notification.type === 'danger'
                      ? 'text-rose-300'
                      : notification.type === 'success'
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  }`}
                >
                  {notification.type === 'danger' ? (
                    <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="line-clamp-1">{notification.title}</span>
                </div>
                {notification.subtitle && (
                  <div className="text-[9px] leading-tight text-slate-200 font-medium line-clamp-2">
                    {notification.subtitle}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top-Center (Desktop): District, Atmosphere, Event, Delivery & Notification Below Location */}
        <div className="hidden md:flex flex-col items-center gap-1.5">
          <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-[#0B101E]/92 border border-slate-700/90 shadow-lg flex items-center gap-2.5 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentZone.nameBn}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <WeatherIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeBn}</span>
            </div>
          </div>

          {activeEvent && (
            <div className="pointer-events-auto px-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl text-xs font-bold flex items-center gap-1.5 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeEvent.titleBn}</span>
            </div>
          )}

          {activeDelivery && (
            <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-400/70 text-emerald-100 shadow-xl text-xs font-bold flex items-center gap-2.5">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>
                ডেলিভারি: {activeDelivery.toZoneNameBn} ({deliveryDist}m)
              </span>
              <span className="text-amber-300 tabular-nums">+৳{activeDelivery.rewardMoney}</span>
              <button
                onClick={cancelDeliveryJob}
                className="text-rose-400 hover:text-rose-300 ml-1"
                title="ডেলিভারি বাতিল করুন"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Desktop Notification: positioned cleanly just below Location */}
          {notification && (
            <div
              className={`mt-1 animate-toast-drop pointer-events-none w-fit max-w-md px-3.5 py-1.5 rounded-xl bg-[#0B101E]/95 shadow-2xl text-center flex flex-col items-center gap-0.5 border ${
                notification.type === 'danger'
                  ? 'border-red-500/90 bg-gradient-to-r from-red-950/95 via-[#0B101E]/95 to-blue-950/95'
                  : notification.type === 'warning'
                  ? 'border-amber-500/90'
                  : notification.type === 'success'
                  ? 'border-emerald-500/90'
                  : 'border-amber-400/75'
              }`}
            >
              <div
                className={`font-bold text-xs leading-tight flex items-center gap-1.5 ${
                  notification.type === 'danger'
                    ? 'text-rose-300'
                    : notification.type === 'success'
                    ? 'text-emerald-300'
                    : 'text-amber-300'
                }`}
              >
                {notification.type === 'danger' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                <span className="truncate max-w-[360px]">{notification.title}</span>
              </div>
              {notification.subtitle && (
                <div className="text-[11px] leading-tight text-slate-200 font-medium truncate max-w-[400px]">
                  {notification.subtitle}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top-Right: Menu Icon (Above Income), Wallet, Wanted Stars & MiniMap */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => {
              soundManager.playDialogueBlip(1.1);
              onToggleMenu();
            }}
            aria-label="মেনু খুলুন"
            title="মেনু খুলুন"
            className={`pointer-events-auto relative h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border shadow-lg flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer ${
              isMenuOpen
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-[#0B101E]/92 hover:bg-slate-900 border-amber-400/55 hover:border-amber-400 text-amber-200'
            }`}
          >
            {isMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-[11px] sm:text-xs font-bold leading-none">মেনু</span>
            {claimableCount > 0 && !isMenuOpen && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] leading-none tabular-nums">
                {claimableCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenEconomy}
            className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-2xl bg-[#0B101E]/92 border border-amber-500/45 hover:border-amber-400 shadow-2xl transition-colors text-right"
            title="অর্থনৈতিক হিসাব দেখুন"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow">
              <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <div className="font-arcade text-base sm:text-2xl text-amber-400 font-bold leading-none tracking-wide tabular-nums">
                ৳{playerStats.balance.toLocaleString()}
              </div>
              <div className="hidden sm:block text-[10px] text-slate-400 mt-0.5 tabular-nums">
                আজকের আয়: +৳{playerStats.dailyIncome.toLocaleString()}
              </div>
            </div>
          </button>

          {policeState.status === 'arriving' && (
            <div className="pointer-events-auto px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-950/95 border border-amber-500/80 shadow-xl flex items-center gap-1.5 tabular-nums">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-200">
                পুলিশ আসছে: {policeState.displaySec}s
              </span>
            </div>
          )}

          {(playerStats.wantedStars > 0 || policeState.status === 'chasing') && (
            <div className="pointer-events-auto px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-red-950/95 border border-red-500/80 shadow-xl flex items-center gap-1.5 tabular-nums">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              <div className="flex gap-0.5 text-xs sm:text-sm font-bold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < playerStats.wantedStars ? 'text-amber-400' : 'text-slate-600'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-red-200 whitespace-nowrap">
                ধাওয়া ({policeState.displaySec || 7}s)
              </span>
            </div>
          )}

          {settings.showMinimap && (
            <div className="pointer-events-auto [@media(max-height:420px)]:hidden">
              <MiniMap onOpenFullMap={onOpenFullMap} />
            </div>
          )}
        </div>
      </div>

      {/* ================= CHANDA DE! PROXIMITY CALLOUT ================= */}
      {chandaCallout && (
        <div className="self-center mt-1 sm:mt-2 pointer-events-none z-20 flex flex-col items-center max-w-[92vw]">
          <div className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-amber-500 text-slate-950 border-2 border-yellow-200 shadow-2xl flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 font-black text-sm sm:text-lg">
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>&ldquo;চান্দা দে!&rdquo;</span>
            <span className="text-[10px] sm:text-xs font-bold bg-slate-950 text-amber-300 px-2 py-0.5 rounded-lg truncate max-w-[200px]">
              {chandaCallout.shopName}
            </span>
          </div>
        </div>
      )}

      {/* ================= COMIC HIT POPUP ("ধুম! / ঠাস!") ================= */}
      {comicHitPopup && (
        <div className="self-center my-auto pointer-events-none z-30">
          <div className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-rose-600 text-yellow-300 border-2 border-yellow-300 shadow-2xl font-black text-xl sm:text-3xl tracking-wider -rotate-3">
            {comicHitPopup.text}
          </div>
        </div>
      )}

      {/* ================= ACTIVE SHOP BRAWL (MARAMARI & VANGCHUR) BAR ================= */}
      {activeBrawl && (
        <div className="self-center mt-1 sm:mt-2 pointer-events-auto w-full max-w-xs sm:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-[#0B101E]/95 border-2 border-rose-500 shadow-2xl z-20 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Swords className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="font-black text-xs sm:text-sm text-white truncate">
                {activeBrawl.shopNameBn}
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-black text-amber-400 tabular-nums flex-shrink-0">
              ৳{activeBrawl.rewardMoney}
            </span>
          </div>

          {activeBrawl.surrendered ? (
            <div className="py-1.5 px-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black text-[11px] sm:text-xs text-center">
              দোকানদার নতি স্বীকার করেছে! +৳{activeBrawl.rewardMoney} পেয়েছেন!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold tabular-nums">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-rose-300 gap-1">
                    <span className="truncate">{activeBrawl.ownerName}</span>
                    <span>{activeBrawl.keeperHp}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-150"
                      style={{ width: `${activeBrawl.keeperHp}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-amber-300 gap-1">
                    <span className="truncate">প্রতিরোধ</span>
                    <span>{activeBrawl.shopResistance}%</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-150"
                      style={{ width: `${activeBrawl.shopResistance}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={onSmash}
                className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] sm:text-xs shadow active:scale-95 transition-transform"
              >
                ঘুষি / লাথি ও ভাঙচুর করুন [F]
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= INTERACTION PROMPT ================= */}
      {nearbyTarget && (
        <div className="self-center mb-36 sm:mb-8 [@media(max-height:480px)]:mb-10 pointer-events-auto flex flex-col items-center z-20 max-w-[92vw] [@media(max-height:480px)]:max-w-[52vw]">
          <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-[#0B101E]/95 border-2 border-amber-400 shadow-2xl flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
            {nearbyTarget.type !== 'shop' && nearbyTarget.type !== 'destructible' && (
              <div className="hidden sm:flex w-8 h-8 rounded-xl bg-amber-400 text-slate-950 items-center justify-center font-black text-sm">
                E
              </div>
            )}
            <div className="flex flex-col text-center sm:text-left">
              <span className="font-bold text-white text-[11px] sm:text-sm leading-tight">
                {nearbyTarget.type === 'delivery' && 'পার্সেল ডেলিভারি দিন'}
                {nearbyTarget.type === 'shop' && 'দোকানের সামনে'}
                {nearbyTarget.type === 'vehicle' && 'যানবাহন / ভাড়া'}
                {nearbyTarget.type === 'destructible' && 'ভাঙচুর / লাথি মারুন'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-amber-300 font-medium truncate max-w-[190px] sm:max-w-[260px]">
                {nearbyTarget.name}
              </span>
            </div>
            {nearbyTarget.type !== 'destructible' && nearbyTarget.type !== 'shop' && (
              <button
                onClick={onInteract}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] sm:text-xs shadow transition-transform active:scale-95"
              >
                {nearbyTarget.type === 'delivery' ? 'ডেলিভারি' : 'যাত্রা / ভাড়া'}
              </button>
            )}
            {(nearbyTarget.type === 'destructible' || nearbyTarget.type === 'shop') && (
              <button
                onClick={onSmash}
                className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] sm:text-xs shadow transition-transform active:scale-95 flex items-center gap-1"
              >
                <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{nearbyTarget.type === 'shop' ? 'ভাঙচুর [F]' : 'লাথি'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
