import type { Chapter } from '@/lib/types';

const t = (en: string, bn: string) => ({ en, bn });

export const class9Chapters: Chapter[] = [
  {
    num: 1,
    classLevel: 9,
    title: t('Real Numbers', 'বাস্তব সংখ্যা'),
    summary: t(
      'Rational and irrational numbers, decimal expansions, and the number line.',
      'মূলদ ও অমূলদ সংখ্যা, দশমিক বিস্তার এবং সংখ্যারেখা।',
    ),
    topics: [
      { name: t('Rational numbers', 'মূলদ সংখ্যা') },
      { name: t('Irrational numbers', 'অমূলদ সংখ্যা') },
      { name: t('Number line', 'সংখ্যারেখা') },
      { name: t('Laws of exponents', 'সূচকের নিয়ম') },
    ],
    videos: 8,
    problems: 45,
    sample: '√2 is irrational - explain',
    practice: 'arithmetic',
  },
  {
    num: 2,
    classLevel: 9,
    title: t('Laws of Indices', 'সূচকের নিয়ম'),
    summary: t(
      'Exponent laws, surds, and simplifying expressions with powers.',
      'সূচকের সূত্র, করণী এবং ঘাতযুক্ত রাশি সরলীকরণ।',
    ),
    topics: [
      { name: t('Product and quotient rules', 'গুণ ও ভাগের নিয়ম') },
      { name: t('Zero and negative powers', 'শূন্য ও ঋণাত্মক ঘাত') },
      { name: t('Surds', 'করণী') },
    ],
    videos: 9,
    problems: 52,
    sample: '2^3 × 2^4',
    practice: 'arithmetic',
  },
  {
    num: 3,
    classLevel: 9,
    title: t('Polynomials & Factorisation', 'বহুপদী ও উৎপাদকে বিশ্লেষণ'),
    summary: t(
      'Degrees, the remainder and factor theorems, and splitting the middle term.',
      'মাত্রা, ভাগশেষ ও উৎপাদক উপপাদ্য, এবং মধ্য পদ বিভাজন।',
    ),
    topics: [
      { name: t('Degree of a polynomial', 'বহুপদীর মাত্রা') },
      { name: t('Remainder theorem', 'ভাগশেষ উপপাদ্য') },
      { name: t('Factor theorem', 'উৎপাদক উপপাদ্য') },
      { name: t('Middle-term splitting', 'মধ্য পদ বিভাজন') },
    ],
    videos: 12,
    problems: 60,
    sample: 'x² - 5x + 6 = 0',
    practice: 'algebra',
  },
  {
    num: 4,
    classLevel: 9,
    title: t('Linear Equations & Graphs', 'সরল সমীকরণ ও লেখচিত্র'),
    summary: t(
      'Simultaneous equations by substitution, elimination and graphs.',
      'প্রতিস্থাপন, অপসারণ ও লেখচিত্রের মাধ্যমে একঘাত সমীকরণজোট।',
    ),
    topics: [
      { name: t('Substitution method', 'প্রতিস্থাপন পদ্ধতি') },
      { name: t('Elimination method', 'অপসারণ পদ্ধতি') },
      { name: t('Graphical method', 'লেখচিত্র পদ্ধতি') },
    ],
    videos: 10,
    problems: 50,
    sample: '2x + 3y = 12, x - y = 1',
    practice: 'algebra',
  },
  {
    num: 5,
    classLevel: 9,
    title: t('Triangles & Theorems', 'ত্রিভুজ ও উপপাদ্য'),
    summary: t(
      'Congruence, similarity, the Pythagorean theorem and circle properties.',
      'সর্বসমতা, সদৃশতা, পিথাগোরাসের উপপাদ্য ও বৃত্তের ধর্ম।',
    ),
    topics: [
      { name: t('Congruence', 'সর্বসমতা') },
      { name: t('Similarity', 'সদৃশতা') },
      { name: t('Pythagoras', 'পিথাগোরাস') },
      { name: t('Circle theorems', 'বৃত্তের উপপাদ্য') },
    ],
    videos: 15,
    problems: 75,
    sample: 'area of circle r=7',
    practice: 'geometry',
  },
  {
    num: 6,
    classLevel: 9,
    title: t('Trigonometric Ratios', 'ত্রিকোণমিতিক অনুপাত'),
    summary: t(
      'sin, cos, tan for standard angles and the fundamental identities.',
      'প্রমিত কোণের জন্য sin, cos, tan এবং মৌলিক অভেদসমূহ।',
    ),
    topics: [
      { name: t('Ratios of standard angles', 'প্রমিত কোণের অনুপাত') },
      { name: t('Trigonometric identities', 'ত্রিকোণমিতিক অভেদ') },
      { name: t('Heights and distances', 'উচ্চতা ও দূরত্ব') },
    ],
    videos: 14,
    problems: 80,
    sample: 'sin 30°',
    practice: 'trigonometry',
  },
  {
    num: 7,
    classLevel: 9,
    title: t('Mensuration', 'পরিমিতি'),
    summary: t(
      'Areas of plane figures, and surface area and volume of solids.',
      'সমতল আকৃতির ক্ষেত্রফল এবং ঘনবস্তুর পৃষ্ঠতল ও আয়তন।',
    ),
    topics: [
      { name: t('Area of a circle', 'বৃত্তের ক্ষেত্রফল') },
      { name: t('Volume of a cylinder', 'বেলনের আয়তন') },
      { name: t('Surface area of a sphere', 'গোলকের পৃষ্ঠতল') },
    ],
    videos: 13,
    problems: 70,
    sample: 'volume of sphere r=3',
    practice: 'geometry',
  },
  {
    num: 8,
    classLevel: 9,
    title: t('Statistics', 'পরিসংখ্যান'),
    summary: t(
      'Mean, median and mode of raw data, and reading bar graphs.',
      'অপরিশোধিত তথ্যের গড়, মধ্যমান ও বহুলক, এবং স্তম্ভলেখ পড়া।',
    ),
    topics: [
      { name: t('Mean', 'গড়') },
      { name: t('Median', 'মধ্যমান') },
      { name: t('Mode', 'বহুলক') },
    ],
    videos: 8,
    problems: 40,
    sample: 'mean of 4, 8, 6, 10',
    practice: 'statistics',
  },
];

export const class10Chapters: Chapter[] = [
  {
    num: 1,
    classLevel: 10,
    title: t('Quadratic Equations', 'দ্বিঘাত সমীকরণ'),
    summary: t(
      'Roots by factorisation, the quadratic formula, and the nature of roots.',
      'উৎপাদকে বিশ্লেষণ, দ্বিঘাত সূত্র এবং বীজের প্রকৃতি।',
    ),
    topics: [
      { name: t('Factorisation', 'উৎপাদকে বিশ্লেষণ') },
      { name: t('Quadratic formula', 'দ্বিঘাত সূত্র') },
      { name: t('Nature of roots', 'বীজের প্রকৃতি') },
      { name: t('Sum and product of roots', 'বীজের সমষ্টি ও গুণফল') },
    ],
    videos: 16,
    problems: 90,
    sample: '2x² - 5x + 3 = 0',
    practice: 'algebra',
  },
  {
    num: 2,
    classLevel: 10,
    title: t('Ratio & Proportion', 'অনুপাত ও সমানুপাত'),
    summary: t(
      'Dividing quantities in a ratio, continued proportion, and variation.',
      'অনুপাতে রাশি বিভাজন, ধারাবাহিক সমানুপাত এবং চলন।',
    ),
    topics: [
      { name: t('Simple ratio problems', 'সরল অনুপাত সমস্যা') },
      { name: t('Continued proportion', 'ধারাবাহিক সমানুপাত') },
      { name: t('Direct and inverse variation', 'সরল ও ব্যস্ত চলন') },
    ],
    videos: 9,
    problems: 48,
    sample: '15% of 240',
    practice: 'percentage',
  },
  {
    num: 3,
    classLevel: 10,
    title: t('Arithmetic Progressions', 'সমান্তর প্রগতি'),
    summary: t(
      'The n-th term, sum of n terms, and real-life sequence problems.',
      'n-তম পদ, n পদের সমষ্টি এবং বাস্তব জীবনের ধারা সমস্যা।',
    ),
    topics: [
      { name: t('n-th term', 'n-তম পদ') },
      { name: t('Sum of n terms', 'n পদের সমষ্টি') },
      { name: t('Applications', 'প্রয়োগ') },
    ],
    videos: 10,
    problems: 55,
    sample: 'AP: 3, 7, 11, 10th term',
    practice: 'algebra',
  },
  {
    num: 4,
    classLevel: 10,
    title: t('Similarity & Pythagoras', 'সদৃশতা ও পিথাগোরাস'),
    summary: t(
      'Similar triangles, the intercept theorem, and Pythagoras with proofs.',
      'সদৃশ ত্রিভুজ, ছেদক উপপাদ্য এবং প্রমাণসহ পিথাগোরাস।',
    ),
    topics: [
      { name: t('Tests for similarity', 'সদৃশতার পরীক্ষা') },
      { name: t('Intercept theorem', 'ছেদক উপপাদ্য') },
      { name: t('Pythagoras theorems', 'পিথাগোরাসের উপপাদ্য') },
    ],
    videos: 12,
    problems: 62,
    sample: 'area of triangle base=6 height=9',
    practice: 'geometry',
  },
  {
    num: 5,
    classLevel: 10,
    title: t('Circles & Tangents', 'বৃত্ত ও স্পর্শক'),
    summary: t(
      'Tangents, chords, cyclic quadrilaterals and angle in a semicircle.',
      'স্পর্শক, জ্যা, বৃত্তস্থ চতুর্ভুজ এবং অর্ধবৃত্তে কোণ।',
    ),
    topics: [
      { name: t('Tangent properties', 'স্পর্শকের ধর্ম') },
      { name: t('Chord properties', 'জ্যার ধর্ম') },
      { name: t('Cyclic quadrilaterals', 'বৃত্তস্থ চতুর্ভুজ') },
    ],
    videos: 12,
    problems: 65,
    sample: 'circumference of circle r=7',
    practice: 'geometry',
  },
  {
    num: 6,
    classLevel: 10,
    title: t('Coordinate Geometry', 'স্থানাঙ্ক জ্যামিতি'),
    summary: t(
      'Distance, midpoint, section formula and straight-line equations.',
      'দূরত্ব, মধ্যবিন্দু, অন্তর্বিভাগ সূত্র ও সরলরেখার সমীকরণ।',
    ),
    topics: [
      { name: t('Distance formula', 'দূরত্ব সূত্র') },
      { name: t('Section formula', 'অন্তর্বিভাগ সূত্র') },
      { name: t('Slope and equations', 'ঢাল ও সমীকরণ') },
    ],
    videos: 11,
    problems: 60,
    sample: 'distance between (1,2) and (4,6)',
    practice: 'geometry',
  },
  {
    num: 7,
    classLevel: 10,
    title: t('Mensuration', 'পরিমিতি'),
    summary: t(
      'Surface areas and volumes of cylinders, cones, spheres and frustums.',
      'বেলন, শঙ্কু, গোলক ও ছেদিত শঙ্কুর পৃষ্ঠতল ও আয়তন।',
    ),
    topics: [
      { name: t('Surface areas', 'পৃষ্ঠতলের ক্ষেত্রফল') },
      { name: t('Volumes', 'আয়তন') },
      { name: t('Frustum', 'ছেদিত শঙ্কু') },
    ],
    videos: 14,
    problems: 70,
    sample: 'volume of cylinder r=7 h=10',
    practice: 'geometry',
  },
  {
    num: 8,
    classLevel: 10,
    title: t('Probability', 'সম্ভাবনা'),
    summary: t(
      'Classical probability, complementary events and simple experiments.',
      'ধ্রুপদী সম্ভাবনা, সম্পূরক ঘটনা এবং সরল পরীক্ষা।',
    ),
    topics: [
      { name: t('Classical probability', 'ধ্রুপদী সম্ভাবনা') },
      { name: t('Complementary events', 'সম্পূরক ঘটনা') },
      { name: t('Applications', 'প্রয়োগ') },
    ],
    videos: 9,
    problems: 45,
    sample: 'mean of 3, 5, 7, 9, 11',
    practice: 'statistics',
  },
];

export const allChapters = [...class9Chapters, ...class10Chapters];

export function chaptersFor(level: 9 | 10): Chapter[] {
  return level === 9 ? class9Chapters : class10Chapters;
}

export const chapterCount = allChapters.length;

export function chapterById(level: 9 | 10, num: number): Chapter | undefined {
  return chaptersFor(level).find((chapter) => chapter.num === num);
}
