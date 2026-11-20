import React from 'react';
import { useGameStore, GameState } from '../../stores/gameStore';
import {
  ScrollText,
  Building2,
  Wrench,
  Shirt,
  Map,
  Settings,
  Volume2,
  VolumeX,
  Backpack,
  Wallet,
  Trophy,
  Pause,
  X,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface BottomDockProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (modal: GameState['activeModal']) => void;
  onPause: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  isOpen,
  onClose,
  onOpenModal,
  onPause,
}) => {
  const missions = useGameStore((state) => state.missions);
  const achievements = useGameStore((state) => state.achievements);
  const destructibles = useGameStore((state) => state.destructibles);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  if (!isOpen) return null;

  const claimableMissions = missions.filter((m) => m.completed && !m.claimed).length;
  const claimableAchievements = achievements.filter((a) => a.unlocked && !a.claimed).length;
  const damagedObjectsCount = destructibles.filter((d) => d.isDestroyed || d.health < d.maxHealth).length;

  const toggleSound = () => {
    soundManager.playDialogueBlip(1.05);
    const next = !settings.soundEnabled;
    updateSettings({ soundEnabled: next, musicEnabled: next });
  };

  const handleOpen = (modal: GameState['activeModal']) => {
    soundManager.playDialogueBlip(1.1);
    onClose();
    onOpenModal(modal);
  };

  const primaryItems: {
    id: NonNullable<GameState['activeModal']>;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    tileBg: string;
    label: string;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'missions',
      icon: ScrollText,
      iconColor: 'text-amber-300',
      tileBg: 'from-amber-500/20 to-amber-950/45 border-amber-500/45',
      label: 'মিশন খাতা',
      badge: claimableMissions,
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'business',
      icon: Building2,
      iconColor: 'text-emerald-300',
      tileBg: 'from-emerald-500/20 to-emerald-950/45 border-emerald-500/45',
      label: 'দোকান ব্যবসা',
    },
    {
      id: 'repair',
      icon: Wrench,
      iconColor: 'text-orange-300',
      tileBg: 'from-orange-500/20 to-orange-950/45 border-orange-500/45',
      label: 'মিস্ত্রি ঘর',
      badge: damagedObjectsCount,
      badgeColor: 'bg-orange-500 text-white',
    },
    {
      id: 'customization',
      icon: Shirt,
      iconColor: 'text-purple-300',
      tileBg: 'from-purple-500/20 to-purple-950/45 border-purple-500/45',
      label: 'টেইলার্স',
    },
    {
      id: 'inventory',
      icon: Backpack,
      iconColor: 'text-cyan-300',
      tileBg: 'from-cyan-500/20 to-cyan-950/45 border-cyan-500/45',
      label: 'টং ব্যাগ',
    },
    {
      id: 'economy',
      icon: Wallet,
      iconColor: 'text-yellow-300',
      tileBg: 'from-yellow-500/20 to-yellow-950/45 border-yellow-500/45',
      label: 'হালখাতা',
    },
    {
      id: 'achievements',
      icon: Trophy,
      iconColor: 'text-pink-300',
      tileBg: 'from-pink-500/20 to-pink-950/45 border-pink-500/45',
      label: 'সাফল্য',
      badge: claimableAchievements,
      badgeColor: 'bg-pink-500 text-white',
    },
    {
      id: 'map',
      icon: Map,
      iconColor: 'text-sky-300',
      tileBg: 'from-sky-500/20 to-sky-950/45 border-sky-500/45',
      label: 'এলাকা ম্যাপ',
    },
  ];

  return (
    <div className="fixed inset-0 z-40">
      {/* Click-outside Scrim */}
      <div
        onClick={() => {
          soundManager.playDialogueBlip(0.95);
          onClose();
        }}
        className="absolute inset-0 bg-slate-950/40"
      />

      {/* Top-Anchored Bangladeshi Dokaan Command Signboard (Mobile + Desktop) */}
      <div className="absolute top-11 sm:top-14 right-2 sm:right-4 left-2 sm:left-auto flex justify-end pointer-events-none">
        <div className="pointer-events-auto animate-toast-drop w-full max-w-md sm:w-[420px] rounded-2xl bd-signboard overflow-hidden">
          <div className="h-2 w-full bd-awning-stripe" />
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-950/70 via-[#0d1c16] to-amber-950/40 border-b border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🏮</span>
              <span className="text-xs sm:text-sm font-black text-amber-200">
                চান্দা বাজার • দোকান মেনু
              </span>
            </div>
            <button
              onClick={() => {
                soundManager.playDialogueBlip(0.95);
                onClose();
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/35 text-amber-200 text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-amber-400" />
              <span>বন্ধ</span>
            </button>
          </div>

          {/* All 11 Actions Visible Simultaneously in 4-Column Grid */}
          <div className="p-2.5 sm:p-3 grid grid-cols-4 gap-2">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpen(item.id)}
                  className={`relative py-2.5 px-1.5 rounded-xl bg-gradient-to-b ${item.tileBg} border text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-md cursor-pointer`}
                >
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full font-black text-[9px] leading-none shadow tabular-nums ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  <span className="text-[11px] font-bold leading-none whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}

            <button
              onClick={toggleSound}
              className={`py-2.5 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              <span className="text-[11px] font-bold leading-none">সাউন্ড</span>
            </button>

            <button
              onClick={() => handleOpen('settings')}
              className="py-2.5 px-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <Settings className="w-5 h-5 text-slate-300" />
              <span className="text-[11px] font-bold leading-none">সেটিংস</span>
            </button>

            <button
              onClick={() => {
                soundManager.playDialogueBlip(1.0);
                onClose();
                onPause();
              }}
              className="col-span-2 py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 text-amber-200 flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] sm:text-xs font-black">খেলা বিরতি (Pause)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
