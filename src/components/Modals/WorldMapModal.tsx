import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CITY_ZONES } from '../../data/cityData';
import { Navigation, X, Lock } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface WorldMapModalProps {
  onTeleport: (pos: [number, number, number]) => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({ onTeleport }) => {
  const closeModal = useGameStore((state) => state.closeModal);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const playerLevel = useGameStore((state) => state.playerStats.level);

  const shopsCount = useGameStore((state) => state.shops.length);

  const handleSelectZone = (zone: (typeof CITY_ZONES)[0]) => {
    if (playerLevel < zone.minLevel) {
      soundManager.playHit();
      useGameStore.getState().notify(
        'এলাকাটি এখনো লক আছে!',
        `এই এলাকায় যেতে লেভেল ${zone.minLevel} প্রয়োজন।`,
        'warning'
      );
      return;
    }

    soundManager.playRickshawBell();
    onTeleport(zone.position);
    closeModal();
    useGameStore.getState().notify(
      `পৌঁছে গেছেন: ${zone.nameBn}!`,
      zone.description,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90">
      <div className="relative w-full max-w-3xl rounded-3xl bd-signboard overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="h-2 w-full bd-awning-gold shrink-0" />
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950/75 via-[#0d1c16] to-amber-950/35 border-b border-amber-500/35">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-lg sm:text-xl flex-shrink-0 shadow">
              🗺️
            </div>
            <div>
              <h2 className="font-bold text-amber-100 text-sm sm:text-lg leading-tight">
                চান্দা সিটির বাজার ও এলাকার মানচিত্র
              </h2>
              <div className="text-[11px] sm:text-xs text-amber-200/75">
                {CITY_ZONES.length}টি এলাকা • {shopsCount}টি দোকান • ক্লিক করে দ্রুত যাতায়াত করুন
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/35 text-amber-200 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zones Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 no-scrollbar">
          {CITY_ZONES.map((zone) => {
            const isLocked = playerLevel < zone.minLevel;
            const dist = Math.round(
              Math.hypot(zone.position[0] - playerPosition[0], zone.position[2] - playerPosition[2])
            );

            return (
              <div
                key={zone.id}
                onClick={() => handleSelectZone(zone)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 group ${
                  isLocked
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : 'bg-slate-950/80 border-slate-800 hover:border-blue-400 hover:scale-[1.02] shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-bold text-white text-sm">{zone.nameBn}</span>
                    </div>
                    {isLocked ? (
                      <span className="text-rose-400 text-xs flex items-center gap-1 font-bold">
                        <Lock className="w-3 h-3" />
                        <span>Lv.{zone.minLevel}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">{dist}m দূরে</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {zone.description}
                  </div>
                </div>

                {!isLocked && (
                  <button className="w-full py-1.5 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 group-hover:text-white text-blue-300 text-xs font-bold transition-all flex items-center justify-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>এখানে যান (Go Here)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
