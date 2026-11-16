import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GameTransaction } from '../../types/game';

const CATEGORY_LABELS: Record<GameTransaction['category'], string> = {
  chanda: 'চাঁদা ও সমঝোতা',
  mission: 'মিশন / অর্জন',
  delivery: 'ডেলিভারি',
  business: 'ব্যবসা',
  repair: 'মেরামত',
  fine: 'পুলিশ জরিমানা',
  shop: 'কেনাকাটা',
  transport: 'যাতায়াত',
};

export const EconomyModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const playerStats = useGameStore((state) => state.playerStats);
  const transactions = useGameStore((state) => state.transactions);

  const netProfit = playerStats.totalCollected - playerStats.totalExpenses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B101E] border-2 border-amber-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600/25 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">
                আয়-ব্যয়ের খাতা (Economy Ledger)
              </h2>
              <div className="text-xs text-slate-400">
                চান্দা সিটির সম্পূর্ণ লেনদেন ও লাভ-ক্ষতির হিসাব
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

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 tabular-nums">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col">
            <span className="text-[10px] text-slate-400">বর্তমান ব্যালেন্স</span>
            <span className="font-arcade text-2xl text-amber-400 font-bold">
              ৳{playerStats.balance.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col">
            <span className="text-[10px] text-slate-400">মোট আয়</span>
            <span className="font-arcade text-2xl text-emerald-400 font-bold">
              +৳{playerStats.totalCollected.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col">
            <span className="text-[10px] text-slate-400">মোট ব্যয়</span>
            <span className="font-arcade text-2xl text-rose-400 font-bold">
              -৳{playerStats.totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-700 flex flex-col">
            <span className="text-[10px] text-slate-400">নিট লাভ</span>
            <span
              className={`font-arcade text-2xl font-bold ${
                netProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}৳{netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transactions Feed */}
        <div className="px-4 pb-2 text-xs font-bold text-slate-400">
          সাম্প্রতিক লেনদেন ({transactions.length}টি)
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">{tx.titleBn}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{CATEGORY_LABELS[tx.category || 'chanda']}</span>
                    <span>•</span>
                    <span className="tabular-nums">{tx.timestamp}</span>
                  </div>
                </div>
              </div>

              <div
                className={`font-arcade text-lg font-bold tabular-nums ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
