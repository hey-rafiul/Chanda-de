import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Backpack, ShoppingBag, Sparkles } from 'lucide-react';

export const InventoryModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const inventory = useGameStore((state) => state.inventory);
  const useInventoryItem = useGameStore((state) => state.useInventoryItem);
  const spendMoney = useGameStore((state) => state.spendMoney);
  const addInventoryItem = useGameStore((state) => state.addInventoryItem);

  const handleBuySnack = (id: 'inv_malai_cha' | 'inv_samosa_plate', price: number) => {
    if (
      !spendMoney(
        price,
        id === 'inv_malai_cha' ? 'Bought Malai Cha' : 'Bought Singara Pack',
        id === 'inv_malai_cha' ? 'মালাই চা কেনা' : 'গরম সিঙ্গারা কেনা',
        'shop'
      )
    ) {
      return;
    }

    addInventoryItem(
      id === 'inv_malai_cha'
        ? {
            id: 'inv_malai_cha',
            name: 'Hot Malai Cha Cup',
            nameBn: 'গরম মালাই চা',
            description: 'কালাম মামার স্পেশাল ঘন দুধের চা। পান করলে সম্মান ও মেজাজ ফুরফুরে হয়!',
            category: 'consumable',
            quantity: 1,
            icon: '☕',
            usable: true,
            effectText: '+10% সম্মান (Reputation)',
          }
        : {
            id: 'inv_samosa_plate',
            name: 'Crispy Singara Pack',
            nameBn: 'গরম সিঙ্গারা প্যাকেট',
            description: 'থানার পুলিশকে উপহার দিলে ওয়ান্টেড স্টার কমে যায়!',
            category: 'consumable',
            quantity: 1,
            icon: '🥟',
            usable: true,
            effectText: '-1 পুলিশ ওয়ান্টেড স্টার',
          }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0B101E] border-2 border-cyan-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-600/25 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">
                পকেট ও ব্যাগ (Inventory)
              </h2>
              <div className="text-xs text-slate-400">
                চা-সিঙ্গারা ব্যবহার করুন ও শহরের স্মারক সংগ্রহে রাখুন
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

        {/* Quick Street Vendor Supply */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>তাৎক্ষণিক নাস্তা অর্ডার (Quick Supply)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBuySnack('inv_malai_cha', 40)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 flex items-center justify-between"
            >
              <span>☕ মালাই চা</span>
              <span className="tabular-nums">৳40</span>
            </button>
            <button
              onClick={() => handleBuySnack('inv_samosa_plate', 65)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center justify-between"
            >
              <span>🥟 গরম সিঙ্গারা</span>
              <span className="tabular-nums">৳65</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {inventory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              আপনার ব্যাগ এখন খালি! উপর থেকে চা বা সিঙ্গারা কিনে নিতে পারেন।
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.nameBn}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold tabular-nums">
                        x{item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    {item.effectText && (
                      <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{item.effectText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.usable && item.quantity > 0 ? (
                  <button
                    onClick={() => useInventoryItem(item.id)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow active:scale-95 transition-transform flex-shrink-0"
                  >
                    ব্যবহার করুন
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold px-2.5 py-1 rounded-lg bg-slate-900">
                    সংগ্রহশালা
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
