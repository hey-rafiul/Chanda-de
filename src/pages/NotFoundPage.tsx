import React from 'react';
import { Play, Home } from 'lucide-react';
import { SeoLink } from '../seo/router';

interface NotFoundPageProps {
  onPlayNow: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onPlayNow }) => {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center space-y-6">
      <p className="text-sm font-semibold text-amber-400">404 · Page Not Found</p>
      <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
        এই রাস্তাটি খুঁজে পাওয়া যায়নি
      </h1>
      <p className="text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
        The page you requested does not exist in Chanda City. Return to the homepage or launch the
        3D open-world game directly.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <SeoLink
          to="/"
          className="px-5 py-3 rounded-xl bg-[#0B101E] hover:bg-slate-900 border border-slate-700 text-sm font-semibold text-white flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-amber-400" />
          <span>Back to Home</span>
        </SeoLink>

        <button
          type="button"
          onClick={onPlayNow}
          className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play CHANDA DE</span>
        </button>
      </div>
    </section>
  );
};
