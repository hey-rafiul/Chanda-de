import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Wrench, CheckCircle, X, Hammer } from 'lucide-react';

export const DestructionRepairModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const destructibles = useGameStore((state) => state.destructibles);
  const playerStats = useGameStore((state) => state.playerStats);
  const repairObject = useGameStore((state) => state.repairObject);
  const repairAllObjects = useGameStore((state) => state.repairAllObjects);

  const damagedList = destructibles.filter((d) => d.isDestroyed || d.health < d.maxHealth);

  const getItemCost = (item: (typeof destructibles)[0]) => {
    const ratio = item.isDestroyed ? 1 : Math.max(0.25, 1 - item.health / item.maxHealth);
    return Math.max(15, Math.round(item.repairCost * ratio));
  };

  const totalRepairCost = damagedList.reduce((acc, curr) => acc + getItemCost(curr), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-2xl rounded-3xl bd-signboard overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="h-2 w-full bd-awning-gold shrink-0" />
        {/* Header */}
        <div className="flex items-center justify-between p-4 bd-tin-trim bg-gradient-to-r from-orange-900/45 via-[#17120e] to-slate-900 border-b border-amber-500/35">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow">
              🔧
            </div>
            <div>
              <h2 className="font-bold text-amber-100 text-base sm:text-lg leading-tight">
                কালাম মিস্ত্রির ভাঙচুর ও মেরামত ওয়ার্কশপ
              </h2>
              <div className="text-xs text-amber-200/75">
                বাজারের ভাঙা দোকানপাট, সাইনবোর্ড ও বেঞ্চ মেরামত ঘর
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/35 text-amber-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mechanic Speech */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
          <div className="text-3xl">👨‍🔧</div>
          <div>
            <div className="text-xs font-bold text-orange-400">মিস্ত্রি কালাম ভাই বললেন:</div>
            <p className="text-xs sm:text-sm text-slate-200 font-bangla">
              "ওস্তাদ, শহরের মান-সম্মান রাখতে ভাঙা বোর্ড আর বেঞ্চগুলো মেরামত করলে এলাকার সম্মান বাড়বে!"
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 tabular-nums">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">ভাঙা জিনিস</span>
            <span className="font-arcade text-2xl text-rose-400 font-bold">
              {playerStats.objectsDestroyedCount}টি
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">মেরামত সম্পন্ন</span>
            <span className="font-arcade text-2xl text-emerald-400 font-bold">
              {playerStats.repairedCount}টি
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">মেরামত খরচ</span>
            <span className="font-arcade text-2xl text-amber-400 font-bold">
              ৳{playerStats.totalRepairExpenses}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">ওয়ান্টেড লেভেল</span>
            <span className="font-arcade text-2xl text-yellow-400 font-bold">
              {playerStats.wantedStars > 0 ? `${playerStats.wantedStars}★` : 'শান্ত'}
            </span>
          </div>
        </div>

        {/* Damaged Items List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1">
            <span>ক্ষতিগ্রস্ত বস্তুসমূহ ({damagedList.length}টি)</span>
            {damagedList.length > 0 && (
              <button
                onClick={repairAllObjects}
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1 transition-colors tabular-nums"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>সব মেরামত করুন (৳{totalRepairCost})</span>
              </button>
            )}
          </div>

          {damagedList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800 text-center flex flex-col items-center gap-2">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <div className="font-bold text-white text-sm">শহরের সব জিনিস এখন একদম ঠিকঠাক আছে!</div>
              <div className="text-xs text-slate-400">রাস্তায় কোনো ভাঙা সাইনবোর্ড বা টেবিল নেই।</div>
            </div>
          ) : (
            damagedList.map((item) => {
              const cost = getItemCost(item);
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-orange-500/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                      💥
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{item.nameBn}</div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        স্থায়িত্ব: {item.health}/{item.maxHealth} HP{' '}
                        {item.isDestroyed ? '• সম্পূর্ণ ভাঙা' : '• আংশিক ক্ষতিগ্রস্ত'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => repairObject(item.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-orange-500 hover:text-slate-950 text-orange-400 border border-orange-500/40 text-xs font-bold transition-colors active:scale-95 flex items-center gap-1 tabular-nums"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>মেরামত (৳{cost})</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
