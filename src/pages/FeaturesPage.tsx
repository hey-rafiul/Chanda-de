import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { SeoLink } from '../seo/router';
import { CHARACTER_PROFILES, CITY_ZONES, CORE_FEATURES } from '../data/seoContent';

interface FeaturesPageProps {
  onPlayNow: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onPlayNow }) => {
  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <SeoLink to="/" className="hover:text-amber-300 transition-colors">
          Home
        </SeoLink>
        <span aria-hidden="true">/</span>
        <span className="text-slate-200">Features</span>
      </nav>

      <header className="space-y-4 border-b border-slate-800/80 pb-8">
        <p className="text-xs font-semibold text-amber-400">
          Open-World Systems &amp; Gameplay · গেমের বৈশিষ্ট্য
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
          CHANDA DE Game Features (চান্দা দে গেমের ফিচার)
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
          Discover everything packed inside Chanda City: 50+ storefronts, rickshaws and CNG
          transport, animated 3D Bangladeshi street characters, passive businesses, outfits, and
          dynamic weather.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Core Gameplay Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_FEATURES.map((feat) => (
            <section
              key={feat.id}
              className="rounded-xl bg-[#0B101E] border border-slate-800 p-6 space-y-3"
            >
              <span className="text-xs font-semibold text-amber-400 tabular-nums">
                {feat.number} · {feat.titleBn}
              </span>
              <h3 className="text-xl font-bold text-white">{feat.titleEn}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{feat.summary}</p>
              <ul className="space-y-1.5 pt-1 text-sm text-slate-400 list-disc list-inside">
                {feat.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Explore Chanda City Districts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CITY_ZONES.map((zone) => (
            <div
              key={zone.nameEn}
              className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-2"
            >
              <h3 className="text-lg font-bold text-amber-300">
                {zone.nameEn} ({zone.nameBn})
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{zone.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">3D Cast of Characters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHARACTER_PROFILES.map((char) => (
            <div
              key={char.nameEn}
              className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-1.5"
            >
              <p className="text-xs font-medium text-emerald-400">{char.role}</p>
              <h3 className="text-base font-bold text-white">
                {char.nameEn} · {char.nameBn}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{char.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#0B101E] border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Experience all features live in 3D</h2>
          <p className="text-sm text-slate-400">
            Runs directly in desktop and mobile browsers without downloading extra apps.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <SeoLink
            to="/updates"
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-amber-400/60 text-sm font-semibold text-slate-200 flex items-center gap-1"
          >
            <span>Latest Updates</span>
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
