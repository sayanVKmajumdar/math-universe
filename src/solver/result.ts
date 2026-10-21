import type { Bi, Solution } from '@/lib/types';

export type SolveResult =
  | { ok: true; solution: Solution }
  | { ok: false; error: Bi; hint?: Bi };

export function solved(solution: Solution): SolveResult {
  return { ok: true, solution };
}

export function failed(error: Bi, hint?: Bi): SolveResult {
  return { ok: false, error, hint };
}

export const bi = (en: string, bn: string): Bi => ({ en, bn });
