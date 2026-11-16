import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CharacterPreview3D } from '../Three/CharacterPreview3D';
import { CharacterAnimAction } from '../../game/three/characterSystem';
import { MessageCircle, Sparkles, X, Coins, ArrowRight } from 'lucide-react';
import { NPCArchetype, NPCMood } from '../../types/game';

const moodStyles: Record<NPCMood, { badge: string; dot: string }> = {
  cheerful: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50', dot: 'bg-emerald-400' },
  friendly: { badge: 'bg-sky-500/20 text-sky-300 border-sky-400/50', dot: 'bg-sky-400' },
  busy: { badge: 'bg-amber-500/20 text-amber-300 border-amber-400/50', dot: 'bg-amber-400' },
  alert: { badge: 'bg-blue-500/20 text-blue-300 border-blue-400/50', dot: 'bg-blue-400' },
  intimidating: { badge: 'bg-rose-500/20 text-rose-300 border-rose-400/50', dot: 'bg-rose-400' },
};

const archetypePreviewAction: Record<NPCArchetype, CharacterAnimAction> = {
  tea_vendor: 'tea_serve',
  grocer: 'grocer_counter',
  rickshaw_driver: 'rickshaw_pedal',
  bus_driver: 'bus_drive',
  police_officer: 'police_alert',
  female_citizen: 'talk',
  boss_villain: 'boss_command',
};

export const NPCDialogueModal: React.FC = () => {
  const selectedNPC = useGameStore((state) => state.selectedNPC);
  const closeModal = useGameStore((state) => state.closeModal);
  const performNPCAction = useGameStore((state) => state.performNPCAction);
  const [lineIdx, setLineIdx] = useState(0);
  const [isTalkingPose, setIsTalkingPose] = useState(true);

  if (!selectedNPC) return null;

  const lines = [selectedNPC.greetingBn, ...selectedNPC.dialoguesBn];
  const currentDialogue = lines[lineIdx % lines.length];
  const moodStyle = moodStyles[selectedNPC.mood] || moodStyles.friendly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B101E] border-2 border-amber-400/70 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-white text-base sm:text-lg truncate">
                  {selectedNPC.nameBn}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${moodStyle.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${moodStyle.dot}`} />
                  {selectedNPC.moodLabelBn}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate">{selectedNPC.roleBn}</div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: 3D Character Preview + Dialogue & Actions */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 no-scrollbar">
          {/* Live 3D Character Stage */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <CharacterPreview3D
              mode="npc"
              archetype={selectedNPC.archetype}
              action={isTalkingPose ? 'talk' : archetypePreviewAction[selectedNPC.archetype]}
              className="w-full h-52 sm:h-64"
            />
            <button
              type="button"
              onClick={() => setIsTalkingPose((v) => !v)}
              className="w-full py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 transition-colors"
            >
              {isTalkingPose ? 'পেশাগত অ্যানিমেশন দেখুন' : 'কথা বলার অ্যানিমেশন দেখুন'}
            </button>
          </div>

          {/* Dialogue Bubble & Action Buttons */}
          <div className="md:col-span-7 flex flex-col justify-between gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/95 border border-amber-500/35 shadow-inner flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>সংলাপ ({(lineIdx % lines.length) + 1}/{lines.length})</span>
                </span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTalkingPose(true);
                      setLineIdx((i) => (i + 1) % lines.length);
                    }}
                    className="text-[11px] font-bold text-sky-300 hover:text-sky-200 flex items-center gap-1"
                  >
                    <span>পরের কথা</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                &ldquo;{currentDialogue}&rdquo;
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                কী করতে চান?
              </div>

              {selectedNPC.actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    setIsTalkingPose(true);
                    setLineIdx((i) => (i + 1) % lines.length);
                    performNPCAction(selectedNPC, action);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700 hover:border-amber-400/70 transition-all text-left flex items-center justify-between gap-3 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs sm:text-sm truncate">
                      {action.labelBn}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {action.sublabelBn}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {action.cost ? (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs inline-flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        ৳{action.cost}
                      </span>
                    ) : action.rewardMoney ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
                        +৳{action.rewardMoney}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold text-xs">
                        কথা বলুন
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-colors"
            >
              কথা শেষ করুন (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
