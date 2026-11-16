import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CharacterPreview3D } from '../Three/CharacterPreview3D';
import { CharacterAnimAction } from '../../game/three/characterSystem';
import { CustomizationItem, HeroExpression } from '../../types/game';
import { Check, Coins, X, Smile } from 'lucide-react';

type WardrobeTab = CustomizationItem['type'];

const WARDROBE_TABS: { id: WardrobeTab; label: string }[] = [
  { id: 'shirt', label: 'শার্ট ও পাঞ্জাবি' },
  { id: 'bottom', label: 'প্যান্ট ও লুঙ্গি' },
  { id: 'glasses', label: 'সানগ্লাস' },
  { id: 'hat', label: 'টুপি ও মুকুট' },
  { id: 'shoes', label: 'জুতা' },
  { id: 'watch', label: 'রিস্টওয়াচ' },
  { id: 'necklace', label: 'সোনার চেইন' },
];

const EXPRESSION_BUTTONS: {
  expr: HeroExpression;
  action: CharacterAnimAction;
  label: string;
  emoji: string;
}[] = [
  { expr: 'happy', action: 'reaction_happy', label: 'হাসি', emoji: '😄' },
  { expr: 'shocked', action: 'reaction_shocked', label: 'অবাক', emoji: '😲' },
  { expr: 'angry', action: 'reaction_angry', label: 'রাগ', emoji: '😠' },
  { expr: 'laugh', action: 'reaction_laugh', label: 'অট্টহাসি', emoji: '🤣' },
  { expr: 'thinking', action: 'reaction_think', label: 'চিন্তা', emoji: '🤔' },
];

export const CustomizationModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const customizations = useGameStore((state) => state.customizations);
  const equipped = useGameStore((state) => state.equipped);
  const heroExpression = useGameStore((state) => state.heroExpression);
  const setHeroExpression = useGameStore((state) => state.setHeroExpression);
  const equipCustomization = useGameStore((state) => state.equipCustomization);
  const buyCustomization = useGameStore((state) => state.buyCustomization);
  const balance = useGameStore((state) => state.playerStats.balance);

  const [activeTab, setActiveTab] = useState<WardrobeTab>('shirt');
  const [previewAction, setPreviewAction] = useState<CharacterAnimAction>('idle');

  const filteredItems = customizations.filter((c) => c.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/90">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0B101E] border-2 border-purple-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-purple-600/30 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-slate-950 font-black text-xl flex-shrink-0">
              👕
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-sm sm:text-lg leading-tight truncate">
                পোশাক ও কাস্টমাইজেশন (Wardrobe)
              </h2>
              <div className="text-[11px] sm:text-xs text-slate-400 truncate">
                পছন্দের শার্ট, জিন্স, স্নিকার্স, ঘড়ি, চেইন ও সানগ্লাস পরুন
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm tabular-nums">
              ৳{balance.toLocaleString()}
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex p-2.5 gap-1.5 sm:gap-2 bg-slate-950/70 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {WARDROBE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content: Live 3D Hero Preview + Items Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 no-scrollbar">
          {/* Live 3D Hero Stage */}
          <div className="md:col-span-5 flex flex-col gap-2.5">
            <CharacterPreview3D
              mode="hero"
              equipped={equipped}
              customizations={customizations}
              expression={heroExpression}
              action={previewAction}
              className="w-full h-56 sm:h-72"
            />

            {/* Expression & Reaction Tester */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>ফেস এক্সপ্রেশন ও রিঅ্যাকশন</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHeroExpression('neutral');
                    setPreviewAction('idle');
                  }}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  রিসেট
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {EXPRESSION_BUTTONS.map((btn) => {
                  const active = heroExpression === btn.expr;
                  return (
                    <button
                      key={btn.expr}
                      type="button"
                      onClick={() => {
                        setHeroExpression(btn.expr);
                        setPreviewAction(btn.action);
                      }}
                      className={`py-1.5 px-1 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                        active
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-sm leading-none">{btn.emoji}</span>
                      <span className="truncate max-w-full">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
            {filteredItems.map((item) => {
              const isEquipped = equipped[item.type] === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    isEquipped
                      ? 'bg-purple-950/60 border-purple-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl border border-white/20 shadow flex items-center justify-center font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.type === 'shirt' && '👕'}
                      {item.type === 'bottom' && '👖'}
                      {item.type === 'glasses' && '🕶️'}
                      {item.type === 'hat' && '🧢'}
                      {item.type === 'shoes' && '👟'}
                      {item.type === 'watch' && '⌚'}
                      {item.type === 'necklace' && '📿'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs sm:text-sm truncate">
                        {item.nameBn}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isEquipped ? (
                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>পরা আছে</span>
                      </span>
                    ) : item.unlocked ? (
                      <button
                        onClick={() => equipCustomization(item.type, item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-all active:scale-95"
                      >
                        পরুন
                      </button>
                    ) : (
                      <button
                        onClick={() => buyCustomization(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>৳{item.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
