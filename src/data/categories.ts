import type { Category } from '@/lib/types';
import { href } from '@/lib/router';

export const categories: Category[] = [
  {
    id: 'primary',
    title: { en: 'Primary School', bn: 'প্রাথমিক বিদ্যালয়' },
    level: { en: 'Class 1 – 5', bn: 'শ্রেণী ১ – ৫' },
    desc: {
      en: 'Numbers, shapes, measurement and mental maths — the foundations everything else stands on.',
      bn: 'সংখ্যা, আকৃতি, পরিমাপ ও মানসিক গণিত — বাকি সবকিছুর ভিত্তি।',
    },
    accent: 'emerald',
    emoji: '🧮',
    topics: [
      { en: 'Number sense', bn: 'সংখ্যাবোধ' },
      { en: 'Shapes', bn: 'আকৃতি' },
      { en: 'Measurement', bn: 'পরিমাপ' },
      { en: 'Money & time', bn: 'টাকা ও সময়' },
    ],
    to: href('practice'),
  },
  {
    id: 'middle',
    title: { en: 'Middle School', bn: 'মাধ্যমিক বিদ্যালয়' },
    level: { en: 'Class 6 – 8', bn: 'শ্রেণী ৬ – ৮' },
    desc: {
      en: 'Algebra wakes up, geometry gets proofs, and percentages start appearing everywhere.',
      bn: 'বীজগণিত শুরু, জ্যামিতিতে প্রমাণ, আর সর্বত্র শতকরা হিসাব।',
    },
    accent: 'teal',
    emoji: '📐',
    topics: [
      { en: 'Algebra', bn: 'বীজগণিত' },
      { en: 'Geometry', bn: 'জ্যামিতি' },
      { en: 'Mensuration', bn: 'পরিমিতি' },
      { en: 'Statistics', bn: 'পরিসংখ্যান' },
    ],
    to: href('formulas', 'algebra'),
  },
  {
    id: 'secondary',
    title: { en: 'Secondary School', bn: 'মাধ্যমিক' },
    level: { en: 'Class 9 – 10 · WBBSE', bn: 'শ্রেণী ৯ – ১০ · ডব্লিউবিবিএসই' },
    desc: {
      en: 'West Bengal Board chapters — real numbers, theorems, trigonometry and coordinate geometry.',
      bn: 'পশ্চিমবঙ্গ বোর্ডের অধ্যায় — বাস্তব সংখ্যা, উপপাদ্য, ত্রিকোণমিতি ও স্থানাঙ্ক জ্যামিতি।',
    },
    accent: 'indigo',
    emoji: '📚',
    topics: [
      { en: 'Real numbers', bn: 'বাস্তব সংখ্যা' },
      { en: 'Theorems', bn: 'উপপাদ্য' },
      { en: 'Trigonometry', bn: 'ত্রিকোণমিতি' },
      { en: 'Coordinate geometry', bn: 'স্থানাঙ্ক জ্যামিতি' },
    ],
    to: href('secondary', 9),
  },
  {
    id: 'higher',
    title: { en: 'Higher Secondary', bn: 'উচ্চ মাধ্যমিক' },
    level: { en: 'Class 11 – 12', bn: 'শ্রেণী ১১ – ১২' },
    desc: {
      en: 'Calculus, vectors, probability and matrices — the toolkit for every entrance exam.',
      bn: 'ক্যালকুলাস, ভেক্টর, সম্ভাবনা ও ম্যাট্রিক্স — সব প্রবেশিকা পরীক্ষার হাতিয়ার।',
    },
    accent: 'gold',
    emoji: '🔢',
    topics: [
      { en: 'Calculus', bn: 'ক্যালকুলাস' },
      { en: 'Vectors', bn: 'ভেক্টর' },
      { en: 'Probability', bn: 'সম্ভাবনা' },
      { en: 'Matrices', bn: 'ম্যাট্রিক্স' },
    ],
    to: href('formulas', 'calculus'),
  },
  {
    id: 'undergrad',
    title: { en: 'Undergraduate', bn: 'স্নাতক' },
    level: { en: 'B.Sc. Mathematics', bn: 'বিএসসি গণিত' },
    desc: {
      en: 'Real analysis, abstract algebra, linear algebra and differential equations — done properly.',
      bn: 'রিয়েল অ্যানালিসিস, অ্যাবস্ট্রাক্ট অ্যালজেব্রা, লিনিয়ার অ্যালজেব্রা ও ডিফারেনশিয়াল সমীকরণ।',
    },
    accent: 'rose',
    emoji: '🎓',
    topics: [
      { en: 'Analysis', bn: 'বিশ্লেষণ' },
      { en: 'Linear algebra', bn: 'লিনিয়ার অ্যালজেব্রা' },
      { en: 'Abstract algebra', bn: 'অ্যাবস্ট্রাক্ট অ্যালজেব্রা' },
      { en: 'Differential equations', bn: 'ডিফারেনশিয়াল সমীকরণ' },
    ],
    to: href('formulas', 'matrices'),
  },
  {
    id: 'research',
    title: { en: 'Research & PhD', bn: 'গবেষণা ও পিএইচডি' },
    level: { en: 'Advanced topics', bn: 'উন্নত বিষয়' },
    desc: {
      en: 'Number theory, topology and analysis — references for graduate study and research.',
      bn: 'সংখ্যাতত্ত্ব, টপোলজি ও বিশ্লেষণ — স্নাতকোত্তর ও গবেষণার তথ্যসূত্র।',
    },
    accent: 'slate',
    emoji: '🔬',
    topics: [
      { en: 'Number theory', bn: 'সংখ্যাতত্ত্ব' },
      { en: 'Topology', bn: 'টপোলজি' },
      { en: 'Real analysis', bn: 'রিয়েল অ্যানালিসিস' },
      { en: 'Combinatorics', bn: 'কম্বিনেটরিক্স' },
    ],
    to: href('formulas', 'number-theory'),
  },
];
