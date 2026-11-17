import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { SeoLink } from '../seo/router';
import { HOME_FAQ_ITEMS } from '../seo/seoConfig';
import { CONTROL_GUIDE } from '../data/seoContent';

interface HowToPlayPageProps {
  onPlayNow: () => void;
}

export const HowToPlayPage: React.FC<HowToPlayPageProps> = ({ onPlayNow }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <SeoLink to="/" className="hover:text-amber-300 transition-colors">
          Home
        </SeoLink>
        <span aria-hidden="true">/</span>
        <span className="text-slate-200">How to Play</span>
      </nav>

      <header className="space-y-4 border-b border-slate-800/80 pb-8">
        <p className="text-xs font-semibold text-amber-400">
          Player Guide &amp; Controls · খেলার নিয়মাবলি
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
          How to Play CHANDA DE (চান্দা দে খেলার নিয়ম)
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Master walking, sprinting, shop destruction, rickshaw delivery runs, police chases, and
          passive business upgrades across Chanda City on desktop or mobile.
        </p>
      </header>

      <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0B101E]">
        <img
          src="/images/chanda-de-cartoon-gameplay.webp"
          alt="CHANDA DE gameplay showing tea stall interaction, floral rickshaw, and patrolling police officers"
          width={1024}
          height={768}
          decoding="async"
          className="w-full h-auto object-cover aspect-[4/3]"
        />
      </figure>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">5 Steps to Rule Chanda City</h2>

        <div className="space-y-5">
          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-1.5">
            <h3 className="text-lg font-bold text-amber-300">
              01. Roam the Neighborhood (শহর অন্বেষণ)
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Use WASD or the on-screen touch joystick to explore streets, alleys, and markets.
              Walking past shops automatically counts toward neighborhood discovery missions and the
              City Explorer achievement.
            </p>
          </div>

          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-1.5">
            <h3 className="text-lg font-bold text-amber-300">
              02. Smash Props &amp; Shops for Virtual Coins (ভাঙচুর ও আয়)
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Approach any roadside stall, bench, or crate and press F (or tap Smash on mobile).
              Storefronts have a 45-second cooldown after yielding coins, encouraging you to explore
              new streets instead of camping one spot.
            </p>
          </div>

          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-1.5">
            <h3 className="text-lg font-bold text-amber-300">
              03. Ride Rickshaws &amp; Complete Delivery Jobs (যাত্রা ও ডেলিভারি)
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Stop beside any parked rickshaw, CNG, bus, or van and press E (or tap যাত্রা / ভাড়া)
              to fast-travel to another district or accept a parcel delivery job for extra taka.
            </p>
          </div>

          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-1.5">
            <h3 className="text-lg font-bold text-amber-300">
              04. Handle Police Chases &amp; Fines (পুলিশ ধাওয়া সামলান)
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Too much street chaos raises your Heat bar and alerts city police. Hold Shift (or
              mobile Sprint) to outrun officers, or pay the fine shown directly on the release
              notice button if caught.
            </p>
          </div>

          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-1.5">
            <h3 className="text-lg font-bold text-amber-300">
              05. Open the Top-Right Menu for Empire Management (মেনু ও ব্যবসা)
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Click the মেনু icon above your top-right Wallet card at any time to track missions,
              inspect the world map, repair damaged street setups, unlock panjabis and sunglasses,
              and invest in passive-income businesses.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Desktop vs Mobile Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-3">
            <h3 className="text-base font-bold text-amber-300">Desktop Keyboard</h3>
            <dl className="divide-y divide-slate-800 text-sm">
              {CONTROL_GUIDE.desktop.map((c) => (
                <div key={c.key} className="py-2">
                  <dt className="font-semibold text-white">{c.key}</dt>
                  <dd className="text-slate-400">{c.action}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-3">
            <h3 className="text-base font-bold text-emerald-300">Mobile Touch</h3>
            <dl className="divide-y divide-slate-800 text-sm">
              {CONTROL_GUIDE.mobile.map((c) => (
                <div key={c.key} className="py-2">
                  <dt className="font-semibold text-white">{c.key}</dt>
                  <dd className="text-slate-400">{c.action}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold text-white">
          Frequently Asked Questions (সাধারণ প্রশ্নোত্তর)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HOME_FAQ_ITEMS.map((faq) => (
            <article
              key={faq.question}
              className="rounded-xl bg-[#0B101E] border border-slate-800 p-5 space-y-2"
            >
              <h3 className="text-base font-bold text-white leading-snug">{faq.question}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#0B101E] border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Know the ropes? Jump in now!</h2>
          <p className="text-sm text-slate-400">
            Your progress saves automatically inside your browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <SeoLink
            to="/features"
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-amber-400/60 text-sm font-semibold text-slate-200 flex items-center gap-1"
          >
            <span>All Features</span>
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
