import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import {
  X,
  Smile,
  Frown,
  Flame,
  Coins,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Package,
  Swords,
} from 'lucide-react';

export const NegotiationModal: React.FC = () => {
  const shop = useGameStore((state) => state.selectedShop);
  const closeModal = useGameStore((state) => state.closeModal);
  const addMoney = useGameStore((state) => state.addMoney);
  const addXP = useGameStore((state) => state.addXP);
  const adjustReputation = useGameStore((state) => state.adjustReputation);
  const setWantedStars = useGameStore((state) => state.setWantedStars);
  const recordNegotiationWin = useGameStore((state) => state.recordNegotiationWin);
  const setShopCooldown = useGameStore((state) => state.setShopCooldown);
  const startDeliveryJob = useGameStore((state) => state.startDeliveryJob);
  const startShopBrawl = useGameStore((state) => state.startShopBrawl);
  const activeDelivery = useGameStore((state) => state.activeDelivery);
  const shopCooldowns = useGameStore((state) => state.shopCooldowns);
  const playerStats = useGameStore((state) => state.playerStats);
  const activeEvent = useGameStore((state) => state.activeEvent);

  const [dialogueText, setDialogueText] = useState(
    shop?.dialogues.greeting[Math.floor(Math.random() * (shop?.dialogues.greeting.length || 1))] ||
      'আসুন ভাই!'
  );
  const [negotiationStep, setNegotiationStep] = useState<'intro' | 'success' | 'failed'>('intro');
  const [offeredAmount, setOfferedAmount] = useState(shop ? shop.baseContribution : 200);
  const [successMeter, setSuccessMeter] = useState(35);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!shop) return;
    const cd = shopCooldowns[shop.id] || 0;
    if (cd <= Date.now()) {
      soundManager.playChandaRefusalAfterChandaDe(shop.id);
    }
    return () => {
      soundManager.cancelPendingRefusal();
    };
  }, [shop?.id]);

  if (!shop) return null;

  const cooldownUntil = shopCooldowns[shop.id] || 0;
  const cooldownRemainingSec = Math.max(0, Math.ceil((cooldownUntil - nowMs) / 1000));
  const isOnCooldown = cooldownRemainingSec > 0 && negotiationStep === 'intro';

  const minOffer = Math.round(shop.baseContribution * 0.6);
  const maxOffer = Math.round(shop.baseContribution * 1.6);

  // Event & Level 6 bonuses
  const eventMultiplier =
    activeEvent?.effect === 'double_chanda'
      ? 1.5
      : activeEvent?.effect === 'bonus_money'
      ? 1.3
      : 1;
  const finalPayout = Math.round(offeredAmount * eventMultiplier);

  const moodBadge = {
    chill: { label: 'ফুরফুরে মেজাজ', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', icon: Smile },
    generous: { label: 'খুবই দিলদরিয়া', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', icon: Sparkles },
    nervous: { label: 'একটু নার্ভাস', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', icon: Frown },
    angry: { label: 'মেজাজ গরম!', color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: Flame },
  }[shop.ownerMood];

  const handleTactic = (tactic: 'sweet' | 'work' | 'power' | 'fair') => {
    if (isOnCooldown) return;

    // Asking above base contribution makes negotiation harder
    const greedRatio = (offeredAmount - shop.baseContribution) / Math.max(1, shop.baseContribution);
    const greedPenalty = greedRatio > 0 ? Math.round(greedRatio * 22) : Math.round(greedRatio * -10);
    const perkBonus = playerStats.level >= 6 ? 12 : 0;

    let deltaMeter = 0;
    let reply = '';

    if (tactic === 'sweet') {
      if (shop.ownerMood === 'chill' || shop.ownerMood === 'generous') {
        deltaMeter = 32;
        reply = 'হাহাহা! ভাইয়ের কথা বড় মিষ্টি! আপনার জন্য দরজা সবসময় খোলা!';
      } else {
        deltaMeter = 12;
        reply = 'মিষ্টি কথায় তো আর দোকান ভাড়ার টাকা কমবে না ভাই!';
      }
    } else if (tactic === 'work') {
      deltaMeter = 36;
      reply = 'আরে ভাই! দোকানের হিসাব-নিকাশে সাহায্য করায় খুশি হলাম!';
    } else if (tactic === 'power') {
      if (shop.ownerMood === 'angry') {
        deltaMeter = -32;
        reply = 'কার লোক মানে? এখানে কোনো বড় ভাইয়ের ভয় দেখিয়ে কাজ হবে না!';
      } else {
        deltaMeter = 20;
        reply = 'আইচ্ছা ভাই, ঝামেলা এড়াতে সমিতির তহবিলে টাকা দিচ্ছি!';
      }
    } else {
      deltaMeter = 26;
      reply = 'যুক্তিসঙ্গত হিসাব দিয়েছেন, ন্যায্য পাওনাটা দিয়ে দিচ্ছি।';
    }

    const newMeter = Math.max(0, Math.min(100, successMeter + deltaMeter - greedPenalty + perkBonus));
    setSuccessMeter(newMeter);
    setDialogueText(newMeter < 75 && newMeter > 15 ? `বেচাকেনা নাই, আজকে হবে না! ${reply}` : reply);

    if (newMeter >= 75) {
      soundManager.cancelPendingRefusal();
      setNegotiationStep('success');
      confetti({ particleCount: 55, spread: 60, origin: { y: 0.6 } });
      addMoney(finalPayout, `Contribution: ${shop.name}`, `${shop.nameBn} থেকে সমঝোতা`, 'chanda');
      addXP(80);
      recordNegotiationWin(shop.id);
    } else if (newMeter <= 15) {
      if (!soundManager.hasPlayedRefusalForShop(shop.id)) {
        soundManager.playChandaRefusalVoice(true, shop.id, true);
      }
      setNegotiationStep('failed');
      window.setTimeout(() => soundManager.playHit(), 350);
      setShopCooldown(shop.id, 30000);
      adjustReputation(-3);
      if (shop.ownerMood === 'angry') {
        setWantedStars(playerStats.wantedStars + 1);
      }
    } else {
      soundManager.playDialogueBlip(1.05);
    }
  };

  const handleTakeDelivery = () => {
    const job = startDeliveryJob(shop.nameBn);
    if (job) {
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0B101E] border-2 border-amber-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600/25 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl">
              🏪
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">{shop.nameBn}</h2>
              <div className="text-xs text-slate-400">
                {shop.name} • {shop.ownerName}
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

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          {/* Mood & Payout */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <moodBadge.icon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">মেজাজ:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${moodBadge.color}`}>
                {moodBadge.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold tabular-nums">
              <Coins className="w-4 h-4" />
              <span>সম্ভাব্য আদায়: ৳{finalPayout}</span>
              {eventMultiplier > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  ইভেন্ট বোনাস!
                </span>
              )}
            </div>
          </div>

          {/* Dialogue Bubble */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex items-start gap-3">
            <div className="text-2xl mt-0.5">💬</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-400 mb-1">{shop.ownerName} বললেন:</span>
              <p className="text-sm sm:text-base text-slate-100 font-bangla leading-relaxed">
                {isOnCooldown
                  ? `"মামা, এইমাত্র তো হিসাব চুকিয়ে দিলাম! আরও ${cooldownRemainingSec} সেকেন্ড পর আবার আসুন!"`
                  : `"${dialogueText}"`}
              </p>
            </div>
          </div>

          {/* Cooldown Lock State */}
          {isOnCooldown ? (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 flex flex-col items-center gap-2 text-center">
              <Clock className="w-8 h-8 text-amber-400" />
              <div className="font-bold text-white text-sm">দোকানদার বিশ্রামে আছেন</div>
              <div className="text-xs text-slate-400 tabular-nums">
                পুনরায় সমঝোতার জন্য অপেক্ষা করুন: <strong className="text-amber-300">{cooldownRemainingSec}s</strong>
              </div>
              {shop.hasTask && !activeDelivery && (
                <button
                  onClick={handleTakeDelivery}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>পার্সেল ডেলিভারির কাজ নিন</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Custom Offer Slider */}
              {negotiationStep === 'intro' && (
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">চাঁদার পরিমাণ নির্ধারণ করুন:</span>
                    <span className="text-amber-400 tabular-nums">৳{offeredAmount}</span>
                  </div>
                  <input
                    type="range"
                    min={minOffer}
                    max={maxOffer}
                    step={10}
                    value={offeredAmount}
                    onChange={(e) => setOfferedAmount(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>সহজ (৳{minOffer})</span>
                    <span>স্বাভাবিক (৳{shop.baseContribution})</span>
                    <span>কঠিন (৳{maxOffer})</span>
                  </div>
                </div>
              )}

              {/* Success Meter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span className="text-slate-400">সমঝোতার মেজাজ (লক্ষ্য: ৭৫%)</span>
                  <span
                    className={
                      successMeter >= 75
                        ? 'text-emerald-400'
                        : successMeter <= 25
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }
                  >
                    {successMeter}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      successMeter >= 75
                        ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                        : successMeter <= 25
                        ? 'bg-gradient-to-r from-rose-600 to-red-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${successMeter}%` }}
                  />
                </div>
              </div>

              {/* Action Tactics */}
              {negotiationStep === 'intro' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleTactic('sweet')}
                      className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-left flex items-center gap-3 transition-colors active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                        🍬
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">মিষ্টি কথা</div>
                        <div className="text-[11px] text-slate-400">দোকানের প্রশংসা করুন</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTactic('work')}
                      className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-emerald-400 text-left flex items-center gap-3 transition-colors active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
                        🤝
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">কাজের সাহায্য</div>
                        <div className="text-[11px] text-slate-400">একটু হাত লাগিয়ে দিন</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTactic('fair')}
                      className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-blue-400 text-left flex items-center gap-3 transition-colors active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base">
                        ⚖️
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">ন্যায্য প্রস্তাব</div>
                        <div className="text-[11px] text-slate-400">সমিতির হিসাব বোঝান</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTactic('power')}
                      className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-rose-400 text-left flex items-center gap-3 transition-colors active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-base">
                        😎
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">বসের ভাব</div>
                        <div className="text-[11px] text-slate-400">এলাকার প্রভাব দেখান</div>
                      </div>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startShopBrawl(shop.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/70 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                      <Swords className="w-4 h-4" />
                      <span>চাঁদা না দিলে মারামারি ও ভাঙচুর!</span>
                    </button>

                    {shop.hasTask && !activeDelivery && (
                      <button
                        onClick={handleTakeDelivery}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>ডেলিভারি কাজ (+৳{shop.taskReward})</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {negotiationStep === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/80 flex flex-col items-center gap-2 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <div className="font-bold text-lg text-emerald-300">চান্দা সফলভাবে আদায় হয়েছে!</div>
                  <div className="text-xs text-slate-300 tabular-nums">
                    দোকানদার রাজি হয়ে ৳{finalPayout} টাকা আপনার তহবিলে দিয়েছেন।
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-2 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                  >
                    ধন্যবাদ বলে প্রস্থান
                  </button>
                </div>
              )}

              {negotiationStep === 'failed' && (
                <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500/80 flex flex-col items-center gap-3 text-center">
                  <ShieldAlert className="w-10 h-10 text-rose-400" />
                  <div className="font-bold text-lg text-rose-300">দোকানদার চান্দা দিতে অস্বীকার করেছে!</div>
                  <div className="text-xs text-slate-300">
                    কথায় কাজ না হলে দোকানের সামনে মারামারি ও ভাঙচুর করে টাকা আদায় করুন!
                  </div>
                  <div className="flex flex-wrap justify-center gap-2.5 mt-1 w-full">
                    <button
                      onClick={() => startShopBrawl(shop.id)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                      <Swords className="w-4 h-4" />
                      <span>মারামারি ও ভাঙচুর শুরু করুন!</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                    >
                      চলে আসুন
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
