import type { Bi, Lang } from './types';

/**
 * All interface copy. Content data (formulas, chapters, categories) carries its
 * own bilingual fields in `src/data`.
 */
export const dict = {
  'brand.name': { en: 'MathUniverse', bn: 'ম্যাথইউনিভার্স' },
  'brand.tagline': { en: 'Mathematics, Class 1 → 12', bn: 'গণিত, শ্রেণী ১ → ১২' },

  'nav.home': { en: 'Home', bn: 'হোম' },
  'nav.formulas': { en: 'Formulas', bn: 'সূত্র' },
  'nav.solver': { en: 'Solver', bn: 'সমাধান' },
  'nav.practice': { en: 'Practice', bn: 'অনুশীলন' },
  'nav.secondary': { en: 'Class 9–10', bn: 'শ্রেণী ৯–১০' },
  'nav.menu': { en: 'Open menu', bn: 'মেনু খুলুন' },

  'common.search': { en: 'Search', bn: 'খুঁজুন' },
  'common.searchShort': { en: 'Search…', bn: 'খুঁজুন…' },
  'common.searchPlaceholder': {
    en: 'Search formulas, chapters, topics…',
    bn: 'সূত্র, অধ্যায়, বিষয় খুঁজুন…',
  },
  'common.close': { en: 'Close', bn: 'বন্ধ করুন' },
  'common.copy': { en: 'Copy', bn: 'কপি' },
  'common.copied': { en: 'Copied', bn: 'কপি হয়েছে' },
  'common.clear': { en: 'Clear', bn: 'মুছুন' },
  'common.reset': { en: 'Reset', bn: 'রিসেট' },
  'common.viewAll': { en: 'View all', bn: 'সব দেখুন' },
  'common.all': { en: 'All', bn: 'সব' },
  'common.tryIt': { en: 'Try it', bn: 'চেষ্টা করুন' },
  'common.learnMore': { en: 'Learn more', bn: 'আরও জানুন' },
  'common.backHome': { en: 'Back to home', bn: 'হোমে ফিরুন' },
  'common.results': { en: 'results', bn: 'ফলাফল' },
  'common.noResults': { en: 'Nothing matched that search.', bn: 'এই অনুসন্ধানে কিছু পাওয়া যায়নি।' },
  'common.somethingWrong': { en: 'Something went wrong.', bn: 'কিছু একটা ভুল হয়েছে।' },

  'home.badge': { en: 'From Class 1 to 12 — all in one place', bn: 'শ্রেণী ১ থেকে ১২ — একটি জায়গায়' },
  'home.heroTitle1': { en: 'Mathematics,', bn: 'গণিত,' },
  'home.heroTitle2': { en: 'made clear.', bn: 'সহজ করে।' },
  'home.heroSub': {
    en: 'Chapter notes, a searchable formula library, a step-by-step solver that works offline, and unlimited practice — in English and বাংলা.',
    bn: 'অধ্যায়ভিত্তিক নোট, খোঁজার মতো সূত্র-লাইব্রেরি, ইন্টারনেট ছাড়াই ধাপে ধাপে সমাধান এবং অসীম অনুশীলন — ইংরেজি ও বাংলায়।',
  },
  'home.heroSearch': { en: 'Type a problem, e.g. x² − 5x + 6 = 0', bn: 'সমস্যা লিখুন, যেমন x² − 5x + 6 = 0' },
  'home.solve': { en: 'Solve', bn: 'সমাধান' },
  'home.browse': { en: 'Browse formulas', bn: 'সূত্র দেখুন' },
  'home.stat.formulas': { en: 'formulas', bn: 'সূত্র' },
  'home.stat.chapters': { en: 'chapters', bn: 'অধ্যায়' },
  'home.stat.practice': { en: 'practice topics', bn: 'অনুশীলন বিষয়' },
  'home.stat.languages': { en: 'languages', bn: 'ভাষা' },
  'home.stat.free': { en: 'free & offline', bn: 'ফ্রি ও অফলাইন' },
  'home.categories.title': { en: 'Choose your level', bn: 'আপনার স্তর বেছে নিন' },
  'home.categories.desc': {
    en: 'From first sums to research mathematics — every stage has its own shelf.',
    bn: 'প্রথম যোগ থেকে গবেষণা-গণিত — প্রতিটি স্তরের জন্য আলাদা তাক।',
  },
  'home.categories.start': { en: 'Start learning', bn: 'শেখা শুরু করুন' },
  'home.features.title': { en: 'Four tools, one place', bn: 'চারটি সরঞ্জাম, এক জায়গায়' },
  'home.features.desc': {
    en: 'Everything you need to understand a topic and then make it stick.',
    bn: 'বিষয়টি বোঝার এবং তা মনে রাখার জন্য যা যা প্রয়োজন।',
  },
  'home.feature.notes.title': { en: 'Chapter notes', bn: 'অধ্যায় নোট' },
  'home.feature.notes.desc': {
    en: 'Class 9–10 chapters broken into topics, with video and problem counts.',
    bn: 'শ্রেণী ৯–১০ এর অধ্যায়, বিষয় অনুযায়ী ভাগ, ভিডিও ও সমস্যার হিসাবসহ।',
  },
  'home.feature.formulas.title': { en: 'Formula library', bn: 'সূত্র-লাইব্রেরি' },
  'home.feature.formulas.desc': {
    en: 'Every identity you need, searchable and one tap from the clipboard.',
    bn: 'প্রয়োজনীয় সব সূত্র — খোঁজা যায়, এক ট্যাপে কপি হয়।',
  },
  'home.feature.solver.title': { en: 'Step-by-step solver', bn: 'ধাপে ধাপে সমাধান' },
  'home.feature.solver.desc': {
    en: 'Equations, derivatives, integrals, limits and more — with every step explained.',
    bn: 'সমীকরণ, অন্তরকলন, সমাকলন, সীমা — প্রতিটি ধাপ ব্যাখ্যা করে।',
  },
  'home.feature.practice.title': { en: 'Endless practice', bn: 'অসীম অনুশীলন' },
  'home.feature.practice.desc': {
    en: 'Fresh questions every time, instant checking and a streak to keep.',
    bn: 'প্রতিবার নতুন প্রশ্ন, সাথে সাথে উত্তর যাচাই আর ধারাবাহিকতার হিসাব।',
  },
  'home.spotlight.title': { en: 'Formula spotlight', bn: 'সূত্রে আলো' },
  'home.spotlight.desc': { en: 'One to carry with you today.', bn: 'আজকের জন্য একটি সূত্র।' },
  'home.spotlight.random': { en: 'Shuffle', bn: 'অন্য সূত্র' },
  'home.cta.title': { en: 'Stuck on a problem?', bn: 'কোনো সমস্যায় আটকে আছেন?' },
  'home.cta.desc': {
    en: 'Paste it into the solver and watch it get unpacked step by step — no sign-up, no API key.',
    bn: 'সমাধানকারীতে লিখুন আর ধাপে ধাপে সমাধান দেখুন — সাইন-আপ বা API কী ছাড়াই।',
  },
  'home.cta.btn': { en: 'Open the solver', bn: 'সমাধানকারী খুলুন' },

  'formulas.title': { en: 'Formula library', bn: 'সূত্র-লাইব্রেরি' },
  'formulas.desc': {
    en: 'Search across every topic, or pick a shelf. Tap any card to copy the formula.',
    bn: 'সব বিষয়ে খুঁজুন, বা একটি তাক বেছে নিন। সূত্র কপি করতে কার্ডে ট্যাপ করুন।',
  },
  'formulas.search': { en: 'Search formulas — name, expression or topic…', bn: 'সূত্র খুঁজুন — নাম, রাশি বা বিষয়…' },
  'formulas.empty': { en: 'No formula matches that. Try a simpler word.', bn: 'এই সূত্র পাওয়া যায়নি। সহজ শব্দ দিয়ে চেষ্টা করুন।' },
  'formulas.count': { en: 'formulas', bn: 'সূত্র' },

  'solver.title': { en: 'Step-by-step solver', bn: 'ধাপে ধাপে সমাধান' },
  'solver.desc': {
    en: 'Type any problem below. The solver works entirely in your browser — nothing is sent anywhere.',
    bn: 'নিচে যেকোনো সমস্যা লিখুন। সমাধানকারী সম্পূর্ণ আপনার ব্রাউজারেই কাজ করে — কোথাও কিছু পাঠানো হয় না।',
  },
  'solver.placeholder': {
    en: 'e.g.  2x² − 5x + 6 = 0   ·   d/dx(x³ sin x)   ·   ∫(3x² + 2x)dx   ·   lim x→0 sin x/x',
    bn: 'যেমন   2x² − 5x + 6 = 0   ·   d/dx(x³ sin x)   ·   ∫(3x² + 2x)dx   ·   lim x→0 sin x/x',
  },
  'solver.solve': { en: 'Solve', bn: 'সমাধান করুন' },
  'solver.solving': { en: 'Solving…', bn: 'সমাধান হচ্ছে…' },
  'solver.examples': { en: 'Try one', bn: 'একটি চেষ্টা করুন' },
  'solver.answer': { en: 'Answer', bn: 'উত্তর' },
  'solver.steps': { en: 'Working', bn: 'ধাপে ধাপে' },
  'solver.tip': { en: 'Remember', bn: 'মনে রাখুন' },
  'solver.history': { en: 'Recent', bn: 'সাম্প্রতিক' },
  'solver.historyEmpty': { en: 'Your solved problems will appear here.', bn: 'আপনার সমাধান করা সমস্যাগুলো এখানে দেখা যাবে।' },
  'solver.copyAnswer': { en: 'Copy answer', bn: 'উত্তর কপি' },
  'solver.keypad': { en: 'Quick keys', bn: 'দ্রুত কী' },
  'solver.failed.title': { en: "I couldn't solve that", bn: 'এটি সমাধান করতে পারিনি' },
  'solver.failed.desc': {
    en: 'The solver handles equations, derivatives, integrals, limits, statistics, series, mensuration, matrices and more. Check the formatting or try one of the examples.',
    bn: 'সমাধানকারী সমীকরণ, অন্তরকলন, সমাকলন, সীমা, পরিসংখ্যান, ধারা, পরিমিতি, ম্যাট্রিক্স ইত্যাদি পারে। লেখা ঠিক আছে কিনা দেখুন বা উদাহরণ থেকে চেষ্টা করুন।',
  },
  'solver.plot': { en: 'Graph', bn: 'লেখচিত্র' },
  'solver.empty': { en: 'Enter a problem to see the full working.', bn: 'সম্পূর্ণ সমাধান দেখতে একটি সমস্যা লিখুন।' },
  'solver.offline': { en: 'Runs offline', bn: 'অফলাইনে চলে' },
  'solver.localNote': {
    en: 'Everything runs in your browser — no account, no API key, and no data leaves this page.',
    bn: 'সবকিছু আপনার ব্রাউজারেই চলে — অ্যাকাউন্ট নেই, API কী নেই, কোনো তথ্য বাইরে যায় না।',
  },
  'solver.covers': { en: 'What it can solve', bn: 'কী কী সমাধান করতে পারে' },
  'solver.yourProblem': { en: 'Your problem', bn: 'আপনার সমস্যা' },

  'practice.title': { en: 'Practice', bn: 'অনুশীলন' },
  'practice.desc': {
    en: 'Endless questions, instant feedback. Pick a topic and build a streak.',
    bn: 'অসীম প্রশ্ন, সাথে সাথে উত্তর। একটি বিষয় বেছে নিয়ে ধারাবাহিকতা গড়ুন।',
  },
  'practice.topic': { en: 'Topic', bn: 'বিষয়' },
  'practice.difficulty': { en: 'Level', bn: 'স্তর' },
  'practice.start': { en: 'New question', bn: 'নতুন প্রশ্ন' },
  'practice.check': { en: 'Check answer', bn: 'উত্তর যাচাই' },
  'practice.next': { en: 'Next question', bn: 'পরের প্রশ্ন' },
  'practice.skip': { en: 'Skip', bn: 'এড়িয়ে যান' },
  'practice.correct': { en: 'Correct!', bn: 'সঠিক!' },
  'practice.wrong': { en: 'Not quite.', bn: 'ঠিক হয়নি।' },
  'practice.answerWas': { en: 'Answer', bn: 'উত্তর' },
  'practice.hint': { en: 'Hint', bn: 'ইঙ্গিত' },
  'practice.showHint': { en: 'Show hint', bn: 'ইঙ্গিত দেখুন' },
  'practice.score': { en: 'Score', bn: 'স্কোর' },
  'practice.streak': { en: 'Streak', bn: 'ধারা' },
  'practice.best': { en: 'Best', bn: 'সেরা' },
  'practice.reset': { en: 'Reset score', bn: 'স্কোর রিসেট' },
  'practice.placeholder': { en: 'Your answer', bn: 'আপনার উত্তর' },
  'practice.localNote': {
    en: 'Scores are saved on this device only. Answers accept fractions (3/4) and decimals.',
    bn: 'স্কোর শুধু এই ডিভাইসে সংরক্ষিত থাকে। উত্তর ভগ্নাংশ (৩/৪) বা দশমিকেও দেওয়া যায়।',
  },
  'practice.topic.arithmetic': { en: 'Arithmetic', bn: 'পাটিগণিত' },
  'practice.topic.algebra': { en: 'Algebra', bn: 'বীজগণিত' },
  'practice.topic.percentage': { en: 'Percentage', bn: 'শতকরা' },
  'practice.topic.geometry': { en: 'Mensuration', bn: 'পরিমিতি' },
  'practice.topic.trigonometry': { en: 'Trigonometry', bn: 'ত্রিকোণমিতি' },
  'practice.topic.statistics': { en: 'Statistics', bn: 'পরিসংখ্যান' },
  'practice.topic.mixed': { en: 'Mixed', bn: 'মিশ্র' },
  'practice.level.easy': { en: 'Easy', bn: 'সহজ' },
  'practice.level.medium': { en: 'Medium', bn: 'মাঝারি' },
  'practice.level.hard': { en: 'Hard', bn: 'কঠিন' },

  'secondary.title': { en: 'West Bengal Board · Class 9–10', bn: 'পশ্চিমবঙ্গ বোর্ড · শ্রেণী ৯–১০' },
  'secondary.desc': {
    en: 'Every chapter, its topics, and a route straight into practice or the solver.',
    bn: 'প্রতিটি অধ্যায়, তার বিষয়বস্তু, এবং সরাসরি অনুশীলন বা সমাধানের পথ।',
  },
  'secondary.class9': { en: 'Class 9', bn: 'শ্রেণী ৯' },
  'secondary.class10': { en: 'Class 10', bn: 'শ্রেণী ১০' },
  'secondary.chapters': { en: 'chapter', bn: 'অধ্যায়' },
  'secondary.topics': { en: 'Topics', bn: 'বিষয়' },
  'secondary.videos': { en: 'videos', bn: 'ভিডিও' },
  'secondary.problems': { en: 'problems', bn: 'সমস্যা' },
  'secondary.open': { en: 'Open chapter', bn: 'অধ্যায় খুলুন' },
  'secondary.practiceThis': { en: 'Practise this chapter', bn: 'এই অধ্যায়ের অনুশীলন' },
  'secondary.solveThis': { en: 'Solve a problem', bn: 'সমস্যা সমাধান' },
  'secondary.sample': { en: 'Sample question', bn: 'নমুনা প্রশ্ন' },
  'secondary.added': { en: 'More classes are on the way.', bn: 'আরও শ্রেণী আসছে।' },

  'footer.tagline': {
    en: 'A free, offline-first mathematics companion for school students in West Bengal and beyond.',
    bn: 'পশ্চিমবঙ্গ ও তার বাইরের স্কুল শিক্ষার্থীদের জন্য একটি ফ্রি, অফলাইন-বান্ধব গণিত সঙ্গী।',
  },
  'footer.explore': { en: 'Explore', bn: 'ঘুরে দেখুন' },
  'footer.about': { en: 'About', bn: 'পরিচিতি' },
  'footer.aboutText': {
    en: 'Built with React, TypeScript and Tailwind. No tracking, no accounts, no server — your data stays in your browser.',
    bn: 'React, TypeScript ও Tailwind দিয়ে তৈরি। কোনো ট্র্যাকিং নেই, অ্যাকাউন্ট নেই, সার্ভার নেই — আপনার তথ্য ব্রাউজারেই থাকে।',
  },
  'footer.rights': { en: 'All rights reserved.', bn: 'সর্বস্বত্ব সংরক্ষিত।' },
  'footer.madeIn': { en: 'Made for students of West Bengal', bn: 'পশ্চিমবঙ্গের শিক্ষার্থীদের জন্য' },
  'footer.legacy': { en: 'Classic version', bn: 'পুরোনো সংস্করণ' },

  'search.title': { en: 'Search everything', bn: 'সবকিছু খুঁজুন' },
  'search.empty': {
    en: 'Try “quadratic”, “sin”, “circle”, “chapter 3” or a formula name.',
    bn: '“দ্বিঘাত”, “sin”, “বৃত্ত”, “অধ্যায় ৩” বা সূত্রের নাম দিয়ে চেষ্টা করুন।',
  },
  'search.group.formulas': { en: 'Formulas', bn: 'সূত্র' },
  'search.group.chapters': { en: 'Chapters', bn: 'অধ্যায়' },
  'search.group.pages': { en: 'Pages', bn: 'পৃষ্ঠা' },
  'search.group.categories': { en: 'Levels', bn: 'স্তর' },
  'search.hint': { en: 'Enter to open · Esc to close', bn: 'খুলতে Enter · বন্ধ করতে Esc' },
} as const satisfies Record<string, Bi>;

export type DictKey = keyof typeof dict;

export function translate(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}

