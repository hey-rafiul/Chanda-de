import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Trophy, Coins, Lock } from 'lucide-react';

export const AchievementsModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const achievements = useGameStore((state) => state.achievements);
  const claimAchievement = useGameStore((state) => state.claimAchievement);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B101E] border-2 border-pink-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-600/25 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-slate-950 font-black">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">
                সাফল্য ও সম্মাননা (Achievements)
              </h2>
              <div className="text-xs text-slate-400 tabular-nums">
                অর্জিত: {unlockedCount}/{achievements.length}টি মাইলফলক
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                ach.claimed
                  ? 'bg-slate-950/40 border-slate-800 opacity-65'
                  : ach.unlocked
                  ? 'bg-pink-950/40 border-pink-400/70'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">
                  {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-600" />}
                </div>
                <div>
                  <div className="font-bold text-white text-sm sm:text-base">{ach.titleBn}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                  <div className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-2 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> +৳{ach.rewardMoney}
                    </span>
                    <span className="text-indigo-400">+{ach.rewardXP} XP</span>
                  </div>
                </div>
              </div>

              <div>
                {ach.claimed ? (
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                    সংগৃহীত
                  </span>
                ) : ach.unlocked ? (
                  <button
                    onClick={() => claimAchievement(ach.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-black text-xs shadow active:scale-95 transition-transform"
                  >
                    বোনাস নিন
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-slate-900 text-slate-500 text-xs font-bold">
                    লক করা
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
