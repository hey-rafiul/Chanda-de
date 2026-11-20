import React, { useEffect, useState } from 'react';
import {
  Play,
  RotateCcw,
  Settings,
  HelpCircle,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { SeoLink } from '../seo/router';
import { GameUIPreview } from '../components/Site/GameUIPreview';

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

  useEffect(() => {
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
      {/* Dhaka Golden-Hour & Rickshaw Bazaar Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913] via-[#101816] to-[#1a110d]" />
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

      {/* Top Bangladeshi Dokaan Awning Trim */}
      <div className="relative z-20 h-2 w-full bd-awning-stripe" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto min-h-[calc(100dvh-8px)] flex flex-col justify-between px-3.5 sm:px-8 py-3.5 sm:py-5 gap-5 sm:gap-7">
        {/* Bangladeshi Dokaan Signboard Header */}
        <header className="rounded-2xl bd-signboard px-3.5 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <SeoLink to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <img
              src="/assets/aistudio/chanda-de-logo_2705d40a.png"
              alt="CHANDA DE (চান্দা দে) Logo"
              width={44}
              height={44}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-md border border-amber-400/60 group-hover:scale-105 transition-transform shrink-0"
            />
            <span className="flex items-baseline gap-2">
              <span className="font-bangla font-black text-lg sm:text-2xl text-amber-300 tracking-tight whitespace-nowrap">
                চান্দা দে
              </span>
              <span className="hidden sm:inline font-arcade text-lg text-amber-100/70 tracking-widest whitespace-nowrap">
                CHANDA DE · BAZAAR
              </span>
            </span>
          </SeoLink>

          <nav aria-label="Primary Navigation" className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0e2219] hover:bg-[#143024] border border-amber-400/50 hover:border-amber-300 text-[11px] sm:text-sm font-bold text-amber-100 transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>সেটিংস</span>
            </button>
          </nav>
        </header>

        {/* Main Stage: Left Bangladeshi Dokaan Title & Actions + Right Live Game UI Preview */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto">
          {/* Left Hero Copy + Actions */}
          <section className="lg:col-span-5 min-w-0 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0e261b]/95 border border-amber-400/55 text-xs font-bold text-amber-300 shadow">
              <span>🏮</span>
              <span>চান্দা বাজার • ঢাকা এডিশন</span>
            </div>

            <div className="mt-3 sm:mt-4">
              <h1 className="font-bangla font-black text-5xl sm:text-6xl xl:text-[74px] leading-[0.98] text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-amber-300 to-orange-500 drop-shadow-[0_12px_28px_rgba(245,158,11,0.28)] tracking-tight">
                চান্দা দে
              </h1>
              <div className="font-arcade text-2xl sm:text-4xl font-bold text-amber-100/95 tracking-[0.12em] mt-1">
                CHANDA DE · DHAKA EDITION
              </div>
            </div>

            <p className="mt-3 text-base sm:text-xl font-bold text-amber-200 font-bangla">
              “এই শহরে সবার গল্প আলাদা!”
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed font-bangla">
              রঙিন রিকশা, চায়ের টং, ৫০+ বাংলাদেশী দোকান আর সরগরম বাজারের বিশাল ওপেন-ওয়ার্ল্ড শহর।
              ডান পাশেই খেলার আসল UI দেখে নিন এবং সরাসরি চান্দা সিটিতে নেমে পড়ুন!
            </p>

            {/* Primary CTA Row */}
            <div className="mt-6 flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 w-full">
              {savePreview ? (
                <>
                  <button
                    type="button"
                    onClick={onContinueGame}
                    className="w-full sm:flex-1 lg:w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_10px_28px_rgba(16,185,129,0.28)] transition-transform active:scale-95 flex flex-wrap items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5 shrink-0" />
                    <span>খেলা চালিয়ে যান</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-950/15 tabular-nums">
                      Chanda Bhai • Lv.{savePreview.level} • ৳{savePreview.balance.toLocaleString()}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="w-full sm:w-auto lg:w-full shrink-0 py-3.5 px-5 rounded-2xl bg-[#0d1c16] hover:bg-[#132b22] border-2 border-amber-400/60 hover:border-amber-300 text-amber-200 font-bold text-sm sm:text-base transition-colors active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
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
                    className="w-full sm:flex-1 lg:w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-base sm:text-lg shadow-[0_12px_32px_rgba(245,158,11,0.34)] transition-transform active:scale-95 flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current shrink-0" />
                    <span>শহরে প্রবেশ করুন (Play)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHowToPlay(true)}
                    className="w-full sm:w-auto lg:w-full shrink-0 py-3.5 px-5 rounded-2xl bg-[#0d1c16]/95 hover:bg-[#142a21] border-2 border-amber-500/40 hover:border-amber-400 text-amber-100 font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>কীভাবে খেলবেন</span>
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Right: Live Interactive Game UI Preview */}
          <section className="lg:col-span-7 min-w-0 w-full">
            <GameUIPreview
              level={savePreview?.level ?? 1}
              balance={savePreview?.balance ?? 500}
              onLaunchGame={savePreview ? onContinueGame : handleStartNew}
            />
          </section>
        </main>

        {/* Visible Entertainment Disclaimer & Compact Footer with SEO Page Links */}
        <footer className="flex flex-col gap-4 pb-2">
          <div
            role="note"
            aria-label="বিনোদনমূলক ডিসক্লেইমার"
            className="w-full rounded-2xl bd-halkhata overflow-hidden"
          >
            <div className="h-1 w-full bd-awning-gold" />
            <div className="px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
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
          <div className="w-full max-w-sm rounded-3xl bd-signboard overflow-hidden shadow-2xl text-center">
            <div className="h-2 w-full bd-awning-stripe" />
            <div className="p-6 flex flex-col gap-4">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-bold text-amber-100 text-lg">নতুন খেলা শুরু করবেন?</h3>
              <p className="text-xs text-slate-300 leading-relaxed tabular-nums">
                নতুন খেলা শুরু করলে আগের সেভ করা অগ্রগতি (Chanda Bhai • Lv.{savePreview?.level}) মুছে যাবে!
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
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
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90">
          <div className="w-full max-w-lg rounded-3xl bd-signboard overflow-hidden shadow-2xl">
            <div className="h-2 w-full bd-awning-gold" />
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                <h3 className="font-bold text-amber-100 text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>খেলার নিয়ম ও উদ্দেশ্য</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHowToPlay(false)}
                  className="text-amber-200 hover:text-white px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 space-y-2.5 leading-relaxed">
                <p>
                  <strong className="text-amber-300">১. শহর অন্বেষণ:</strong> WASD/তির বোতাম অথবা মোবাইলে জয়স্টিক দিয়ে হাঁটুন —
                  জয়স্টিক যেদিকে নেবেন ক্যামেরাও সেদিকে ঘুরবে! Shift বা <strong>জোরে দৌড়</strong> দিয়ে
                  স্প্রিন্ট করুন।
                </p>
                <p>
                  <strong className="text-amber-300">২. লাঠি হাতে দোকান ভাঙচুর:</strong> দোকানের সামনে গিয়ে হাতের লাঠি দিয়ে{' '}
                  <strong>F</strong> বা মোবাইলে <strong>লাথি</strong> চেপে ভাঙচুর করুন এবং টাকা ও XP
                  অর্জন করুন।
                </p>
                <p>
                  <strong className="text-amber-300">৩. যানবাহন ও ডেলিভারি:</strong> রিকশা, সিএনজি, বাস বা ভ্যানের সামনে গিয়ে
                  দ্রুত অন্য এলাকায় যাতায়াত করুন অথবা ডেলিভারির কাজ নিন।
                </p>
                <p>
                  <strong className="text-amber-300">৪. কার্টুন ভাঙচুর ও পুলিশ ধাওয়া:</strong> সাইনবোর্ড বা বেঞ্চে লাঠি-লাথি
                  মারুন। পুলিশ আসলে দৌড়ে পালান!
                </p>
                <p>
                  <strong className="text-amber-300">৫. ব্যবসা ও টেইলার্স:</strong> উপার্জিত টাকায় ব্যবসা কিনে প্যাসিভ আয় করুন
                  এবং নতুন পোশাক ও সানগ্লাস আনলক করুন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="mt-2 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm cursor-pointer"
              >
                বুঝেছি, চলেন শুরু করি!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
