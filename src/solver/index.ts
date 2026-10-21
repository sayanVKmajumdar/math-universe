import type { Bi } from '@/lib/types';
import { collectVars, evaluateNode, normalizeInput, toPoly, tryParse } from './ast';
import { nice } from './rational';
import { failed, solved, type SolveResult } from './result';
import {
  equationDifference,
  solveEvaluate,
  solveLinear,
  solvePolynomial,
  solveQuadratic,
  solveSequence,
  solveSimplify,
  solveStatistics,
  solveSystem,
  stripLead,
  toLinear,
  T,
} from './handlers';
import {
  solveCombinatorics,
  solveDerivative,
  solveDivisionByZero,
  solveIntegral,
  solveLimit,
  solveMatrix,
  solveMensuration,
  solveNumberTheory,
  solvePercent,
  solveTrigonometry,
} from './handlers2';

export type { SolveResult } from './result';

/* -------------------------------------------------------------------------- */
/*  Single-variable and simple two-variable equations                          */
/* -------------------------------------------------------------------------- */

function solveEquation(text: string, original: string): SolveResult | null {
  const cleaned = stripLead(text.replace(/^[;\s]+/, ''));
  const equation = equationDifference(cleaned);
  if (!equation) return null;

  const vars = [...collectVars(equation.diff)];
  if (vars.length === 0) {
    const value = evaluateNode(equation.diff);
    if (value === null) return null;
    const truth = Math.abs(value) < 1e-9;
    return solved({
      kind: 'identity',
      topic: T('Equation', 'সমীকরণ'),
      input: original,
      answer: truth ? 'The statement is true.' : 'The statement is false.',
      steps: [
        {
          title: T('Evaluate both sides', 'উভয় পক্ষের মান নির্ণয় করো'),
          expr: `${nice(-value)} ${truth ? '=' : '≠'} 0`,
        },
      ],
    });
  }

  if (vars.length === 2) {
    const map = toLinear(equation.diff);
    if (!map) return null;
    const [first, second] = vars;
    const coefficient = map[second] ?? 0;
    if (Math.abs(coefficient) < 1e-12) return null;
    const slope = -(map[first] ?? 0) / coefficient;
    const intercept = -(map[''] ?? 0) / coefficient;
    const sign = slope < 0 ? '−' : '+';
    const magnitude = Math.abs(slope);
    const coefficientText =
      Math.abs(magnitude - 1) < 1e-12 ? '' : Number.isInteger(magnitude) ? nice(magnitude) : `(${nice(magnitude)})`;
    return solved({
      kind: 'linear-relation',
      topic: T('Linear relation', 'রৈখিক সম্পর্ক'),
      input: original,
      answer: `${second} = ${nice(intercept)} ${sign} ${coefficientText}${first}`,
      answerNote: T(
        'One equation with two unknowns has infinitely many solutions — this describes them all.',
        'দুটি অজানা নিয়ে একটি সমীকরণের অসংখ্য সমাধান থাকে — এটি সবগুলোকে বর্ণনা করে।',
      ),
      steps: [
        {
          title: T(`Make ${second} the subject`, `${second}-কে একা করো`),
          expr: `${nice(coefficient)}${second} = ${nice(-(map[''] ?? 0))} − ${nice(map[first] ?? 0)}${first}`,
          detail: T('Move every other term to the other side.', 'বাকি সব পদ অন্যপাশে নাও।'),
        },
        {
          title: T('Divide by the coefficient', 'সহগ দিয়ে ভাগ করো'),
          expr: `${second} = ${nice(intercept)} ${sign} ${coefficientText}${first}`,
        },
      ],
      tip: T('For each value of x you pick, this gives the matching y.', 'x-এর প্রতিটি মানের জন্য এখান থেকে y পাওয়া যায়।'),
    });
  }

  if (vars.length > 2) return null;

  const variable = vars[0];
  const poly = toPoly(equation.diff, variable);
  if (poly && poly.length === 1) {
    const consistent = Math.abs(poly[0]) < 1e-9;
    return solved({
      kind: 'identity',
      topic: T('Equation', 'সমীকরণ'),
      input: original,
      answer: consistent ? 'Infinitely many solutions' : 'No solution',
      answerNote: consistent
        ? T('Every value of the variable works — the two sides are identical.', 'চলকের প্রতিটি মানই কাজ করে — দুই পক্ষ একই।')
        : T('The variable cancels and leaves a false statement.', 'চলক বাদ পড়ে একটি অসত্য বিবৃতি থাকে।'),
      steps: [
        {
          title: T('Simplify both sides', 'উভয় পক্ষ সরল করো'),
          expr: `${nice(poly[0])} ${consistent ? '=' : '≠'} 0`,
          detail: T('The variable terms cancel completely.', 'চলকযুক্ত পদগুলো সম্পূর্ণ বাদ পড়ে।'),
        },
      ],
    });
  }

  return (
    solveLinear(equation.diff, variable, original) ??
    solveQuadratic(equation.diff, variable, original) ??
    solvePolynomial(equation.diff, variable, original)
  );
}

/* -------------------------------------------------------------------------- */
/*  Public entry point                                                         */
/* -------------------------------------------------------------------------- */

const NO_MATCH: Bi = {
  en: "I couldn't work that one out",
  bn: 'এটি সমাধান করতে পারলাম না',
};

const NO_MATCH_HINT: Bi = {
  en: 'The solver handles equations, derivatives, integrals, limits, sine/cosine, statistics, AP/GP series, mensuration, factors, factorials, matrices and arithmetic. Try a form like “2x + 3 = 11”.',
  bn: 'সমাধানকারী সমীকরণ, অন্তরকলজ, সমাকলন, সীমা, sin/cos, পরিসংখ্যান, সমান্তর/গুণোত্তর ধারা, পরিমিতি, উৎপাদক, ফ্যাক্টরিয়াল, ম্যাট্রিক্স ও পাটিগণিত পারে। “2x + 3 = 11” এভাবে চেষ্টা করুন।',
};

export function solve(raw: string): SolveResult {
  const original = raw.trim();
  if (!original) {
    return failed(
      { en: 'Type a problem first.', bn: 'প্রথমে একটি সমস্যা লিখুন।' },
      { en: 'For example: x² − 5x + 6 = 0', bn: 'যেমন: x² − 5x + 6 = 0' },
    );
  }

  const text = normalizeInput(original)
    .replace(/\s+/g, ' ')
    .replace(/[?]+$/g, '')
    .replace(/[.]+$/g, '')
    .trim();

  const attempts: (() => SolveResult | null)[] = [
    () => solveLimit(text, original),
    () => solveDerivative(text, original),
    () => solveIntegral(text, original),
    () => solveSystem(text, original),
    () => solveEquation(text, original),
    () => solveTrigonometry(text, original),
    () => solveStatistics(text, original),
    () => solveSequence(text, original),
    () => solvePercent(text, original),
    () => solveDivisionByZero(text, original),
    () => solveNumberTheory(text, original),
    () => solveCombinatorics(text, original),
    () => solveMatrix(text, original),
    () => solveMensuration(text, original),
    () => solveSimplify(stripLead(text), original),
    () => solveEvaluate(stripLead(text), original),
  ];

  for (const attempt of attempts) {
    let result: SolveResult | null = null;
    try {
      result = attempt();
    } catch {
      result = null;
    }
    if (result) return result;
  }

  return failed(NO_MATCH, NO_MATCH_HINT);
}

/** Small helper used by the practice module to compare typed answers. */
export function answersMatch(expected: string, given: string): boolean {
  const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '').replace(/−/g, '-');
  const a = clean(expected);
  const b = clean(given);
  if (!b) return false;
  if (a === b) return true;

  const numeric = (value: string): number | null => {
    const fraction = value.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (fraction) return Number(fraction[1]) / Number(fraction[2]);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const expectedValue = numeric(a);
  const givenValue = numeric(b);
  if (expectedValue !== null && givenValue !== null) {
    // Tolerate rounded decimals (0.71 for √2/2, 153.9 for 49π) but not wrong answers.
    return Math.abs(expectedValue - givenValue) <= 0.005 + Math.abs(expectedValue) * 1e-6;
  }

  // Accept an exact fraction against its decimal form.
  const nodeGiven = tryParse(b);
  const nodeExpected = tryParse(a);
  if (nodeGiven && nodeExpected) {
    const givenEval = evaluateNode(nodeGiven);
    const expectedEval = evaluateNode(nodeExpected);
    if (givenEval !== null && expectedEval !== null) {
      return Math.abs(givenEval - expectedEval) <= 0.005 + Math.abs(expectedEval) * 1e-6;
    }
  }

  return false;
}

