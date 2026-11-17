import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { soundManager } from '../audio/soundManager';
import { CharacterPreview3D } from './Three/CharacterPreview3D';
import { CharacterAnimAction } from '../game/three/characterSystem';
import { HeroExpression } from '../types/game';

const HERO_MOOD_OPTIONS: {
  id: HeroExpression;
  action: CharacterAnimAction;
  label: string;
  quote: string;
}[] = [
  {
    id: 'neutral',
    action: 'idle',
    label: 'স্টাইল',
    quote: '“চান্দা সিটি ঘুরে দেখতে রেডি? চলেন রাস্তায় নামি!”',
  },
  {
    id: 'happy',
    action: 'reaction_happy',
    label: '😄 হাসি',
    quote: '“চা গরম, মুড ফুরফুরে — আজ পুরো শহর জমবে!”',
  },
  {
    id: 'laugh',
    action: 'reaction_laugh',
    label: '🤣 অট্টহাসি',
    quote: '“হা হা! পুলিশের দৌড় দেখে রিকশা মামাও হাসে!”',
  },
  {
    id: 'shocked',
    action: 'reaction_shocked',
    label: '😲 অবাক',
    quote: '“ওরে বাবা! সামনে কি পুলিশ নাকি বসের গাড়ি?!”',
  },
  {
    id: 'angry',
    action: 'talk',
    label: '😠 সিরিয়াস',
    quote: '“এই এলাকার গল্পটা আজ একটু অন্যভাবে লিখতে হবে!”',
  },
];

export const HeroShowcaseLazy: React.FC = () => {
  const equipped = useGameStore((state) => state.equipped);
  const customizations = useGameStore((state) => state.customizations);
  const [selectedMoodIdx, setSelectedMoodIdx] = useState(0);

  const activeMood = HERO_MOOD_OPTIONS[selectedMoodIdx] ?? HERO_MOOD_OPTIONS[0];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold tracking-wide text-amber-300">
          লাইভ ৩ডি হিরো শোকেস
        </span>
        <span className="text-[11px] text-slate-400">
          ড্র্যাগ করে ৩৬০° ঘুরিয়ে দেখুন
        </span>
      </div>

      <CharacterPreview3D
        mode="hero"
        equipped={equipped}
        customizations={customizations}
        expression={activeMood.id}
        action={activeMood.action}
        className="w-full h-[240px] sm:h-[360px] lg:h-[390px]"
      />

      {/* Interactive Expression & Pose Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        {HERO_MOOD_OPTIONS.map((mood, idx) => {
          const isSelected = idx === selectedMoodIdx;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => {
                soundManager.playDialogueBlip(1.15);
                setSelectedMoodIdx(idx);
              }}
              className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-[#0B101E] text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white'
              }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-amber-200/85 font-bangla px-1 min-h-[20px]">
        {activeMood.quote}
      </p>
    </div>
  );
};

export default HeroShowcaseLazy;
