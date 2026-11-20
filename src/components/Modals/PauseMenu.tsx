import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Play, Save, Settings, Home, RotateCcw } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

export const PauseMenu: React.FC = () => {
  const setGameMode = useGameStore((state) => state.setGameMode);
  const openModal = useGameStore((state) => state.openModal);
  const saveGame = useGameStore((state) => state.saveGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const playerStats = useGameStore((state) => state.playerStats);

  const [confirmRestart, setConfirmRestart] = useState(false);

  const handleResume = () => {
    soundManager.playDialogueBlip(1.2);
    setGameMode('playing');
  };

  const handleSave = () => {
    saveGame();
    soundManager.playCash();
    useGameStore.getState().notify('গেম সেভ হয়েছে!', 'আপনার অগ্রগতি সংরক্ষিত হয়েছে।', 'success');
  };

  const handleSettings = () => {
    setGameMode('playing');
    openModal('settings');
  };

  const handleMainMenu = () => {
    saveGame();
    setGameMode('menu');
  };

  const handleRestart = () => {
    resetGame();
    setConfirmRestart(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90">
      <div className="w-full max-w-sm rounded-3xl bd-signboard overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="h-2 w-full bd-awning-stripe shrink-0" />
        <div className="p-5 sm:p-6 flex flex-col gap-3.5 sm:gap-4 text-center overflow-y-auto no-scrollbar">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              চান্দা বাজার • বিরতি
            </div>
            <h2 className="font-bold text-amber-100 text-2xl mt-0.5">খেলা বিরতি</h2>
            <p className="text-xs text-amber-200/80 mt-1 tabular-nums">
              {playerStats.name} • Lv.{playerStats.level} • ৳{playerStats.balance.toLocaleString()}
            </p>
          </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={handleResume}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>খেলা চালিয়ে যান (Resume)</span>
          </button>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>সেভ করুন (Save Game)</span>
          </button>

          <button
            onClick={handleSettings}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>সেটিংস (Settings)</span>
          </button>

          <button
            onClick={handleMainMenu}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>মূল মেনুতে ফিরুন</span>
          </button>

          {!confirmRestart ? (
            <button
              onClick={() => setConfirmRestart(true)}
              className="w-full py-2.5 rounded-2xl bg-rose-950/50 hover:bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন করে শুরু করুন (Restart)</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-black text-xs"
              >
                নিশ্চিত রিস্টার্ট
              </button>
              <button
                onClick={() => setConfirmRestart(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                বাতিল
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
