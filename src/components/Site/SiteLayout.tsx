import React from 'react';
import { Play, ShieldAlert } from 'lucide-react';
import { SeoLink, useSeoRouter } from '../../seo/router';

interface SiteLayoutProps {
  onPlayNow: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'How to Play', href: '/how-to-play' },
  { label: 'Features', href: '/features' },
  { label: 'Updates', href: '/updates' },
];

export const SiteLayout: React.FC<SiteLayoutProps> = ({ onPlayNow, children }) => {
  const { path } = useSeoRouter();

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col select-text">
      {/* Sticky Single-Row Top Bar (3-Zone Contract) */}
      <header className="sticky top-0 z-40 bg-[#070a12]/95 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Clean Brand Mark */}
          <SeoLink
            to="/"
            className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-amber-400 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded-md"
          >
            <img
              src="/assets/aistudio/chanda-de-logo_2705d40a.png"
              alt="CHANDA DE game emblem"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-400/50"
            />
            <span>CHANDA DE</span>
          </SeoLink>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            {NAV_ITEMS.map((item) => {
              const active = path === item.href;
              return (
                <SeoLink
                  key={item.href}
                  to={item.href}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
                    active
                      ? 'text-amber-300 border-amber-400 font-semibold'
                      : 'text-slate-300 border-transparent hover:text-white hover:border-slate-600'
                  }`}
                >
                  {item.label}
                </SeoLink>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onPlayNow}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>Play Now</span>
            </button>
          </div>
        </div>

        {/* Clean Single-Row Mobile Navigation */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-slate-800/70 px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar text-xs font-medium"
        >
          <SeoLink
            to="/"
            className={`py-1 whitespace-nowrap shrink-0 ${
              path === '/' ? 'text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Home
          </SeoLink>
          {NAV_ITEMS.map((item) => {
            const active = path === item.href;
            return (
              <SeoLink
                key={item.href}
                to={item.href}
                className={`py-1 whitespace-nowrap shrink-0 ${
                  active ? 'text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </SeoLink>
            );
          })}
        </nav>
      </header>

      {/* Page Body */}
      <main className="flex-1 w-full">{children}</main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050810] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/chanda-de-logo_2705d40a.png"
                  alt="CHANDA DE logo"
                  width={36}
                  height={36}
                  loading="lazy"
                  className="w-9 h-9 rounded-full object-cover border border-amber-400/50"
                />
                <span className="text-lg font-bold text-amber-400">
                  CHANDA DE (চান্দা দে)
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Free Bangladeshi 3D open-world comedy browser game set in fictional Chanda City.
                Built for desktop and mobile web browsers with Three.js, React, and Web Audio.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2.5">
              <h2 className="text-sm font-semibold text-white">Explore Pages</h2>
              <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                <li>
                  <SeoLink to="/" className="hover:text-amber-300 transition-colors">
                    Home
                  </SeoLink>
                </li>
                <li>
                  <SeoLink to="/about" className="hover:text-amber-300 transition-colors">
                    About CHANDA DE
                  </SeoLink>
                </li>
                <li>
                  <SeoLink to="/how-to-play" className="hover:text-amber-300 transition-colors">
                    How to Play
                  </SeoLink>
                </li>
                <li>
                  <SeoLink to="/features" className="hover:text-amber-300 transition-colors">
                    Game Features
                  </SeoLink>
                </li>
                <li>
                  <SeoLink to="/updates" className="hover:text-amber-300 transition-colors">
                    Latest Updates
                  </SeoLink>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onPlayNow}
                    className="text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer text-left"
                  >
                    Launch 3D Game
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <h2 className="text-sm font-semibold text-white">Game Platform</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Web Browser (Windows, Android, macOS, Linux) · Free to Play · Developed by{' '}
                <span className="text-slate-200 font-medium">MD Rafiul Islam</span>
              </p>
            </div>
          </div>

          <div
            role="note"
            aria-label="Entertainment Disclaimer"
            className="rounded-xl bg-[#0B101E] border border-slate-800 px-4 py-3.5 flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-amber-300">বিশেষ দ্রষ্টব্য (Disclaimer):</strong> ‘চান্দা দে
              (CHANDA DE)’ গেমটি সম্পূর্ণ কাল্পনিক এবং শুধুমাত্র নিখাদ বিনোদন ও হাস্যরসের উদ্দেশ্যে
              তৈরি করা হয়েছে। এর কোনো চরিত্র, ঘটনা বা এলাকার সাথে বাস্তব জীবনের কোনো ব্যক্তি বা
              প্রতিষ্ঠানের সম্পর্ক নেই।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-5">
            <span>© 2026 CHANDA DE (চান্দা দে). Fictional Bangladeshi 3D Browser Game.</span>
            <span>Developed By MD Rafiul Islam</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
