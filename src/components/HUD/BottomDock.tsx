import React, { useState } from 'react';
import { useGameStore, GameState } from '../../stores/gameStore';
import {
  ScrollText,
  Building2,
  Wrench,
  Shirt,
  Map,
  Settings,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Backpack,
  Wallet,
  Trophy,
  Pause,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface BottomDockProps {
  onOpenModal: (modal: GameState['activeModal']) => void;
  onPause: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({ onOpenModal, onPause }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const missions = useGameStore((state) => state.missions);
  const achievements = useGameStore((state) => state.achievements);
  const destructibles = useGameStore((state) => state.destructibles);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const claimableMissions = missions.filter((m) => m.completed && !m.claimed).length;
  const claimableAchievements = achievements.filter((a) => a.unlocked && !a.claimed).length;
  const damagedObjectsCount = destructibles.filter((d) => d.isDestroyed || d.health < d.maxHealth).length;

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    updateSettings({ soundEnabled: next, musicEnabled: next });
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-out flex flex-col items-center pointer-events-none"
      style={{
        bottom: isCollapsed ? '-76px' : 'max(10px, env(safe-area-inset-bottom))',
        width: 'min(960px, 96vw)',
      }}
    >
      {/* Collapse Toggle Tab */}
      <button
        onClick={() => {
          soundManager.playDialogueBlip(1.1);
          setIsCollapsed(!isCollapsed);
        }}
        className="pointer-events-auto mb-1 px-3 sm:px-3.5 py-1 rounded-full bg-[#0B101E]/95 border border-slate-700 text-slate-300 hover:text-white shadow-lg text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 transition-transform active:scale-95 hover:border-amber-400"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span>মেনু খুলুন</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            <span>মেনু লুকান</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      <div className="pointer-events-auto w-full px-2 sm:px-2.5 py-1.5 rounded-2xl bg-[#0B101E]/95 border border-slate-700/90 shadow-2xl flex items-center justify-start sm:justify-between gap-1 sm:gap-1.5 overflow-x-auto touch-pan-x no-scrollbar">
        <DockButton
          icon={ScrollText}
          iconColor="text-amber-400"
          label="মিশন"
          badge={claimableMissions}
          badgeColor="bg-amber-500 text-slate-950"
          onClick={() => onOpenModal('missions')}
        />
        <DockButton
          icon={Building2}
          iconColor="text-emerald-400"
          label="ব্যবসা"
          onClick={() => onOpenModal('business')}
        />
        <DockButton
          icon={Wrench}
          iconColor="text-orange-400"
          label="মেরামত"
          badge={damagedObjectsCount}
          badgeColor="bg-orange-600 text-white"
          onClick={() => onOpenModal('repair')}
        />
        <DockButton
          icon={Shirt}
          iconColor="text-purple-400"
          label="পোশাক"
          onClick={() => onOpenModal('customization')}
        />
        <DockButton
          icon={Backpack}
          iconColor="text-cyan-400"
          label="ব্যাগ"
          onClick={() => onOpenModal('inventory')}
        />
        <DockButton
          icon={Wallet}
          iconColor="text-yellow-400"
          label="হিসাব"
          onClick={() => onOpenModal('economy')}
        />
        <DockButton
          icon={Trophy}
          iconColor="text-pink-400"
          label="অর্জন"
          badge={claimableAchievements}
          badgeColor="bg-pink-500 text-white"
          onClick={() => onOpenModal('achievements')}
        />
        <DockButton
          icon={Map}
          iconColor="text-blue-400"
          label="মানচিত্র"
          onClick={() => onOpenModal('map')}
        />

        <div className="w-px h-8 bg-slate-800 mx-0.5 hidden sm:block" />

        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors flex-shrink-0"
          title="সাউন্ড চালু / বন্ধ"
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          )}
        </button>

        <button
          onClick={() => onOpenModal('settings')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors flex-shrink-0"
          title="সেটিংস"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
        </button>

        <button
          onClick={onPause}
          className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-colors flex-shrink-0"
          title="বিরতি (ESC)"
        >
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

interface DockButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  badge?: number;
  badgeColor?: string;
  onClick: () => void;
}

const DockButton: React.FC<DockButtonProps> = ({
  icon: Icon,
  iconColor,
  label,
  badge = 0,
  badgeColor = 'bg-amber-500 text-slate-950',
  onClick,
}) => (
  <button
    onClick={onClick}
    className="relative min-w-[52px] sm:min-w-[64px] py-1.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-400/80 text-white flex flex-col items-center justify-center gap-0.5 transition-colors flex-shrink-0"
  >
    {badge > 0 && (
      <span
        className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full font-black text-[9px] shadow tabular-nums ${badgeColor}`}
      >
        {badge}
      </span>
    )}
    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
    <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
  </button>
);
