import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Volume2, Save, X, Keyboard, Monitor, Map, Home } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

export const SettingsModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const saveGame = useGameStore((state) => state.saveGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    saveGame();
    soundManager.playCash();
    useGameStore.getState().notify('সেটিংস সেভ হয়েছে!', 'আপনার অগ্রগতি ও সেটিংস সংরক্ষিত হয়েছে।', 'success');
    closeModal();
  };

  const handleReset = () => {
    resetGame();
    setConfirmReset(false);
    closeModal();
  };

  const handleReturnMenu = () => {
    saveGame();
    closeModal();
    setGameMode('menu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0B101E] border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 font-black text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">
                সেটিংস ও নিয়ন্ত্রণ (Settings)
              </h2>
              <div className="text-xs text-slate-400">
                Audio, Graphics Quality, Minimap & Save Management
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* Audio Controls */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>শব্দ ও সুর (Audio & Music)</span>
              </span>
              <button
                onClick={() =>
                  updateSettings({
                    soundEnabled: !settings.soundEnabled,
                    musicEnabled: !settings.soundEnabled,
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  settings.soundEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'চালু (ON)' : 'বন্ধ (MUTED)'}
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-300 tabular-nums">
                <span>সাউন্ড এফেক্ট (SFX):</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs text-slate-300 tabular-nums pt-1">
                <span>ব্যাকগ্রাউন্ড মিউজিক (BGM):</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Graphics & Display */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span>গ্রাফিক্স ও ডিসপ্লে (Graphics Quality)</span>
            </div>

            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => updateSettings({ graphicsQuality: q })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    settings.graphicsQuality === q
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {q === 'low' ? 'লো (Fast)' : q === 'medium' ? 'মিডিয়াম' : 'হাই (Ultra)'}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-400" />
                <span>স্ক্রিনে মিনি-ম্যাপ দেখান</span>
              </span>
              <button
                onClick={() => updateSettings({ showMinimap: !settings.showMinimap })}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  settings.showMinimap ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.showMinimap ? 'দেখান' : 'লুকান'}
              </button>
            </div>
          </div>

          {/* Controls Reference */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-400" />
              <span>কী-বোর্ড ও মাউস নিয়ন্ত্রণ</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">হাঁটা:</span>
                <span className="font-bold text-amber-300">WASD / তির</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">দৌড়:</span>
                <span className="font-bold text-amber-300">Shift</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">লাফ:</span>
                <span className="font-bold text-amber-300">Space</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">যাত্রা / ডেলিভারি:</span>
                <span className="font-bold text-amber-300">E</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">লাথি / ভাঙচুর:</span>
                <span className="font-bold text-amber-300">F</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">ক্যামেরা জুম:</span>
                <span className="font-bold text-amber-300">মাউস স্ক্রল</span>
              </div>
            </div>
          </div>

          {/* Save, Main Menu & Reset */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>সেভ করুন</span>
            </button>

            {gameMode !== 'menu' && (
              <>
                <button
                  onClick={handleReturnMenu}
                  className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>মূল মেনু</span>
                </button>

                {!confirmReset ? (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-rose-950 text-rose-300 border border-slate-700 hover:border-rose-500 text-xs font-bold cursor-pointer"
                  >
                    রিসেট
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer"
                    >
                      নিশ্চিত
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="py-2.5 px-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      না
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
