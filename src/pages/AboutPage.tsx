import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { SeoLink } from '../seo/router';

interface AboutPageProps {
  onPlayNow: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onPlayNow }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <SeoLink to="/" className="hover:text-amber-300 transition-colors">
          Home
        </SeoLink>
        <span aria-hidden="true">/</span>
        <span className="text-slate-200">About CHANDA DE</span>
      </nav>

      <header className="space-y-4 border-b border-slate-800/80 pb-8">
        <p className="text-xs font-semibold text-amber-400">
          Bangladeshi 3D Comedy Open-World Game · চান্দা দে পরিচিতি
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
          About CHANDA DE (চান্দা দে)
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Learn about the inspiration, fictional city world, and comedy simulation design behind
          CHANDA DE — an independent Bangladeshi 3D browser game created by MD Rafiul Islam.
        </p>
      </header>

      <figure className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0B101E]">
        <img
          src="/images/chanda-city-streets-bangladesh.webp"
          alt="Fictional Chanda City 3D streets in CHANDA DE featuring roadside tea stalls and Bangladeshi neighborhood architecture"
          width={1200}
          height={675}
          decoding="async"
          className="w-full h-auto object-cover aspect-video"
        />
      </figure>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">
          A Fictional Slice of Dhaka Humor in 3D WebGL
        </h2>
        <p className="text-base text-slate-300 leading-relaxed">
          CHANDA DE (চান্দা দে) reimagines iconic elements of Bangladeshi city life — painted cycle
          rickshaws, glowing tin-roof cha tong stalls, bustling neighborhood bazaars, and cheeky
          street banter — inside a lightweight 3D cartoon sandbox that anyone can launch directly in
          a web browser.
        </p>
        <p className="text-base text-slate-300 leading-relaxed">
          বাংলাদেশের রাস্তার পরিচিত পরিবেশ, রিকশা আর্ট, চায়ের দোকানের আড্ডা এবং শহুরে কমেডিকে
          তিন মাত্রার (3D) ব্রাউজার গেম হিসেবে তুলে ধরতেই ‘চান্দা দে’ তৈরি করা হয়েছে। কোনো ভারী
          ইনস্টলেশন ছাড়াই মোবাইল বা কম্পিউটার থেকে সরাসরি খেলা যায়।
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Pure Entertainment &amp; Parody Disclaimer</h2>
        <p className="text-base text-slate-300 leading-relaxed">
          Every district, storefront, character archetype, and comedic encounter inside Chanda City
          is completely fictional. CHANDA DE is built strictly for lighthearted humor, sandbox fun,
          and creative technical experimentation — never depicting real people, real businesses, or
          encouraging real-world misconduct.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Technology Behind the Browser Experience</h2>
        <p className="text-base text-slate-300 leading-relaxed">
          Built with React 19, TypeScript, Three.js, Zustand, and procedural Web Audio API sound
          synthesis, CHANDA DE renders dynamic day-night lighting, rain weather effects, animated
          3D pedestrians, and interactive street vehicles smoothly across Windows, Android, macOS,
          and Linux browsers.
        </p>
      </section>

      <section className="rounded-2xl bg-[#0B101E] border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Ready to try Chanda City?</h2>
          <p className="text-sm text-slate-400">
            Jump into the 3D world now or check the controls guide first.
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
