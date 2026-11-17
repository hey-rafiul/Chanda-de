import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { SeoLink } from '../seo/router';
import { LATEST_UPDATES } from '../data/seoContent';

interface UpdatesPageProps {
  onPlayNow: () => void;
}

export const UpdatesPage: React.FC<UpdatesPageProps> = ({ onPlayNow }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <SeoLink to="/" className="hover:text-amber-300 transition-colors">
          Home
        </SeoLink>
        <span aria-hidden="true">/</span>
        <span className="text-slate-200">Updates</span>
      </nav>

      <header className="space-y-4 border-b border-slate-800/80 pb-8">
        <p className="text-xs font-semibold text-amber-400">
          Release Notes &amp; Improvements · গেম আপডেট
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
          Latest CHANDA DE Updates (সাম্প্রতিক আপডেট)
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Follow gameplay improvements, HUD upgrades, mobile responsiveness tuning, and browser
          loading optimizations shipped for CHANDA DE (চান্দা দে).
        </p>
      </header>

      <div className="space-y-8">
        {LATEST_UPDATES.map((entry) => (
          <section
            key={entry.version}
            className="rounded-xl bg-[#0B101E] border border-slate-800 p-6 sm:p-8 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-amber-400">{entry.version}</span>
              <span aria-hidden="true">·</span>
              <span>{entry.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{entry.title}</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{entry.summary}</p>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside pt-1">
              {entry.changes.map((chg) => (
                <li key={chg}>{chg}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="rounded-2xl bg-[#0B101E] border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Try the latest update live</h2>
          <p className="text-sm text-slate-400">
            Jump straight back into Chanda City or review game controls.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <SeoLink
            to="/how-to-play"
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-amber-400/60 text-sm font-semibold text-slate-200 flex items-center gap-1"
          >
            <span>How to Play</span>
            <ChevronRight className="w-4 h-4" />
          </SeoLink>
          <button
            type="button"
            onClick={onPlayNow}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Now</span>
          </button>
        </div>
      </section>
    </article>
  );
};
