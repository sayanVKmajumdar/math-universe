import { allChapters } from '@/data/chapters';
import { allFormulas } from '@/data/formulas';
import { categories } from '@/data/categories';
import { href } from './router';
import type { Lang } from './types';

export type SearchType = 'formula' | 'chapter' | 'page' | 'level';

export interface SearchHit {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  to: string;
}

const PAGES: { id: string; en: string; bn: string; to: string }[] = [
  { id: 'home', en: 'Home', bn: 'হোম', to: href('home') },
  { id: 'formulas', en: 'Formula library', bn: 'সূত্র-লাইব্রেরি', to: href('formulas') },
  { id: 'solver', en: 'Step-by-step solver', bn: 'ধাপে ধাপে সমাধান', to: href('solver') },
  { id: 'practice', en: 'Practice questions', bn: 'অনুশীলন প্রশ্ন', to: href('practice') },
  { id: 'secondary', en: 'Class 9–10 chapters', bn: 'শ্রেণী ৯–১০ অধ্যায়', to: href('secondary', 9) },
];

export function buildIndex(lang: Lang): SearchHit[] {
  const hits: SearchHit[] = [];

  for (const page of PAGES) {
    hits.push({ id: `page-${page.id}`, type: 'page', title: lang === 'bn' ? page.bn : page.en, to: page.to });
  }

  for (const category of categories) {
    hits.push({
      id: `level-${category.id}`,
      type: 'level',
      title: lang === 'bn' ? category.title.bn : category.title.en,
      subtitle: lang === 'bn' ? category.level.bn : category.level.en,
      to: category.to,
    });
  }

  for (const formula of allFormulas) {
    hits.push({
      id: `formula-${formula.category}-${formula.id}`,
      type: 'formula',
      title: lang === 'bn' ? formula.name.bn : formula.name.en,
      subtitle: formula.expr,
      to: href('formulas', formula.category),
    });
  }

  for (const chapter of allChapters) {
    hits.push({
      id: `chapter-${chapter.classLevel}-${chapter.num}`,
      type: 'chapter',
      title: `Class ${chapter.classLevel} · ${lang === 'bn' ? chapter.title.bn : chapter.title.en}`,
      subtitle: chapter.topics.map((topic) => (lang === 'bn' ? topic.name.bn : topic.name.en)).join(' · '),
      to: href('secondary', chapter.classLevel, chapter.num),
    });
  }

  return hits;
}

export function searchIndex(index: SearchHit[], query: string): SearchHit[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const scored = index
    .map((hit) => {
      const title = hit.title.toLowerCase();
      const subtitle = (hit.subtitle ?? '').toLowerCase();
      let score = 0;
      if (title === term) score = 12;
      else if (title.startsWith(term)) score = 9;
      else if (title.includes(term)) score = 7;
      else if (subtitle.includes(term)) score = 4;
      else {
        const words = term.split(/\s+/).filter(Boolean);
        const haystack = `${title} ${subtitle}`;
        const matched = words.filter((word) => haystack.includes(word)).length;
        if (matched === words.length) score = 2 + matched;
      }
      return { hit, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 22).map((entry) => entry.hit);
}

export const quickSearches: { en: string; bn: string; query: string }[] = [
  { en: 'Quadratic formula', bn: 'দ্বিঘাত সূত্র', query: 'quadratic' },
  { en: 'Derivative rules', bn: 'অন্তরকলনের নিয়ম', query: 'derivative' },
  { en: 'Trigonometric identities', bn: 'ত্রিকোণমিতিক অভেদ', query: 'identity' },
  { en: 'Circle formulas', bn: 'বৃত্তের সূত্র', query: 'circle' },
  { en: 'Probability', bn: 'সম্ভাবনা', query: 'probability' },
];
