import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Siren, Banknote, FileWarning, MapPin, Award } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface FunnyPoliceNotice {
  officer: string;
  squad: string;
  avatar: string;
  charge: string;
  quote: string;
  remark: string;
}

const FUNNY_POLICE_NOTICES: FunnyPoliceNotice[] = [
  {
    officer: 'এসআই আকরাম',
    squad: 'চান্দা দমন স্পেশাল স্কোয়াড',
    avatar: '👮‍♂️',
    charge: 'ধারা ৪২০: অতিরিক্ত বসের ভাব ও ভ্যানিটি ভাঙচুর',
    quote:
      'আরেহ মামা! ধরা খাইছেন তো?! দোকানের সামনে গিয়া "এই চান্দা দে!" চিল্লাইছিলেন, এখন নিজের পকেট থেকেই চা-সিঙ্গারার বিল দেন!',
    remark: 'হাতেনাতে মলম ও ভাঙা প্লাস্টিকের চেয়ারসহ আটক',
  },
  {
    officer: 'ওসি টুনটুনি মিয়া',
    squad: 'কোতোয়ালী চা-নাস্তা নজরদারি সেল',
    avatar: '🕵️‍♂️',
    charge: 'ধারা ৩০২-ক: মলম লাগানোর হুমকি ও দোকানদারকে ভয় দেখানো',
    quote:
      'শুনলাম আপনি নাকি সবাইরে মলম লাগায় দেওয়ার ঘোষণা দিছেন? থানায় আইসা একটু ঠান্ডা পানি খান মামা, নইলে লকআপের এসি কিন্তু বন্ধ!',
    remark: 'দোকানদারের চিৎকারে পাড়ার বিড়ালও সাক্ষী দিছে',
  },
  {
    officer: 'হাবিলদার কুদ্দুস',
    squad: 'গলি-ঘুপচি সুপারসনিক প্যাট্রল',
    avatar: '🚓',
    charge: 'ধারা ৭৮৬: বিনা লাইসেন্সে পাড়ার ডনগিরি প্র্যাকটিস',
    quote:
      'দৌড়াইয়া তো ভালোই স্প্রিন্ট দিলেন, কিন্তু কুদ্দুস চাচার চোখে ধুলা দেওয়া অসম্ভব! এখন মুখটা হাসি-হাসি রাইখা জরিমানা আর চা-পানি বুঝায় দেন!',
    remark: '৭ সেকেন্ডের অলিম্পিক দৌড় শেষে গলির মাথায় ধরা',
  },
  {
    officer: 'সার্জেন্ট বকুল',
    squad: 'মেট্রোরেল নিচতলা টহল ইউনিট',
    avatar: '🕶️',
    charge: 'ধারা ৫৫৫: বেচাকেনা নাই তবুও জোরজবরদস্তি',
    quote:
      'দোকানদার কইলো বেচাকেনা নাই, আর আপনি কিনা পুরা দোকানই উল্টায় দিলেন! সিসিটিভি ক্যামেরায় আপনার স্টাইলিশ কিক কিন্তু পুরা ভাইরাল হইছে মামা!',
    remark: 'মেট্রোর পিলারের পোস্টারের সাথে ম্যাচিং সানগ্লাস জব্দ',
  },
  {
    officer: 'এএসআই পটল',
    squad: 'বিরিয়ানি গলি জরুরি ফোর্স',
    avatar: '🚨',
    charge: 'ধারা ৯৯৯: জনসম্মুখে লুঙ্গি-পাঞ্জাবি নিয়ে হম্বিতম্বি',
    quote:
      'মামা, আপনার ফাইটিং স্টাইল দেখে তো আমি নিজেই ফ্যান হয়ে গেছি! কিন্তু ডিউটি ইজ ডিউটি—বসের ভাব একটু কমায় ভদ্রভাবে সমাধান করেন!',
    remark: 'পকেট থেকে চানাচুরের প্যাকেট ও খুচরা কয়েন উদ্ধার',
  },
  {
    officer: 'ইন্সপেক্টর চানাচুর',
    squad: 'বাজার তদারকি ও মাস্তানি নিয়ন্ত্রণ',
    avatar: '📋',
    charge: 'ধারা ১০০: সমঝোতা ছাড়াই লাথি-ঘুষি প্রয়োগ',
    quote:
      'আরে বাবা, মিষ্টি কথায় কাজ না হইলে চা খাইয়া চইলা আসতেন! তা না কইরা দোকানের টুল ভাঙলেন ক্যান? এখন থানার হাজতে বসে গল্প শোনেন!',
    remark: 'আটকের সময় "সরি সরি" গাইতে গাইতে থানায় আগমন',
  },
  {
    officer: 'কনস্টেবল মফিজ',
    squad: 'রাত-বিরাত হুইসেল ডিভিশন',
    avatar: '📯',
    charge: 'ধারা ৬৯০: পাবলিক প্লেসে অতিমাত্রায় হিরোগিরি',
    quote:
      'হিরোগিরি ফ্লপ মামা! আমার বাঁশির আওয়াজ শুনে রিকশাও ব্রেক ধরে, আর আপনি কিনা দৌড়ে পালাতে চাইলেন? এবার ভদ্র ছেলের মতো হিসাব চুকান!',
    remark: 'দৌড়ানোর সময় চটি জুতা রাস্তায় রেখে পলায়নের ব্যর্থ চেষ্টা',
  },
  {
    officer: 'ডিবি ওস্তাদ জুয়েল',
    squad: 'সিটি ক্রাইম ও কমেডি ব্যুরো',
    avatar: '🤠',
    charge: 'ধারা ৪২০-খ: এক দোকানে গণ্ডগোল করে অন্য দোকানে পোজ দেওয়া',
    quote:
      'ভেবেছিলেন ৫ সেকেন্ডে পুলিশ আসতে পারবে না? আমরাও তো ঢাকা শহরের জ্যাম চিনি মামা! এইবার স্যারের হাতে সম্মানজনক বকশিশ দিয়া কেটে পড়েন!',
    remark: 'মামলা ফাইল করা হইছে লাল কালিতে, হাসিমুখে নিষ্পত্তিযোগ্য',
  },
];

function toBanglaDigits(num: number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return Math.max(0, Math.round(num))
    .toString()
    .replace(/\d/g, (d) => bn[Number(d)] ?? d);
}

export const PoliceEncounterModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const playerStats = useGameStore((state) => state.playerStats);
  const policeState = useGameStore((state) => state.policeState);

  const notice =
    FUNNY_POLICE_NOTICES[policeState.noticeIndex % FUNNY_POLICE_NOTICES.length] ||
    FUNNY_POLICE_NOTICES[0];

  const fineAmount = policeState.lastPoliceFine;
  const fineBn = toBanglaDigits(fineAmount);

  const handleFinish = () => {
    soundManager.stopPoliceCaughtAudio();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center sm:items-center sm:justify-start p-2.5 sm:p-5 sm:pt-20 sm:pb-14">
      <div className="pointer-events-auto animate-police-notice relative w-full max-w-md sm:max-w-[395px] rounded-2xl sm:rounded-3xl bg-[#0B101E]/65 border-2 border-red-500/85 shadow-[0_14px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[50dvh] sm:max-h-[76dvh]">
        {/* Top Red/Blue Police Light Bar */}
        <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-red-600 via-blue-500 to-red-600 shrink-0" />

        {/* Header */}
        <div className="flex flex-col gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-red-700/30 via-slate-900/60 to-blue-900/30 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center justify-center gap-2 pb-1.5 border-b border-white/10">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/55" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-amber-200/95 whitespace-nowrap">
              Game Made By <span className="text-white font-bold">MD Rafiul Islam</span>
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/55" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 border border-white/20 flex items-center justify-center text-white shadow-lg shrink-0">
                <Siren className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-white text-xs sm:text-base leading-tight truncate">
                  কোতোয়ালী থানা — গ্রেপ্তার নোটিশ!
                </h2>
                <div className="text-[10px] sm:text-[11px] font-semibold text-sky-300 truncate">
                  {notice.squad}
                </div>
              </div>
            </div>

            <div className="animate-stamp-slam -rotate-6 px-2 py-0.5 rounded-lg border-2 border-rose-400 bg-rose-950/75 text-rose-200 font-black text-[10px] tracking-wide shadow shrink-0">
              ধরা খাইছে!
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 overflow-y-auto no-scrollbar">
          {/* Officer Card + Quote */}
          <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/58 border border-slate-700/60 shadow-inner">
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gradient-to-br from-blue-600/30 to-red-600/20 border border-blue-400/50 flex items-center justify-center text-2xl shadow">
              {notice.avatar}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="text-[11px] sm:text-xs font-black text-amber-400">
                  {notice.officer} বললেন:
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 tabular-nums">
                  কেস #৪২০-{toBanglaDigits(playerStats.timesCaught)}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-100 font-bangla leading-snug sm:leading-relaxed">
                &ldquo;{notice.quote}&rdquo;
              </p>
            </div>
          </div>

          {/* Charge Sheet Receipt */}
          <div className="rounded-xl bg-slate-950/55 border border-slate-700/60 p-2.5 sm:p-3 flex flex-col gap-1.5 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 font-black text-rose-400 border-b border-slate-800 pb-1">
              <FileWarning className="w-3.5 h-3.5" />
              <span>থানার চার্জশিট ও জরিমানার রসিদ</span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 shrink-0">অভিযোগ:</span>
              <span className="text-amber-300 font-bold text-right leading-tight">{notice.charge}</span>
            </div>

            <div className="flex items-center justify-between gap-2 tabular-nums">
              <span className="text-slate-400">থানায় জরিমানা কর্তন:</span>
              <span className="text-rose-400 font-black">৳{fineBn} ({fineAmount} টাকা)</span>
            </div>

            <div className="flex items-center justify-between gap-2 tabular-nums">
              <span className="text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>মোট ধরা খাওয়া:</span>
              </span>
              <span className="text-white font-bold">{toBanglaDigits(playerStats.timesCaught)} বার</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>অবস্থান:</span>
              </span>
              <span className="text-emerald-400 font-bold text-right">কোতোয়ালী থানার সামনে</span>
            </div>

            <div className="pt-1 border-t border-dashed border-slate-800 text-[10px] text-slate-400 flex items-center justify-between gap-2">
              <span className="shrink-0">মন্তব্য:</span>
              <span className="text-sky-300 italic text-right">{notice.remark}</span>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Button Showing Exact Dynamic Fine Amount */}
        <div className="p-2.5 sm:p-3.5 pt-1.5 bg-[#0B101E]/60 border-t border-slate-700/60 shrink-0">
          <button
            onClick={handleFinish}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl border-2 border-yellow-200/70 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center leading-snug"
          >
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>{fineBn} টাকা দিয়ে ছাড়া পাওয়ার জন্য এখানে ক্লিক করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
