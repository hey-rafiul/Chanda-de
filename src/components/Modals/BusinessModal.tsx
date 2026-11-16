import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { TrendingUp, ArrowUpCircle, CheckCircle, X, Coins } from 'lucide-react';

export const BusinessModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const businesses = useGameStore((state) => state.businesses);
  const playerStats = useGameStore((state) => state.playerStats);
  const buyBusiness = useGameStore((state) => state.buyBusiness);
  const upgradeBusiness = useGameStore((state) => state.upgradeBusiness);

  const totalPassivePerMinute = businesses
    .filter((b) => b.owned)
    .reduce((sum, b) => sum + b.incomePerMinute, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B101E] border-2 border-emerald-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/30 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl">
              🏢
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">
                ব্যবসা সাম্রাজ্য (Business Empire)
              </h2>
              <div className="text-xs text-slate-400">
                Chanda City Passive Income & Headquarters
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

        {/* Passive Income Summary Banner */}
        <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">বর্তমান অটোমেটিক আয় (Passive Income)</div>
              <div className="font-arcade text-3xl text-emerald-400 font-bold leading-tight">
                +৳{totalPassivePerMinute} <span className="text-xs font-bangla text-slate-400">/ প্রতি মিনিট</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">মোট অর্জিত ব্যবসা লভ্যাংশ</div>
            <div className="font-arcade text-xl text-amber-400 font-bold">
              ৳{playerStats.businessIncomeEarned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Business Assets List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 no-scrollbar">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                biz.owned
                  ? 'bg-slate-950/80 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  {biz.id === 'biz_tea_chain' && '☕'}
                  {biz.id === 'biz_rickshaw_fleet' && '🚲'}
                  {biz.id === 'biz_cng_syndicate' && '🛺'}
                  {biz.id === 'biz_hq_lounge' && '👑'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{biz.nameBn}</span>
                    {biz.owned && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        লেভেল {biz.level}/{biz.maxLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{biz.description}</p>
                  <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>আয়: +৳{biz.incomePerMinute}/মিনিট</span>
                  </div>
                </div>
              </div>

              {/* Action: Buy or Upgrade */}
              <div className="w-full sm:w-auto flex sm:flex-col justify-end items-end gap-1">
                {!biz.owned ? (
                  <button
                    onClick={() => buyBusiness(biz.id)}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-black text-xs shadow transition-all active:scale-95"
                  >
                    কিনুন ৳{biz.cost.toLocaleString()}
                  </button>
                ) : biz.level < biz.maxLevel ? (
                  <button
                    onClick={() => upgradeBusiness(biz.id)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/40 font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>উন্নত করুন (৳{biz.upgradeCost.toLocaleString()})</span>
                  </button>
                ) : (
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>সর্বোচ্চ লেভেল</span>
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
