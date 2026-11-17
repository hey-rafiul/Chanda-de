import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Play,
  RotateCcw,
  Settings,
  HelpCircle,
  Award,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { SeoLink } from '../seo/router';

const HeroShowcaseLazy = lazy(() => import('../components/HeroShowcaseLazy'));

interface LandingPageProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenSettings: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenSettings,
}) => {
  const [savePreview, setSavePreview] = useState<{ level: number; balance: number } | null>(null);
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    try {
      const raw =
        localStorage.getItem('chanda_de_save_v2') || localStorage.getItem('chanda_de_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavePreview({
          level: parsed?.playerStats?.level || 1,
          balance: parsed?.playerStats?.balance || 500,
        });
      }
    } catch {
      // Ignore malformed storage
    }
  }, []);

  const handleStartNew = () => {
    if (savePreview && !showNewConfirm) {
      setShowNewConfirm(true);
      return;
    }
    setShowNewConfirm(false);
    onStartNewGame();
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#060913] text-slate-100 overflow-x-hidden select-none">
      {/* Dhaka Golden-Hour & Rickshaw Dusk Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913] via-[#130f26] to-[#1e1312]" />
        <div
          className="absolute -top-28 right-[-8%] w-[520px] h-[520px] rounded-full opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.34) 0%, rgba(234,88,12,0.12) 45%, transparent 72%)',
          }}
        />
        <div
          className="absolute bottom-[-120px] left-[-6%] w-[460px] h-[460px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(56,189,248,0.08) 50%, transparent 75%)',
          }}
        />

        {/* Stylized Dhaka Skyline Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 px-4 sm:px-10 opacity-30">
          <div className="w-12 sm:w-20 h-32 sm:h-48 bg-[#0b1120] border-t border-amber-500/25 rounded-t-sm" />
          <div className="w-16 sm:w-28 h-48 sm:h-72 bg-[#0b1120] border-t border-amber-400/20 rounded-t-sm" />
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-14 h-9 bg-amber-900/40 rounded-t-full border-t border-amber-400/35" />
            <div className="w-24 h-36 bg-[#0b1120] border-t border-amber-500/25" />
          </div>
          <div className="w-20 sm:w-32 h-40 sm:h-64 bg-[#0b1120] border-t border-emerald-400/20 rounded-t-sm" />
          <div className="w-14 sm:w-24 h-28 sm:h-44 bg-[#0b1120] border-t border-amber-500/25 rounded-t-sm" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto min-h-[100dvh] flex flex-col justify-between px-3.5 sm:px-8 py-3.5 sm:py-6 gap-6 sm:gap-8">
        {/* Clean Single-Row Navigation Header */}
        <header className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-b border-slate-800/80 pb-3">
          <SeoLink to="/" className="flex items-baseline gap-2 shrink-0">
            <span className="font-bangla font-black text-lg sm:text-2xl text-amber-400 tracking-tight whitespace-nowrap">
              চান্দা দে
            </span>
            <span className="hidden sm:inline font-arcade text-lg text-slate-400 tracking-widest whitespace-nowrap">
              CHANDA DE
            </span>
          </SeoLink>

          <nav aria-label="Primary Navigation" className="flex items-center gap-1 sm:gap-4 ml-auto">
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              className="px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-sm font-semibold text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>নিয়ম</span>
              <span className="hidden sm:inline">ও উদ্দেশ্য</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCredits(true)}
              className="px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-sm font-semibold text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>কৃতজ্ঞতা</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/60 text-[11px] sm:text-sm font-bold text-slate-200 transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>সেটিংস</span>
            </button>
          </nav>
        </header>

        {/* Asymmetric Hero Section */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-auto">
          {/* Left Hero Copy + Actions */}
          <section className="lg:col-span-7 flex flex-col items-start text-left">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-amber-400/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>বাঙালি স্ট্রিট-লাইফ কমেডি ওপেন-ওয়ার্ল্ড সিমুলেটর</span>
            </p>

            <div className="mt-2 sm:mt-3">
              <h1 className="font-bangla font-black text-5xl sm:text-7xl lg:text-[86px] leading-[0.98] text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-amber-300 to-orange-500 drop-shadow-[0_12px_28px_rgba(245,158,11,0.28)] tracking-tight">
                চান্দা দে
              </h1>
              <div className="font-arcade text-2xl sm:text-5xl font-bold text-white/95 tracking-[0.12em] sm:tracking-[0.14em] mt-1">
                CHANDA DE · DHAKA EDITION
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-sm sm:text-xl font-bold text-amber-200 font-bangla">
              “এই শহরে সবার গল্প আলাদা!”
            </p>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-300 max-w-xl leading-relaxed font-bangla">
              রঙিন রিকশা, চায়ের টং, ৫০+ দোকান আর মজাদার সব চরিত্রের বিশাল শহর। লাঠি হাতে ভাঙচুর
              করুন, ডেলিভারি ও ব্যবসা সাম্রাজ্য গড়ুন, আর পুলিশের মজার তাড়া খেয়ে পালিয়ে বেড়ান!
            </p>

            {/* Primary CTA Row */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {savePreview ? (
                <>
                  <button
                    type="button"
                    onClick={onContinueGame}
                    className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-base shadow-[0_10px_28px_rgba(16,185,129,0.28)] transition-transform active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5 shrink-0" />
                    <span>খেলা চালিয়ে যান</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-950/15 tabular-nums">
                      Lv.{savePreview.level} • ৳{savePreview.balance.toLocaleString()}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/60 hover:border-amber-400 text-amber-300 font-bold text-base transition-colors active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>নতুন খেলা</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="py-4 px-7 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-lg shadow-[0_12px_32px_rgba(245,158,11,0.34)] transition-transform active:scale-95 flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current shrink-0" />
                    <span>শহরে প্রবেশ করুন (Play)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHowToPlay(true)}
                    className="py-4 px-5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>কীভাবে খেলবেন</span>
                  </button>
                </>
              )}
            </div>

            {/* Editorial Unboxed Highlights Strip */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 w-full">
              <div>
                <div className="font-arcade text-xl text-amber-400 leading-none">01</div>
                <div className="mt-1 text-sm font-bold text-white">৫০+ দোকান</div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  বিশাল শহর, ভাঙচুর ও মজার কাণ্ড
                </p>
              </div>
              <div>
                <div className="font-arcade text-xl text-emerald-400 leading-none">02</div>
                <div className="mt-1 text-sm font-bold text-white">৭টি 3D চরিত্র</div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  চা-ওয়ালা, রিকশাচালক, পুলিশ ও বস
                </p>
              </div>
              <div>
                <div className="font-arcade text-xl text-sky-400 leading-none">03</div>
                <div className="mt-1 text-sm font-bold text-white">ব্যবসা সাম্রাজ্য</div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  রিকশা ফ্লিট ও স্টল থেকে প্যাসিভ আয়
                </p>
              </div>
              <div>
                <div className="font-arcade text-xl text-orange-400 leading-none">04</div>
                <div className="mt-1 text-sm font-bold text-white">হিরো ওয়ার্ডরোব</div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  পাঞ্জাবি, সানগ্লাস ও স্টাইলিশ লুক
                </p>
              </div>
            </div>
          </section>

          {/* Right Live Interactive 3D Hero Stage */}
          <section className="lg:col-span-5 flex flex-col gap-3 w-full">
            {hasMounted ? (
              <Suspense
                fallback={
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold tracking-wide text-amber-300">
                        লাইভ ৩ডি হিরো শোকেস
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ড্র্যাগ করে ৩৬০° ঘুরিয়ে দেখুন
                      </span>
                    </div>
                    <img
                      src="/images/chanda-de-hero-open-world.webp"
                      alt="CHANDA DE Bangladeshi 3D open-world cartoon game hero in Chanda City"
                      width={1280}
                      height={720}
                      fetchPriority="high"
                      className="w-full h-[240px] sm:h-[360px] lg:h-[390px] object-cover rounded-2xl border border-slate-800"
                    />
                  </div>
                }
              >
                <HeroShowcaseLazy />
              </Suspense>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold tracking-wide text-amber-300">
                    লাইভ ৩ডি হিরো শোকেস
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ড্র্যাগ করে ৩৬০° ঘুরিয়ে দেখুন
                  </span>
                </div>
                <img
                  src="/images/chanda-de-hero-open-world.webp"
                  alt="CHANDA DE Bangladeshi 3D open-world cartoon game hero in Chanda City"
                  width={1280}
                  height={720}
                  fetchPriority="high"
                  className="w-full h-[240px] sm:h-[360px] lg:h-[390px] object-cover rounded-2xl border border-slate-800"
                />
              </div>
            )}
          </section>
        </main>

        {/* Visible Entertainment Disclaimer & Compact Footer with SEO Page Links */}
        <footer className="flex flex-col gap-4 pb-2">
          <div
            role="note"
            aria-label="বিনোদনমূলক ডিসক্লেইমার"
            className="w-full rounded-xl bg-[#0B101E] border border-amber-500/35 px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 text-xs sm:text-[13px] leading-relaxed font-bangla">
              <span className="font-bold text-amber-300 mr-1.5">
                বিশেষ দ্রষ্টব্য (Disclaimer):
              </span>
              <span className="text-slate-300">
                ‘চান্দা দে (CHANDA DE)’ গেমটি সম্পূর্ণ কাল্পনিক এবং{' '}
                <strong className="text-white font-bold">
                  শুধুমাত্র নিখাদ বিনোদন ও হাস্যরসের (Entertainment &amp; Comedy) উদ্দেশ্যে তৈরি
                  করা হয়েছে।
                </strong>{' '}
                এর কোনো চরিত্র, ঘটনা, এলাকা বা সংলাপের সাথে বাস্তব জীবনের কোনো ব্যক্তি, পেশা
                কিংবা প্রতিষ্ঠানের সম্পর্ক নেই এবং কোনো বেআইনি কাজকে উৎসাহিত করা হয় না।
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/70 pt-3">
            <span>© 2026 Chanda De Studio · কাল্পনিক শহুরে কমেডি সিমুলেশন</span>
            <nav aria-label="Game Pages" className="flex items-center gap-4 text-xs text-slate-400">
              <SeoLink to="/about" className="hover:text-amber-300 transition-colors">
                About
              </SeoLink>
              <SeoLink to="/how-to-play" className="hover:text-amber-300 transition-colors">
                How to Play
              </SeoLink>
              <SeoLink to="/features" className="hover:text-amber-300 transition-colors">
                Features
              </SeoLink>
              <SeoLink to="/updates" className="hover:text-amber-300 transition-colors">
                Updates
              </SeoLink>
            </nav>
            <span className="font-medium text-slate-300">
              Developed By <span className="text-amber-300 font-bold">MD Rafiul Islam</span>
            </span>
          </div>
        </footer>
      </div>

      {/* New Game Overwrite Confirmation */}
      {showNewConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
          <div className="w-full max-w-sm rounded-2xl bg-[#0B101E] border border-amber-500/60 p-6 flex flex-col gap-4 shadow-2xl text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-bold text-white text-lg">নতুন খেলা শুরু করবেন?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              নতুন খেলা শুরু করলে আগের সেভ করা অগ্রগতি (Lv.{savePreview?.level}) মুছে যাবে!
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartNew}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                হ্যাঁ, নতুন শুরু করুন
              </button>
              <button
                type="button"
                onClick={() => setShowNewConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B101E] border border-amber-500/50 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>খেলার নিয়ম ও উদ্দেশ্য</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                <strong>১. শহর অন্বেষণ:</strong> WASD/তির বোতাম অথবা মোবাইলে জয়স্টিক দিয়ে হাঁটুন —
                জয়স্টিক যেদিকে নেবেন ক্যামেরাও সেদিকে ঘুরবে! Shift বা <strong>জোরে দৌড়</strong> দিয়ে
                স্প্রিন্ট করুন।
              </p>
              <p>
                <strong>২. লাঠি হাতে দোকান ভাঙচুর:</strong> দোকানের সামনে গিয়ে হাতের লাঠি দিয়ে{' '}
                <strong>F</strong> বা মোবাইলে <strong>লাথি</strong> চেপে ভাঙচুর করুন এবং টাকা ও XP
                অর্জন করুন।
              </p>
              <p>
                <strong>৩. যানবাহন ও ডেলিভারি:</strong> রিকশা, সিএনজি, বাস বা ভ্যানের সামনে গিয়ে
                দ্রুত অন্য এলাকায় যাতায়াত করুন অথবা ডেলিভারির কাজ নিন।
              </p>
              <p>
                <strong>৪. কার্টুন ভাঙচুর ও পুলিশ ধাওয়া:</strong> সাইনবোর্ড বা বেঞ্চে লাঠি-লাথি
                মারুন। পুলিশ আসলে দৌড়ে পালান!
              </p>
              <p>
                <strong>৫. ব্যবসা ও ওয়ার্ডরোব:</strong> উপার্জিত টাকায় ব্যবসা কিনে প্যাসিভ আয় করুন
                এবং নতুন পোশাক ও সানগ্লাস আনলক করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHowToPlay(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm cursor-pointer"
            >
              বুঝেছি, চলেন শুরু করি!
            </button>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
          <div className="w-full max-w-md rounded-2xl bg-[#0B101E] border border-emerald-500/50 p-6 flex flex-col gap-4 shadow-2xl text-center">
            <div className="text-4xl">👑</div>
            <h3 className="font-bold text-white text-xl">চান্দা দে — CHANDA DE</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              একটি কাল্পনিক সামাজিক স্যাটায়ার ও কমেডি ওপেন-ওয়ার্ল্ড গেম। বাংলাদেশী রিকশা আর্ট,
              রঙিন চায়ের স্টল, ট্রাফিক এবং শহুরে সংস্কৃতির ভালোবাসায় শুধুমাত্র বিনোদনের জন্য
              নির্মিত।
            </p>
            <div className="text-[11px] text-amber-400 font-medium">
              React 19 • TypeScript • Three.js • Zustand • Web Audio API
            </div>
            <button
              type="button"
              onClick={() => setShowCredits(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
