import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PROGRESSION_LEVELS } from '../../data/cityData';
import { Coins, X } from 'lucide-react';

export const MissionsModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const missions = useGameStore((state) => state.missions);
  const playerStats = useGameStore((state) => state.playerStats);
  const claimMissionReward = useGameStore((state) => state.claimMissionReward);

  const currentLevelInfo = PROGRESSION_LEVELS.find((l) => l.level === playerStats.level);
  const nextLevelInfo = PROGRESSION_LEVELS.find((l) => l.level === playerStats.level + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B101E] border-2 border-amber-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600/30 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl">
              📜
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">
                শহরের মিশন ও অগ্রগতি (Missions & Progression)
              </h2>
              <div className="text-xs text-slate-400">
                Complete quests to earn Taka, XP and unlock new city perks
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Progression Banner */}
        <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex flex-col items-center justify-center font-black shadow">
              <span className="text-[10px] uppercase leading-none">Level</span>
              <span className="text-xl leading-none">{playerStats.level}</span>
            </div>
            <div>
              <div className="font-bold text-white text-base">{currentLevelInfo?.titleBn}</div>
              <div className="text-xs text-amber-400">অর্জিত সুবিধা: {currentLevelInfo?.perk}</div>
            </div>
          </div>

          {nextLevelInfo && (
            <div className="text-left sm:text-right text-xs">
              <div className="text-slate-400">পরবর্তী লেভেল: {nextLevelInfo.titleBn}</div>
              <div className="font-bold text-slate-200 mt-0.5">
                প্রয়োজনীয় XP: {playerStats.xp} / {nextLevelInfo.reqXp}
              </div>
            </div>
          )}
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 no-scrollbar">
          {missions.map((m) => {
            const percent = Math.min(100, Math.round((m.currentCount / m.targetCount) * 100));
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  m.claimed
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : m.completed
                    ? 'bg-amber-950/50 border-amber-400 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">
                      {m.titleBn}
                    </span>
                    {m.claimed ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                        সংগৃহীত
                      </span>
                    ) : m.completed ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        সম্পন্ন! পুরষ্কার রেডি
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        ({m.currentCount}/{m.targetCount})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{m.description}</p>

                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/60 max-w-md">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Rewards & Claim Button */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col text-right text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1 justify-end">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+৳{m.rewardMoney}</span>
                    </span>
                    <span className="text-indigo-400 font-semibold">+{m.rewardXP} XP</span>
                  </div>

                  {m.completed && !m.claimed && (
                    <button
                      onClick={() => claimMissionReward(m.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg transition-transform active:scale-95"
                    >
                      পুরষ্কার নিন
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
