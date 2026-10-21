export type Lang = 'en' | 'bn';

/** A piece of content available in both site languages. */
export interface Bi {
  en: string;
  bn: string;
}

export const bi = (en: string, bn: string): Bi => ({ en, bn });
export const pick = (value: Bi, lang: Lang): string => (lang === 'bn' ? value.bn : value.en);

export type Accent = 'teal' | 'indigo' | 'gold' | 'rose' | 'emerald' | 'slate';

export interface Category {
  id: string;
  title: Bi;
  level: Bi;
  desc: Bi;
  accent: Accent;
  emoji: string;
  topics: Bi[];
  to: string;
}

export interface Formula {
  id: string;
  name: Bi;
  expr: string;
  desc?: Bi;
}

export interface FormulaCategory {
  id: string;
  name: Bi;
  icon: string;
  accent: Accent;
  formulas: Formula[];
}

export type PracticeTopic =
  | 'arithmetic'
  | 'algebra'
  | 'percentage'
  | 'geometry'
  | 'trigonometry'
  | 'statistics';

export interface ChapterTopic {
  name: Bi;
}

export interface Chapter {
  num: number;
  title: Bi;
  summary: Bi;
  topics: ChapterTopic[];
  videos: number;
  problems: number;
  classLevel: 9 | 10;
  /** Pre-filled problem used by the "solve a problem" shortcut. */
  sample: string;
  /** Practice generator that best matches this chapter. */
  practice: PracticeTopic;
}

/* ---------------------------------- solver --------------------------------- */

export interface Step {
  title: Bi;
  detail?: Bi;
  expr?: string;
}

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
}

export interface PlotData {
  fn?: (x: number) => number;
  fn2?: (x: number) => number;
  label?: Bi;
  label2?: Bi;
  points?: PlotPoint[];
  xMin: number;
  xMax: number;
}

export interface Solution {
  kind: string;
  topic: Bi;
  input: string;
  answer: string;
  answerNote?: Bi;
  steps: Step[];
  tip?: Bi;
  plot?: PlotData;
}

/* --------------------------------- practice -------------------------------- */

export interface Question {
  id: string;
  topic: Bi;
  prompt: string;
  answer: string;
  hint: Bi;
  explanation: Bi;
  difficulty: 1 | 2 | 3;
}
