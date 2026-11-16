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

export const PoliceEncounterModal: React.FC = () => {
  const closeModal = useGameStore((state) => state.closeModal);
  const playerStats = useGameStore((state) => state.playerStats);
  const policeState = useGameStore((state) => state.policeState);

  const notice =
    FUNNY_POLICE_NOTICES[policeState.noticeIndex % FUNNY_POLICE_NOTICES.length] ||
    FUNNY_POLICE_NOTICES[0];

  const handleFinish = () => {
    soundManager.stopPoliceCaughtAudio();
    soundManager.playDialogueBlip(1.25);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/92">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0B101E] border-2 border-red-500/90 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Top Red/Blue Police Light Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-blue-500 to-red-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-red-700/35 via-slate-900 to-blue-900/35 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 border border-white/20 flex items-center justify-center text-white shadow-lg shrink-0">
              <Siren className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-sm sm:text-lg leading-tight">
                  কোতোয়ালী থানা — গ্রেপ্তার নোটিশ!
                </h2>
              </div>
              <div className="text-[11px] font-semibold text-sky-300">{notice.squad}</div>
            </div>
          </div>

          <div className="-rotate-6 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border-2 border-rose-400 bg-rose-950/90 text-rose-200 font-black text-[10px] sm:text-[11px] tracking-wide shadow shrink-0">
            ধরা খাইছে!
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto no-scrollbar">
          {/* Officer Card + Quote */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-inner">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600/30 to-red-600/20 border-2 border-blue-400/50 flex items-center justify-center text-3xl shadow">
              {notice.avatar}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-amber-400">{notice.officer} বললেন:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  কেস #৪২০-{playerStats.timesCaught}
                </span>
              </div>
              <p className="text-sm text-slate-100 font-bangla leading-relaxed">
                &ldquo;{notice.quote}&rdquo;
              </p>
            </div>
          </div>

          {/* Charge Sheet Receipt */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-3.5 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-black text-rose-400 border-b border-slate-800 pb-1.5">
              <FileWarning className="w-4 h-4" />
              <span>থানার হাস্যকর চার্জশিট ও রসিদ</span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 shrink-0">অভিযোগ:</span>
              <span className="text-amber-300 font-bold text-right">{notice.charge}</span>
            </div>

            <div className="flex items-center justify-between gap-2 tabular-nums">
              <span className="text-slate-400">থানায় জরিমানা কর্তন:</span>
              <span className="text-rose-400 font-black">৳{policeState.lastPoliceFine}</span>
            </div>

            <div className="flex items-center justify-between gap-2 tabular-nums">
              <span className="text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>মোট ধরা খাওয়া:</span>
              </span>
              <span className="text-white font-bold">{playerStats.timesCaught} বার</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>বর্তমান অবস্থান:</span>
              </span>
              <span className="text-emerald-400 font-bold">কোতোয়ালী থানার সামনে (Safe Zone)</span>
            </div>

            <div className="mt-1 pt-1.5 border-t border-dashed border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
              <span>বিশেষ মন্তব্য:</span>
              <span className="text-sky-300 italic text-right">{notice.remark}</span>
            </div>
          </div>

          {/* Requested Funny Leave Button */}
          <button
            onClick={handleFinish}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base shadow-xl border-2 border-yellow-200/70 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Banknote className="w-5 h-5 shrink-0" />
            <span>আপনি ২৫০ টাকা রাখেন স্যার, আমারে ছাইরা দেন!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
