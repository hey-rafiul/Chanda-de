import React, { useState } from 'react';
import {
  Play,
  ScrollText,
  Building2,
  Wrench,
  Shirt,
  Backpack,
  Wallet,
  Trophy,
  Map as MapIcon,
  Volume2,
  Settings,
  Pause,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

type PreviewTab = 'hud' | 'menu' | 'halkhata' | 'tong' | 'missions';

interface GameUIPreviewProps {
  level: number;
  balance: number;
  onLaunchGame: () => void;
}

const PREVIEW_TABS: { id: PreviewTab; label: string }[] = [
  { id: 'hud', label: 'মূল গেম UI' },
  { id: 'menu', label: 'দোকান মেনু' },
  { id: 'halkhata', label: 'হালখাতা' },
  { id: 'tong', label: 'টং ব্যাগ' },
  { id: 'missions', label: 'মিশন খাতা' },
];

export const GameUIPreview: React.FC<GameUIPreviewProps> = ({
  level,
  balance,
  onLaunchGame,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('hud');
  const [demoHitFlash, setDemoHitFlash] = useState(false);

  const selectTab = (tab: PreviewTab) => {
    soundManager.playDialogueBlip(1.1);
    setActiveTab(tab);
  };

  const triggerDemoSmash = () => {
    soundManager.playHit();
    setDemoHitFlash(true);
    window.setTimeout(() => setDemoHitFlash(false), 650);
  };

  return (
    <div className="w-full rounded-3xl bd-signboard overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.75)] flex flex-col">
      {/* Bangladeshi Dokaan Awning Trim */}
      <div className="h-2.5 w-full bd-awning-stripe shrink-0" />

      {/* Preview Signboard Bar */}
      <div className="px-3 sm:px-4 py-2.5 bd-tin-trim bg-gradient-to-r from-[#0e261b] via-[#0c1a15] to-[#1e140c] border-b border-amber-500/35 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none shrink-0">🏮</span>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-amber-200 truncate">
              গেম UI প্রিভিউ • চান্দা বাজার
            </div>
            <div className="text-[10px] text-amber-200/70 truncate">
              খেলার ভেতরের আসল বাংলাদেশী দোকান HUD দেখুন ও ক্লিক করে টেস্ট করুন
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLaunchGame}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] sm:text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>সরাসরি খেলুন</span>
        </button>
      </div>

      {/* Interactive Game Viewport Frame */}
      <div
        onClick={() => {
          if (activeTab === 'hud') triggerDemoSmash();
        }}
        className={`relative w-full aspect-[16/8.4] min-h-[220px] sm:min-h-[320px] bg-[#070a12] overflow-hidden select-none ${
          activeTab === 'hud' ? 'cursor-pointer' : ''
        }`}
      >
        {/* User's Actual Game UI Screenshot with Cinematic Color Grading */}
        <img
          src="/assets/aistudio/image_abb21318.png"
          alt="CHANDA DE Bangladeshi Mirpur Street 3D Game UI Preview"
          width={1920}
          height={960}
          fetchPriority="high"
          style={{
            filter: 'contrast(1.14) saturate(1.22) brightness(0.96) hue-rotate(-3deg)',
          }}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500"
        />

        {/* Cinematic Color Grading LUT Layers (Golden-Hour Warmth + Teal Shadow Split-Tone + Vignette) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none mix-blend-soft-light bg-gradient-to-b from-amber-500/22 via-orange-400/10 to-cyan-950/35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background:
              'radial-gradient(ellipse at 48% 36%, rgba(251,191,36,0.22) 0%, rgba(13,148,136,0.14) 64%, rgba(2,6,23,0.48) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#060913]/50 via-transparent to-[#060913]/15"
        />
        <div className="game-vignette absolute inset-0 pointer-events-none" />

        {/* === INTERACTIVE TAB OVERLAYS (Rendered cleanly over the color-graded screenshot) === */}
        <div
          className={`relative z-10 h-full w-full p-2.5 sm:p-4 flex flex-col justify-between transition-colors ${
            activeTab !== 'hud' ? 'bg-[#060913]/55 backdrop-blur-[2px]' : ''
          }`}
        >
          {/* Active secondary modal tabs */}
          {activeTab === 'menu' && (
            <div className="m-auto w-full max-w-[340px] rounded-2xl bd-signboard overflow-hidden animate-toast-drop shadow-2xl">
              <div className="h-1.5 w-full bd-awning-stripe" />
              <div className="px-3 py-2 bg-[#0d1c16] border-b border-amber-500/30 flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-200">
                  🏮 চান্দা বাজার • দোকান মেনু
                </span>
                <button
                  type="button"
                  onClick={() => selectTab('hud')}
                  className="text-[10px] font-bold text-amber-300 hover:text-white cursor-pointer"
                >
                  বন্ধ
                </button>
              </div>
              <div className="p-2 grid grid-cols-4 gap-1.5">
                {[
                  { icon: ScrollText, label: 'মিশন খাতা', tab: 'missions' as PreviewTab, color: 'text-amber-300' },
                  { icon: Building2, label: 'দোকান ব্যবসা', tab: 'hud' as PreviewTab, color: 'text-emerald-300' },
                  { icon: Wrench, label: 'মিস্ত্রি ঘর', tab: 'hud' as PreviewTab, color: 'text-orange-300' },
                  { icon: Shirt, label: 'টেইলার্স', tab: 'hud' as PreviewTab, color: 'text-purple-300' },
                  { icon: Backpack, label: 'টং ব্যাগ', tab: 'tong' as PreviewTab, color: 'text-cyan-300' },
                  { icon: Wallet, label: 'হালখাতা', tab: 'halkhata' as PreviewTab, color: 'text-yellow-300' },
                  { icon: Trophy, label: 'সাফল্য', tab: 'hud' as PreviewTab, color: 'text-pink-300' },
                  { icon: MapIcon, label: 'এলাকা ম্যাপ', tab: 'hud' as PreviewTab, color: 'text-sky-300' },
                ].map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <button
                      key={tile.label}
                      type="button"
                      onClick={() => selectTab(tile.tab)}
                      className="py-2 px-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Icon className={`w-4 h-4 ${tile.color}`} />
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">
                        {tile.label}
                      </span>
                    </button>
                  );
                })}
                <div className="py-1.5 px-1 rounded-xl bg-emerald-950/60 border border-emerald-500/35 flex flex-col items-center gap-0.5 text-emerald-300">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold">সাউন্ড</span>
                </div>
                <div className="py-1.5 px-1 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center gap-0.5 text-slate-300">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold">সেটিংস</span>
                </div>
                <button
                  type="button"
                  onClick={onLaunchGame}
                  className="col-span-2 py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Pause className="w-3 h-3" />
                  <span>গেম শুরু করুন</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'halkhata' && (
            <div className="m-auto w-full max-w-sm rounded-2xl bd-halkhata overflow-hidden animate-toast-drop shadow-2xl">
              <div className="h-1.5 w-full bd-awning-gold" />
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <span className="text-xs font-black text-amber-200">
                    📒 হালখাতা ও ক্যাশ গল্লা
                  </span>
                  <button
                    type="button"
                    onClick={() => selectTab('hud')}
                    className="text-[10px] font-bold text-amber-300 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 tabular-nums">
                  <div className="p-2 rounded-xl bg-[#160b11] border border-amber-500/40">
                    <div className="text-[9px] text-amber-200/75">দোকান গল্লা</div>
                    <div className="font-arcade text-xl font-bold text-amber-300">
                      ৳{balance.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0c1a14] border border-emerald-500/40">
                    <div className="text-[9px] text-emerald-200/75">আজকের সংগ্রহ</div>
                    <div className="font-arcade text-xl font-bold text-emerald-400">
                      +৳৮৪০
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-[10px] tabular-nums">
                  <div className="flex justify-between px-2 py-1 rounded-lg bg-slate-950/75 text-emerald-300">
                    <span>মামার চায়ের দোকান থেকে চাঁদা</span>
                    <span className="font-bold">+৳১২০</span>
                  </div>
                  <div className="flex justify-between px-2 py-1 rounded-lg bg-slate-950/75 text-emerald-300">
                    <span>রিকশা পার্সেল ডেলিভারি</span>
                    <span className="font-bold">+৳১৮০</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tong' && (
            <div className="m-auto w-full max-w-sm rounded-2xl bd-signboard overflow-hidden animate-toast-drop shadow-2xl">
              <div className="h-1.5 w-full bd-awning-stripe" />
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <span className="text-xs font-black text-amber-200">
                    🫖 টং দোকান ও পকেট ঝুলি
                  </span>
                  <button
                    type="button"
                    onClick={() => selectTab('hud')}
                    className="text-[10px] font-bold text-amber-300 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { emoji: '☕', name: 'স্পেশাল রং চা', price: '৳৩০' },
                    { emoji: '🥟', name: 'গরম সিঙ্গারা', price: '৳৪৫' },
                    { emoji: '🍃', name: 'মিষ্টি পান', price: '৳২৫' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg leading-none">{item.emoji}</span>
                      <span className="text-[10px] font-bold text-white leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-black text-amber-300 tabular-nums">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="m-auto w-full max-w-sm rounded-2xl bd-signboard overflow-hidden animate-toast-drop shadow-2xl">
              <div className="h-1.5 w-full bd-awning-stripe" />
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <span className="text-xs font-black text-amber-200">
                    📜 কাজের খাতা ও মিশন
                  </span>
                  <button
                    type="button"
                    onClick={() => selectTab('hud')}
                    className="text-[10px] font-bold text-amber-300 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[#0e1b16] border border-amber-500/40 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex flex-col items-center justify-center tabular-nums">
                    <span className="text-[7px] uppercase leading-none">Lv</span>
                    <span className="text-sm leading-none">{level}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-amber-300">
                      Chanda Bhai • নতুন মুখ
                    </div>
                    <div className="text-[10px] text-amber-100/80">
                      শহরের সব এলাকায় প্রভাব বিস্তার করুন
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-white">
                    <span>বাজারে প্রথম চাঁদা সংগ্রহ</span>
                    <span className="text-amber-300">+৳২০০</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-3/4 bg-amber-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Comic Hit Popup when clicking the live game preview */}
          {demoHitFlash && activeTab === 'hud' && (
            <div className="m-auto pointer-events-none">
              <div className="px-4 py-1.5 rounded-2xl bg-rose-600 text-yellow-300 border-2 border-yellow-300 shadow-2xl font-black text-lg sm:text-2xl -rotate-3">
                ধুম! +৳৮৫
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Interactive UI Tab Strip */}
      <div className="p-2 sm:p-2.5 bg-[#09120e] border-t border-amber-500/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {PREVIEW_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`flex-1 min-w-[78px] py-1.5 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                active
                  ? 'bg-amber-400 text-slate-950 border-yellow-200 shadow'
                  : 'bg-slate-900/90 text-amber-100/80 border-slate-800 hover:border-amber-500/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
