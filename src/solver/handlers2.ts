import type { Bi, Step } from '@/lib/types';
import {
  collectVars,
  differentiate,
  divNode,
  evalAt,
  evaluateNode,
  integrate,
  polyEval,
  polyToString,
  simplify,
  stringify,
  syntheticDivide,
  toPoly,
  tryParse,
  type Node,
} from './ast';
import { nice, num, rat, sup } from './rational';
import { bi, failed, solved, type SolveResult } from './result';

const T = bi;

/* ========================================================================== */
/*  Limits                                                                     */
/* ========================================================================== */

function parseLimitPoint(text: string): number | null {
  const clean = text.trim().replace(/[+]/g, '');
  if (/^(∞|inf|infinity)$/i.test(clean)) return Infinity;
  if (/^-(∞|inf|infinity)$/i.test(clean)) return -Infinity;
  const node = tryParse(clean);
  if (!node) return null;
  return evaluateNode(node);
}

export function solveLimit(text: string, original: string): SolveResult | null {
  const match = text.match(/^lim(?:it)?\s*([a-z])\s*(?:→|->|approaches)\s*([^\s,]+)\s*[,:]?\s*([\s\S]+)$/i);
  if (!match) return null;

  const variable = match[1];
  const point = parseLimitPoint(match[2]);
  const rawExpr = match[3].trim().replace(/^\[|\]$/g, '');
  const expression = tryParse(rawExpr);
  if (point === null || !expression) return null;

  const at = (node: Node, where: number) => {
    if (!Number.isFinite(where)) {
      const big = where > 0 ? 1e7 : -1e7;
      return evaluateNode(node, { [variable]: big });
    }
    return evalAt(node, variable, where);
  };

  const pointLabel = Number.isFinite(point) ? nice(point) : point > 0 ? '∞' : '−∞';
  const steps: Step[] = [];
  let value: number | null = null;
  let working = expression;

  if (!Number.isFinite(point)) {
    const poly = toPoly(expression, variable);
    if (poly) {
      const degree = poly.length - 1;
      const leading = poly[degree];
      value = degree === 0 ? leading : leading > 0 ? Infinity : -Infinity;
      steps.push({
        title: T('Compare the growth of the leading term', 'প্রধান পদের বৃদ্ধি তুলনা করো'),
        expr: `${polyToString(poly, variable)} → ${num(value)} as ${variable} → ${pointLabel}`,
        detail: T('For large x the highest power dominates.', 'বড় x-এর জন্য সর্বোচ্চ ঘাতই প্রভাব ফেলে।'),
      });
      const answer = !Number.isFinite(value) ? (value > 0 ? '∞' : '−∞') : num(value);
      return solved({
        kind: 'limit',
        topic: T('Limit', 'সীমা'),
        input: original,
        answer,
        steps,
        tip: T('Divide by the highest power of x to see the limit at infinity.', 'অসীমে সীমা দেখতে সর্বোচ্চ ঘাত দিয়ে ভাগ করো।'),
      });
    }
    const probe = at(expression, point);
    if (probe !== null) {
      value = probe;
      steps.push({
        title: T('Test very large values', 'খুব বড় মান বসিয়ে দেখো'),
        expr: `f(${point > 0 ? '10⁷' : '−10⁷'}) ≈ ${num(probe, 6)}`,
        detail: T('The values settle towards a limit.', 'মানগুলো একটি সীমার দিকে এগোয়।'),
      });
    }
  } else {
    const direct = at(expression, point);
    steps.push({
      title: T('Substitute the value', 'মানটি বসাও'),
      expr: `f(${pointLabel}) ${direct === null ? '= 0/0 — indeterminate' : `= ${num(direct, 6)}`}`,
      detail:
        direct === null
          ? T(
              'Direct substitution produces an indeterminate form, so more work is needed.',
              'সরাসরি বসালে অনির্দিষ্ট রূপ পাওয়া যায়, তাই আরও ধাপ দরকার।',
            )
          : T('Direct substitution is valid here.', 'এখানে সরাসরি মান বসানো যায়।'),
    });
    if (direct !== null) {
      value = direct;
    } else {
      // Algebraic cancellation for polynomial fractions
      if (expression.t === 'div') {
        const numerator = toPoly(expression.a, variable);
        const denominator = toPoly(expression.b, variable);
        if (numerator && denominator) {
          let cancel = 0;
          let n = numerator;
          let d = denominator;
          while (cancel < 3 && Math.abs(polyEval(n, point)) < 1e-9 && Math.abs(polyEval(d, point)) < 1e-9) {
            n = syntheticDivide(n, point);
            d = syntheticDivide(d, point);
            cancel++;
          }
          if (cancel > 0) {
            const valueAt = polyEval(n, point) / polyEval(d, point);
            value = valueAt;
            steps.push({
              title: T('Cancel the common factor', 'সাধারণ উৎপাদক কেটে দাও'),
              expr: `${polyToString(numerator, variable)} / ${polyToString(denominator, variable)} → ${polyToString(n, variable)} / ${polyToString(d, variable)}`,
              detail: T(
                `The factor (${variable} − ${nice(point)}) appears in both — cancel it ${cancel} time${cancel > 1 ? 's' : ''}.`,
                `(${variable} − ${nice(point)}) উৎপাদকটি দুই জায়গায় আছে — ${cancel} বার কেটে দাও।`,
              ),
            });
          }
        }

        // L'Hôpital's rule
        for (let attempt = 0; attempt < 3 && value === null && working.t === 'div'; attempt++) {
          const numeratorValue = at(working.a, point);
          const denominatorValue = at(working.b, point);
          const indeterminate =
            numeratorValue === null || Math.abs(numeratorValue) < 1e-9 || denominatorValue === null;
          if (!indeterminate && denominatorValue !== null && Math.abs(denominatorValue) > 1e-12) break;
          working = divNode(differentiate(working.a, variable), differentiate(working.b, variable));
          steps.push({
            title: T("Apply L'Hôpital's rule", 'লহোপিতালের নিয়ম প্রয়োগ করো'),
            expr: `lim ${variable}→${pointLabel} ${stringify(simplify(working))}`,
            detail: T(
              'Differentiate the numerator and the denominator separately.',
              'লব ও হরকে আলাদাভাবে অন্তরকলন করো।',
            ),
          });
          const next = at(working, point);
          if (next !== null) value = next;
        }
      }
    }
  }

  if (value === null) {
    return failed(
      T('This limit needs a technique the solver does not cover yet.', 'এই সীমার জন্য আরও উন্নত পদ্ধতি দরকার।'),
      T(
        'Try a rational function, a polynomial, or a standard 0/0 form like sin x / x.',
        'মূলদ ফাংশন, বহুপদী, বা sin x / x-এর মতো প্রমিত 0/0 রূপ দিয়ে চেষ্টা করুন।',
      ),
    );
  }

  const answer = Number.isFinite(value) ? nice(value) : value > 0 ? '∞' : '−∞';
  steps.push({
    title: T('Evaluate the limit', 'সীমার মান নির্ণয় করো'),
    expr: `lim ${variable}→${pointLabel} ${stringify(expression)} = ${answer}`,
  });

  return solved({
    kind: 'limit',
    topic: T('Limit', 'সীমা'),
    input: original,
    answer,
    steps,
    tip: T(
      'If substitution gives 0/0, try cancelling a factor or differentiating top and bottom.',
      'বসিয়ে 0/0 এলে উৎপাদক কাটো, নয়তো উপরে-নিচে অন্তরকলন করো।',
    ),
  });
}

/* ========================================================================== */
/*  Derivatives                                                                */
/* ========================================================================== */

function unwrap(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    let depth = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '(') depth++;
      else if (trimmed[i] === ')') depth--;
      if (depth === 0 && i < trimmed.length - 1) return trimmed;
    }
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function solveDerivative(text: string, original: string): SolveResult | null {
  let variable = 'x';
  let body: string | null = null;

  const symbolic = text.match(/^d\s*\/\s*d\s*([a-z])\s*([\s\S]+)$/i);
  if (symbolic) {
    variable = symbolic[1];
    body = symbolic[2];
  } else {
    const wordMatch = text.match(/^(?:the\s+)?(?:derivative|differentiate)(?:\s+of)?\s*([\s\S]+)$/i);
    if (wordMatch) body = wordMatch[1];
  }

  if (body === null) return null;
  body = unwrap(body.replace(/^[:=]\s*/, '').replace(/\s+with\s+respect\s+to\s+[a-z]$/i, ''));
  const node = tryParse(body);
  if (!node) return null;

  const vars = [...collectVars(node)];
  if (!vars.includes(variable)) variable = vars[0] ?? 'x';

  const rawDerivative = differentiate(node, variable);
  const simplified = simplify(rawDerivative);
  const poly = toPoly(simplified, variable);
  const answer = poly ? polyToString(poly, variable) : stringify(simplified);

  const ruleNames: Bi[] = [];
  const named = (name: Bi) => {
    if (!ruleNames.some((item) => item.en === name.en)) ruleNames.push(name);
  };
  if (/sin|cos|tan|ln|log|sqrt|exp/i.test(body)) named(T('chain rule', 'শৃঙ্খল নিয়ম'));
  if (/\*|\)\s*\(/.test(body)) named(T('product rule', 'গুণন নিয়ম'));
  if (/\//.test(body)) named(T('quotient rule', 'ভাগ নিয়ম'));
  if (!ruleNames.length) named(T('power rule', 'ঘাত নিয়ম'));

  return solved({
    kind: 'derivative',
    topic: T('Derivative', 'অন্তরকলজ'),
    input: original,
    answer: `d/d${variable} (${stringify(node)}) = ${answer}`,
    steps: [
      {
        title: T('Differentiate with respect to ' + variable, `${variable}-এর সাপেক্ষে অন্তরকলন করো`),
        expr: `f(${variable}) = ${stringify(node)}`,
        detail: T(
          `Rules in play: ${ruleNames.map((r) => r.en).join(', ')}.`,
          `প্রয়োগযোগ্য নিয়ম: ${ruleNames.map((r) => r.bn).join(', ')}।`,
        ),
      },
      {
        title: T('Apply the standard rules', 'প্রমিত নিয়মগুলো প্রয়োগ করো'),
        expr: stringify(rawDerivative).slice(0, 180),
      },
      {
        title: T('Simplify', 'সরল করো'),
        expr: answer,
      },
    ],
    tip: T(
      'Check your answer by differentiating again — the second derivative should match.',
      'আবার অন্তরকলন করে উত্তর যাচাই করো — দ্বিতীয় অন্তরকলজ মিলবে।',
    ),
  });
}

/* ========================================================================== */
/*  Integrals                                                                  */
/* ========================================================================== */

export function solveIntegral(text: string, original: string): SolveResult | null {
  if (!text.startsWith('∫') && !/^(integral|integrate)\b/i.test(text)) return null;

  let body = text.startsWith('∫')
    ? text.slice(1).trim()
    : text.replace(/^(integral|integrate)\s*(of)?\s*/i, '').trim();

  let variable = 'x';
  const dx = body.match(/d\s*([a-z])\s*$/);
  if (dx) {
    variable = dx[1];
    body = body.slice(0, dx.index ?? body.length).trim();
  }
  body = unwrap(body);
  const node = tryParse(body);
  if (!node) return null;

  const anti = integrate(node, variable);
  if (!anti) {
    return failed(
      T('This integral is outside the solver’s range.', 'এই সমাকলনটি সমাধানকারীর সীমার বাইরে।'),
      T(
        'It handles polynomials, 1/x, sin, cos, exp and 1/(ax + b).',
        'এটি বহুপদী, 1/x, sin, cos, exp এবং 1/(ax + b) সমাকলন করতে পারে।',
      ),
    );
  }

  const poly = toPoly(node, variable);
  const simplified = simplify(anti);
  const antiPoly = toPoly(simplified, variable);
  const answerBody = antiPoly ? polyToString(antiPoly, variable) : stringify(simplified);

  const steps: Step[] = [
    {
      title: T('Integrate term by term', 'পদে পদে সমাকলন করো'),
      expr: `∫ (${stringify(node)}) d${variable}`,
      detail: T('The integral of a sum is the sum of the integrals.', 'সমষ্টির সমাকলন হলো আলাদা সমাকলনের সমষ্টি।'),
    },
  ];

  if (poly) {
    steps.push({
      title: T('Apply the power rule', 'ঘাত নিয়ম প্রয়োগ করো'),
      expr: `∫ ${variable}${sup(2)} d${variable} = ${variable}${sup(3)}/3  ·  ∫ ${variable} d${variable} = ${variable}²/2`,
      detail: T(
        'Increase the power by one and divide by the new power.',
        'ঘাত এক বাড়াও এবং নতুন ঘাত দিয়ে ভাগ করো।',
      ),
    });
  }

  steps.push({
    title: T('Add the constant of integration', 'সমাকলনের ধ্রুবক যোগ করো'),
    expr: `${answerBody} + C`,
    detail: T('Any constant disappears when you differentiate, so it must be included.', 'যেকোনো ধ্রুবক অন্তরকলনে বিলীন হয়, তাই তা যোগ করতে হয়।'),
  });

  return solved({
    kind: 'integral',
    topic: T('Indefinite integral', 'অনির্দিষ্ট সমাকল'),
    input: original,
    answer: `${answerBody} + C`,
    steps,
    tip: T('Differentiate your answer to check it gives back the integrand.', 'উত্তরটি অন্তরকলন করে দেখো যে মূল রাশি ফিরে আসে।'),
  });
}

/* ========================================================================== */
/*  Exact trigonometry                                                         */
/* ========================================================================== */

const SIN_TABLE: Record<number, { text: string; value: number }> = {
  0: { text: '0', value: 0 },
  30: { text: '1/2', value: 0.5 },
  45: { text: '√2/2', value: Math.SQRT1_2 },
  60: { text: '√3/2', value: Math.sqrt(3) / 2 },
  90: { text: '1', value: 1 },
};

const TAN_TABLE: Record<number, { text: string; value: number }> = {
  0: { text: '0', value: 0 },
  30: { text: '√3/3', value: 1 / Math.sqrt(3) },
  45: { text: '1', value: 1 },
  60: { text: '√3', value: Math.sqrt(3) },
};

export function solveTrigonometry(text: string, original: string): SolveResult | null {
  const match = text.match(/^(sin|cos|tan|cot|sec|csc)\s*\(?\s*([^)]+?)\s*\)?\s*(°|deg(?:rees)?|rad(?:ians)?)?$/i);
  if (!match) return null;

  const fn = match[1].toLowerCase();
  const argText = match[2].trim();
  const unit = (match[3] ?? '').toLowerCase();

  let degrees: number | null = null;
  let radians = false;
  if (argText.includes('pi') || argText.includes('π')) radians = true;
  if (unit.startsWith('rad')) radians = true;

  const argNode = tryParse(argText);
  if (!argNode) return null;
  const argValue = evaluateNode(argNode);
  if (argValue === null) return null;

  if (radians) degrees = (argValue * 180) / Math.PI;
  else if (unit.startsWith('deg') || unit === '°' || /^-?\d+(\.\d+)?$/.test(argText)) degrees = argValue;
  else degrees = (argValue * 180) / Math.PI;

  if (degrees === null) return null;

  const normalized = ((degrees % 360) + 360) % 360;
  const exact = exactTrig(fn, normalized);
  const numeric = (() => {
    const radiansValue = (normalized * Math.PI) / 180;
    switch (fn) {
      case 'sin':
        return Math.sin(radiansValue);
      case 'cos':
        return Math.cos(radiansValue);
      case 'tan':
        return Math.tan(radiansValue);
      case 'cot':
        return 1 / Math.tan(radiansValue);
      case 'sec':
        return 1 / Math.cos(radiansValue);
      case 'csc':
        return 1 / Math.sin(radiansValue);
      default:
        return Number.NaN;
    }
  })();

  if (!Number.isFinite(numeric)) {
    return failed(
      T(`${fn} is not defined at ${nice(normalized)}°.`, `${nice(normalized)}°-এ ${fn} সংজ্ঞায়িত নয়।`),
      T('The denominator of the ratio is zero at this angle.', 'এই কোণে অনুপাতের হর শূন্য হয়।'),
    );
  }

  const cosine = Math.cos((normalized * Math.PI) / 180);
  const sine = Math.sin((normalized * Math.PI) / 180);
  const undefinedHere =
    (fn === 'tan' || fn === 'sec') && Math.abs(cosine) < 1e-12
      ? true
      : (fn === 'cot' || fn === 'csc') && Math.abs(sine) < 1e-12
        ? true
        : false;
  if (undefinedHere) {
    return failed(
      T(`${fn} is not defined at ${nice(normalized)}°.`, `${nice(normalized)}°-এ ${fn} সংজ্ঞায়িত নয়।`),
      T('The denominator of the ratio is zero at this angle.', 'এই কোণে অনুপাতের হর শূন্য হয়।'),
    );
  }
  const answer = exact ?? num(numeric, 6);
  const quadrant = Math.floor(normalized / 90) + 1;

  return solved({
    kind: 'trigonometry',
    topic: T('Trigonometry', 'ত্রিকোণমিতি'),
    input: original,
    answer: `${fn} ${nice(normalized)}° = ${answer}${
      exact && (exact.includes('√') || exact.includes('/')) ? `   (≈ ${num(numeric, 4)})` : ''
    }`,
    steps: [
      {
        title: T('Locate the angle', 'কোণটি চিহ্নিত করো'),
        expr: `${nice(normalized)}° lies in quadrant ${quadrant}`,
        detail: T(
          `The reference angle is ${nice(referenceAngle(normalized))}°.`,
          `প্রমাণ কোণটি ${nice(referenceAngle(normalized))}°।`,
        ),
      },
      {
        title: T('Multiply by π/180 to use radians', 'রেডিয়ানে নিতে π/180 দিয়ে গুণ করো'),
        expr: `${nice(normalized)}° × π/180 = ${num((normalized * Math.PI) / 180, 4)} rad`,
      },
      {
        title: T('Use the exact value', 'সঠিক মান ব্যবহার করো'),
        expr: exact ? `${fn} ${nice(normalized)}° = ${exact}` : `${fn} ${nice(normalized)}° ≈ ${num(numeric, 6)}`,
        detail:
          Math.abs(cosine) < 1e-12
            ? T('The angle is on the boundary between quadrants.', 'কোণটি চতুর্ভাগের সীমানায়।')
            : T('The sign follows the ASTC rule for this quadrant.', 'চিহ্নটি এই চতুর্ভাগের ASTC নিয়ম অনুসরণ করে।'),
      },
    ],
    tip: T(
      'ASTC: All, Sine, Tangent, Cosine are positive in quadrants I, II, III, IV.',
      'ASTC: প্রথম, দ্বিতীয়, তৃতীয়, চতুর্থ চতুর্ভাগে যথাক্রমে All, sin, tan, cos ধনাত্মক।',
    ),
  });
}

function referenceAngle(degrees: number): number {
  const inQuadrant = degrees % 90;
  return inQuadrant;
}

function exactTrig(fn: string, normalized: number): string | null {
  const quadrant = Math.floor(normalized / 90) % 4;
  const base = normalized % 90;
  const baseKey = Number(base.toFixed(6));
  const table = SIN_TABLE[baseKey];
  if (!table) return null;

  const cosBase = SIN_TABLE[90 - baseKey] ?? (baseKey === 0 ? { text: '1', value: 1 } : null);
  if (!cosBase) return null;

  const sinSign = quadrant === 0 ? 1 : quadrant === 1 ? 1 : quadrant === 2 ? -1 : -1;
  const cosSign = quadrant === 0 ? 1 : quadrant === 1 ? -1 : quadrant === 2 ? -1 : 1;

  const sinText = table.text;
  const cosText = cosBase.text;

  const signed = (sign: number, text: string) => (text === '0' ? '0' : `${sign < 0 ? '−' : ''}${text}`);

  switch (fn) {
    case 'sin':
      return signed(sinSign, sinText);
    case 'cos':
      return signed(cosSign, cosText);
    case 'tan': {
      const tanTable = TAN_TABLE[baseKey];
      if (tanTable) return signed(sinSign * cosSign, tanTable.text);
      return null;
    }
    case 'cot': {
      const tanTable = TAN_TABLE[baseKey];
      if (!tanTable) return null;
      const flip: Record<string, string> = { '0': 'undefined', '1': '1', '√3': '√3/3', '√3/3': '√3' };
      return signed(sinSign * cosSign, flip[tanTable.text] ?? tanTable.text);
    }
    case 'sec': {
      const flip: Record<string, string> = { '1': '1', '√2/2': '√2', '√3/2': '2√3/3', '1/2': '2' };
      return signed(cosSign, flip[cosBase.text] ?? cosBase.text);
    }
    case 'csc': {
      const flip: Record<string, string> = { '1': '1', '√2/2': '√2', '√3/2': '2√3/3', '1/2': '2' };
      return signed(sinSign, flip[table.text] ?? table.text);
    }
    default:
      return null;
  }
}

/* ========================================================================== */
/*  Mensuration                                                                */
/* ========================================================================== */

type MeasureKey = 'area' | 'volume' | 'surface' | 'curved' | 'total' | 'perimeter' | 'circumference';

interface Measurement {
  key: MeasureKey;
  label: Bi;
  exact: string;
  value: number;
}

function piText(coefficient: number): string {
  const fraction = rat(coefficient);
  if (fraction.d === 1) {
    if (fraction.n === 1) return 'π';
    if (fraction.n === -1) return '−π';
    return `${num(fraction.n)}π`;
  }
  const numerator = Math.abs(fraction.n) === 1 ? '' : `${Math.abs(fraction.n)}`;
  return `${fraction.n < 0 ? '−' : ''}${numerator}π/${fraction.d}`;
}

function measureText(measurement: Measurement): string {
  if (!Number.isFinite(measurement.value)) return measurement.exact;
  const decimal = num(measurement.value, 3);
  if (measurement.exact === decimal) return measurement.exact;
  if (measurement.exact.includes('π')) return `${measurement.exact} ≈ ${decimal}`;
  return decimal;
}

export function solveDivisionByZero(text: string, _original: string): SolveResult | null {
  if (!/\/\s*0(?![\d.])/.test(text)) return null;
  return failed(
    T('Division by zero is undefined.', 'শূন্য দিয়ে ভাগ করা যায় না।'),
    T(
      'A fraction can never have zero as its denominator.',
      'কোনো ভগ্নাংশের হর কখনোই শূন্য হতে পারে না।',
    ),
  );
}

export function solveMensuration(text: string, original: string): SolveResult | null {
  const shapeMatch = text.match(
    /\b(circle|semicircle|sphere|hemisphere|cylinder|cone|rectangle|square|triangle|trapezium|parallelogram)\b/,
  );
  if (!shapeMatch) return null;
  const shape = shapeMatch[1];

  const wantsSurface = /(surface\s*area|total\s*surface)/i.test(text);
  const wantsCurved = /(curved\s*surface|lateral\s*surface)/i.test(text);
  const wantsVolume = /volume/i.test(text);
  const wantsArea = /(area|surface)/i.test(text);
  const wantsPerimeter = /(perimeter|circumference|boundary)/i.test(text);

  const labeled: Record<string, number> = {};
  const labelRe = /\b(radius|diameter|height|length|breadth|width|base|side|sides|slant)\s*[=:]\s*(\d+(?:\.\d+)?)/gi;
  for (const match of text.matchAll(labelRe)) {
    labeled[match[1].toLowerCase()] = Number(match[2]);
  }
  const shortRe = /\b([rdhlbaws])\s*[=:]\s*(\d+(?:\.\d+)?)/gi;
  for (const match of text.matchAll(shortRe)) {
    const key = match[1].toLowerCase();
    if (!(key in labeled)) labeled[key] = Number(match[2]);
  }

  let bare = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (Object.keys(labeled).length > 0) bare = [];

  let radius = labeled.radius ?? labeled.r;
  if (radius === undefined) {
    const diameter = labeled.diameter ?? labeled.d;
    radius = diameter !== undefined ? diameter / 2 : bare[0];
  }
  const height = labeled.height ?? labeled.h ?? bare[1] ?? bare[0];

  if (!Number.isFinite(radius) && shape !== 'rectangle' && shape !== 'square' && shape !== 'triangle' && shape !== 'trapezium') {
    return failed(
      T('I need the radius to work that out.', 'এটি নির্ণয় করতে ব্যাসার্ধ দরকার।'),
      T('Add the value like this: “area of a circle r = 7”.', 'এভাবে মান যোগ করুন: “area of a circle r = 7”।'),
    );
  }

  const measurements: Measurement[] = [];
  let formula = '';
  let substitution = '';

  switch (shape) {
    case 'circle':
    case 'semicircle': {
      const r = radius;
      const half = shape === 'semicircle' ? 0.5 : 1;
      formula = `A = πr²,  C = 2πr`;
      substitution = `r = ${nice(r)}`;
      measurements.push(
        { key: 'area', label: T('Area', 'ক্ষেত্রফল'), exact: piText(half * r * r), value: half * Math.PI * r * r },
        {
          key: 'circumference',
          label: T('Circumference', 'পরিধি'),
          exact: piText(2 * half * r),
          value: half * 2 * Math.PI * r,
        },
      );
      break;
    }
    case 'sphere':
    case 'hemisphere': {
      const r = radius;
      const half = shape === 'hemisphere' ? 0.5 : 1;
      formula = `V = (4/3)πr³,  S = 4πr²`;
      substitution = `r = ${nice(r)}`;
      measurements.push(
        {
          key: 'volume',
          label: T('Volume', 'আয়তন'),
          exact: piText((4 / 3) * half * r * r * r),
          value: (4 / 3) * half * Math.PI * r * r * r,
        },
        {
          key: 'surface',
          label: T('Surface area', 'পৃষ্ঠতলের ক্ষেত্রফল'),
          exact: half === 1 ? `${piText(4 * r * r)}` : `${piText(3 * r * r)}`,
          value: (half === 1 ? 4 : 3) * Math.PI * r * r,
        },
      );
      break;
    }
    case 'cylinder': {
      const r = radius;
      const h = height;
      formula = `V = πr²h,  curved = 2πrh,  total = 2πr(r + h)`;
      substitution = `r = ${nice(r)}, h = ${nice(h)}`;
      measurements.push(
        { key: 'volume', label: T('Volume', 'আয়তন'), exact: piText(r * r * h), value: Math.PI * r * r * h },
        { key: 'curved', label: T('Curved surface', 'বক্রপৃষ্ঠ'), exact: piText(2 * r * h), value: 2 * Math.PI * r * h },
        { key: 'total', label: T('Total surface', 'সমগ্র পৃষ্ঠ'), exact: piText(2 * r * (r + h)), value: 2 * Math.PI * r * (r + h) },
      );
      break;
    }
    case 'cone': {
      const r = radius;
      const h = height;
      const slant = Math.sqrt(r * r + h * h);
      formula = `l = √(r² + h²),  V = (1/3)πr²h,  curved = πrl`;
      substitution = `r = ${nice(r)}, h = ${nice(h)}, l = ${num(slant, 3)}`;
      measurements.push(
        {
          key: 'volume',
          label: T('Volume', 'আয়তন'),
          exact: piText((1 / 3) * r * r * h),
          value: (Math.PI * r * r * h) / 3,
        },
        { key: 'curved', label: T('Curved surface', 'বক্রপৃষ্ঠ'), exact: piText(r * slant), value: Math.PI * r * slant },
        {
          key: 'total',
          label: T('Total surface', 'সমগ্র পৃষ্ঠ'),
          exact: piText(r * (r + slant)),
          value: Math.PI * r * (r + slant),
        },
      );
      break;
    }
    case 'rectangle': {
      const length = labeled.length ?? labeled.l ?? bare[0];
      const breadth = labeled.breadth ?? labeled.width ?? labeled.b ?? bare[1];
      if (!Number.isFinite(length) || !Number.isFinite(breadth)) return null;
      formula = `A = l × b,  P = 2(l + b)`;
      substitution = `l = ${nice(length)}, b = ${nice(breadth)}`;
      measurements.push(
        { key: 'area', label: T('Area', 'ক্ষেত্রফল'), exact: nice(length * breadth), value: length * breadth },
        { key: 'perimeter', label: T('Perimeter', 'পরিসীমা'), exact: nice(2 * (length + breadth)), value: 2 * (length + breadth) },
      );
      break;
    }
    case 'square': {
      const side = labeled.side ?? labeled.s ?? bare[0];
      if (!Number.isFinite(side)) return null;
      formula = `A = a²,  P = 4a`;
      substitution = `a = ${nice(side)}`;
      measurements.push(
        { key: 'area', label: T('Area', 'ক্ষেত্রফল'), exact: nice(side * side), value: side * side },
        { key: 'perimeter', label: T('Perimeter', 'পরিসীমা'), exact: nice(4 * side), value: 4 * side },
      );
      break;
    }
    case 'triangle': {
      const base = labeled.base ?? labeled.b ?? bare[0];
      const triHeight = labeled.height ?? labeled.h ?? bare[1];
      const sides = [labeled.a, labeled.b, labeled.c].filter((value): value is number => Number.isFinite(value));
      if (Number.isFinite(base) && Number.isFinite(triHeight)) {
        formula = `A = ½ × base × height`;
        substitution = `base = ${nice(base)}, height = ${nice(triHeight)}`;
        measurements.push({
          key: 'area',
          label: T('Area', 'ক্ষেত্রফল'),
          exact: nice((base * triHeight) / 2),
          value: (base * triHeight) / 2,
        });
      } else if (sides.length === 3) {
        const [a, b, c] = sides;
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        formula = `A = √[s(s − a)(s − b)(s − c)],  s = (a + b + c)/2`;
        substitution = `s = ${nice(s)}`;
        measurements.push({ key: 'area', label: T('Area', 'ক্ষেত্রফল'), exact: num(area, 3), value: area });
      } else {
        return null;
      }
      break;
    }
    case 'trapezium': {
      const a = labeled.a ?? bare[0];
      const b = labeled.b ?? bare[1];
      const h = labeled.height ?? labeled.h ?? bare[2];
      if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(h)) return null;
      formula = `A = ½(a + b)h`;
      substitution = `a = ${nice(a)}, b = ${nice(b)}, h = ${nice(h)}`;
      measurements.push({ key: 'area', label: T('Area', 'ক্ষেত্রফল'), exact: nice(((a + b) * h) / 2), value: ((a + b) * h) / 2 });
      break;
    }
    case 'parallelogram': {
      const base = labeled.base ?? labeled.b ?? bare[0];
      const h = labeled.height ?? labeled.h ?? bare[1];
      if (!Number.isFinite(base) || !Number.isFinite(h)) return null;
      formula = `A = base × height`;
      substitution = `base = ${nice(base)}, height = ${nice(h)}`;
      measurements.push({ key: 'area', label: T('Area', 'ক্ষেত্রফল'), exact: nice(base * h), value: base * h });
      break;
    }
    default:
      return null;
  }

  let requested: Measurement | undefined;
  if (wantsVolume) requested = measurements.find((m) => m.key === 'volume');
  if (!requested && wantsCurved) requested = measurements.find((m) => m.key === 'curved');
  if (!requested && wantsSurface)
    requested = measurements.find((m) => m.key === 'total') ?? measurements.find((m) => m.key === 'surface');
  if (!requested && wantsPerimeter)
    requested = measurements.find((m) => m.key === 'perimeter') ?? measurements.find((m) => m.key === 'circumference');
  if (!requested && wantsArea) requested = measurements.find((m) => m.key === 'area');
  if (!requested) requested = measurements[0];

  const others = measurements.filter((m) => m !== requested);

  return solved({
    kind: 'mensuration',
    topic: T('Mensuration', 'পরিমিতি'),
    input: original,
    answer: `${requested.label.en} = ${measureText(requested)}`,
    answerNote:
      others.length > 0
        ? T(
            others.map((m) => `${m.label.en} = ${measureText(m)}`).join('   ·   '),
            others.map((m) => `${m.label.bn} = ${measureText(m)}`).join('   ·   '),
          )
        : undefined,
    steps: [
      {
        title: T('Choose the formula', 'সূত্রটি বেছে নাও'),
        expr: formula,
        detail: T(`For a ${shape}.`, `একটি ${shape}-এর জন্য।`),
      },
      {
        title: T('Substitute the values', 'মানগুলো বসাও'),
        expr: substitution,
      },
      {
        title: T('Calculate', 'গণনা করো'),
        expr: `${requested.label.en} = ${measureText(requested)}`,
        detail: T(
          'Keep π in the exact answer and multiply at the end for the decimal.',
          'সঠিক উত্তরে π রাখো, শেষে গুণ করে দশমিক মান বের করো।',
        ),
      },
    ],
    tip: T(
      'Area is measured in square units, volume in cubic units.',
      'ক্ষেত্রফল বর্গ এককে, আয়তন ঘন এককে মাপা হয়।',
    ),
  });
}

/* ========================================================================== */
/*  Percentages                                                                */
/* ========================================================================== */

export function solvePercent(text: string, original: string): SolveResult | null {
  const ofMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i);
  if (ofMatch) {
    const percent = Number(ofMatch[1]);
    const base = Number(ofMatch[2]);
    const value = (percent / 100) * base;
    return solved({
      kind: 'percent',
      topic: T('Percentage', 'শতকরা'),
      input: original,
      answer: `${nice(percent)}% of ${nice(base)} = ${nice(value)}`,
      steps: [
        {
          title: T('Write the percentage as a fraction', 'শতকরাকে ভগ্নাংশে লেখো'),
          expr: `${nice(percent)}% = ${nice(percent)}/100 = ${nice(percent / 100)}`,
        },
        {
          title: T('Multiply by the whole', 'সম্পূর্ণ মান দিয়ে গুণ করো'),
          expr: `${nice(percent / 100)} × ${nice(base)} = ${nice(value)}`,
        },
      ],
      tip: T('“Per cent” means “per hundred”.', '“শতকরা” মানে “প্রতি একশোতে”।'),
    });
  }

  const increase = text.match(/(?:increase|raise)\s+(\d+(?:\.\d+)?)\s+by\s+(\d+(?:\.\d+)?)\s*%/i);
  const decrease = text.match(/(?:decrease|reduce|discount)\s+(\d+(?:\.\d+)?)\s+by\s+(\d+(?:\.\d+)?)\s*%/i);
  const match = increase ?? decrease;
  if (match) {
    const base = Number(match[1]);
    const percent = Number(match[2]);
    const factor = increase ? 1 + percent / 100 : 1 - percent / 100;
    const value = base * factor;
    return solved({
      kind: 'percent',
      topic: T('Percentage change', 'শতকরা পরিবর্তন'),
      input: original,
      answer: `${nice(value)}`,
      steps: [
        {
          title: T('Translate to a multiplier', 'গুণক-এ রূপান্তর করো'),
          expr: increase ? `1 + ${nice(percent)}/100 = ${nice(factor)}` : `1 − ${nice(percent)}/100 = ${nice(factor)}`,
        },
        {
          title: T('Multiply', 'গুণ করো'),
          expr: `${nice(base)} × ${nice(factor)} = ${nice(value)}`,
        },
      ],
      tip: T('An increase of p% multiplies by (1 + p/100).', 'p% বৃদ্ধি মানে (1 + p/100) দিয়ে গুণ।'),
    });
  }

  return null;
}

/* ========================================================================== */
/*  Number theory                                                              */
/* ========================================================================== */

function gcdOf(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function primeFactorsOf(n: number): number[] {
  const factors: number[] = [];
  let value = n;
  for (let d = 2; d * d <= value; d++) {
    while (value % d === 0) {
      factors.push(d);
      value /= d;
    }
  }
  if (value > 1) factors.push(value);
  return factors;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

export function solveNumberTheory(text: string, original: string): SolveResult | null {
  const gcdMatch = text.match(/^(gcd|hcf|gcf|lcm)\s*[(\s]\s*([\d\s,]+)\)?/i);
  if (gcdMatch) {
    const numbers = (gcdMatch[2].match(/\d+/g) ?? []).map(Number);
    if (numbers.length < 2) return null;
    const isLcm = gcdMatch[1].toLowerCase() === 'lcm';
    let value = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      const other = numbers[i];
      value = isLcm ? (value * other) / gcdOf(value, other) : gcdOf(value, other);
    }
    const factorLists = numbers.map((n) => `${n} = ${primeFactorsOf(n).join(' × ') || '1'}`);
    return solved({
      kind: 'number-theory',
      topic: isLcm ? T('Lowest common multiple', 'লঘিষ্ঠ সাধারণ গুণিতক') : T('Highest common factor', 'গরিষ্ঠ সাধারণ গুণনীয়ক'),
      input: original,
      answer: `${isLcm ? 'lcm' : 'gcd'}(${numbers.join(', ')}) = ${nice(value)}`,
      steps: [
        {
          title: T('Prime factorise each number', 'প্রতিটি সংখ্যাকে মৌলিক উৎপাদকে বিশ্লেষণ করো'),
          expr: factorLists.join(';  '),
        },
        {
          title: isLcm ? T('Take the highest power of every prime', 'প্রতিটি মৌলিকের সর্বোচ্চ ঘাত নাও') : T('Take the common primes', 'সাধারণ মৌলিকগুলো নাও'),
          expr: `${isLcm ? 'lcm' : 'gcd'} = ${nice(value)}`,
        },
      ],
      tip: T('gcd(a,b) × lcm(a,b) = a × b.', 'গসাগু(a,b) × লসাগু(a,b) = a × b।'),
    });
  }

  const primeCheck = text.match(/^(?:is\s+)?(\d+)\s+(?:a\s+)?prime\b/i);
  if (primeCheck) {
    const n = Number(primeCheck[1]);
    if (n < 2) {
      return solved({
        kind: 'number-theory',
        topic: T('Primality test', 'মৌলিকতা পরীক্ষা'),
        input: original,
        answer: `${n} is neither prime nor composite`,
        steps: [
          {
            title: T('Recall the definition', 'সংজ্ঞা মনে করো'),
            expr: `2, 3, 5, 7, 11, …`,
            detail: T('A prime has exactly two factors: 1 and itself.', 'মৌলিক সংখ্যার ঠিক দুটি উৎপাদক: ১ এবং নিজে।'),
          },
        ],
        tip: T('1 is not prime because it has only one factor.', '১ মৌলিক নয়, কারণ এর উৎপাদক একটিই।'),
      });
    }
    const prime = isPrime(n);
    return solved({
      kind: 'number-theory',
      topic: T('Primality test', 'মৌলিকতা পরীক্ষা'),
      input: original,
      answer: `${n} is ${prime ? 'prime' : 'not prime'}`,
      steps: [
        {
          title: T('Check divisors up to √n', '√n পর্যন্ত ভাজক পরীক্ষা করো'),
          expr: `√${n} ≈ ${num(Math.sqrt(n), 3)}`,
          detail: T(
            'If no prime up to √n divides the number, it is prime.',
            '√n পর্যন্ত কোনো মৌলিক সংখ্যা না ভাগ করলে সংখ্যাটি মৌলিক।',
          ),
        },
        prime
          ? {
              title: T('No divisor found', 'কোনো ভাজক পাওয়া যায়নি'),
              expr: `${n} has no divisors other than 1 and itself`,
            }
          : {
              title: T('A divisor exists', 'একটি ভাজক আছে'),
              expr: `${primeFactorsOf(n)[0]} × ${n / primeFactorsOf(n)[0]} = ${n}`,
            },
      ],
      tip: T('2 is the only even prime number.', '২ একমাত্র জোড় মৌলিক সংখ্যা।'),
    });
  }

  const factorMatch = text.match(/(?:prime\s+factors?(?:ization|isation)?|factorise|factorize|factor)\s*(?:of\s*)?(\d+)/i);
  if (factorMatch) {
    const n = Number(factorMatch[1]);
    const factors = primeFactorsOf(n);
    const grouped = new Map<number, number>();
    factors.forEach((factor) => grouped.set(factor, (grouped.get(factor) ?? 0) + 1));
    const textForm = [...grouped.entries()].map(([prime, power]) => (power > 1 ? `${prime}${sup(power)}` : `${prime}`)).join(' × ');
    return solved({
      kind: 'number-theory',
      topic: T('Prime factorisation', 'মৌলিক উৎপাদকে বিশ্লেষণ'),
      input: original,
      answer: `${n} = ${textForm || String(n)}`,
      steps: [
        {
          title: T('Divide by the smallest prime first', 'প্রথমে ক্ষুদ্রতম মৌলিক দিয়ে ভাগ করো'),
          expr: factors.join(' × ') || String(n),
        },
        {
          title: T('Collect equal primes as powers', 'একই মৌলিকগুলো ঘাত হিসেবে লেখো'),
          expr: `${n} = ${textForm || String(n)}`,
        },
      ],
      tip: T('Every integer greater than 1 has a unique prime factorisation.', '১-এর চেয়ে বড় প্রতিটি পূর্ণসংখ্যার অনন্য মৌলিক উৎপাদক-বিশ্লেষণ আছে।'),
    });
  }

  return null;
}

/* ========================================================================== */
/*  Factorials, permutations and combinations                                  */
/* ========================================================================== */

function factorial(n: number): bigint {
  let out = 1n;
  for (let i = 2; i <= n; i++) out *= BigInt(i);
  return out;
}

export function solveCombinatorics(text: string, original: string): SolveResult | null {
  const factorialMatch = text.match(/^(\d+)\s*!$/) ?? text.match(/^factorial\s*(?:of\s*)?(\d+)$/i);
  if (factorialMatch) {
    const n = Number(factorialMatch[1]);
    if (n > 500) return null;
    const value = factorial(n);
    return solved({
      kind: 'combinatorics',
      topic: T('Factorial', 'ফ্যাক্টরিয়াল'),
      input: original,
      answer: `${n}! = ${value}`,
      steps: [
        {
          title: T('Multiply every whole number down to 1', '১ পর্যন্ত প্রতিটি পূর্ণসংখ্যা গুণ করো'),
          expr: n <= 12 ? `${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${value}` : `${n}! = ${value}`,
        },
      ],
      tip: T('0! = 1 by definition.', 'সংজ্ঞানুযায়ী 0! = 1।'),
    });
  }

  const combination =
    text.match(/^(\d+)\s*[cC]\s*(\d+)$/) ??
    text.match(/^c\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/) ??
    text.match(/^(\d+)\s*choose\s*(\d+)$/i);
  const permutation =
    text.match(/^(\d+)\s*[pP]\s*(\d+)$/) ??
    text.match(/^p\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/) ??
    text.match(/^(\d+)\s*permute\s*(\d+)$/i);
  const match = combination ?? permutation;
  if (!match) return null;

  const n = Number(match[1]);
  const r = Number(match[2]);
  if (r > n || n > 500) {
    return failed(
      T('For nCr and nPr we need r ≤ n.', 'nCr ও nPr-এর জন্য r ≤ n হতে হবে।'),
      T('Check the two numbers and try again.', 'দুটি সংখ্যা দেখে আবার চেষ্টা করুন।'),
    );
  }

  const isCombination = !!combination;
  const numerator = factorial(n) / factorial(n - r);
  const value = isCombination ? numerator / factorial(r) : numerator;
  const valueText = value.toString();

  return solved({
    kind: 'combinatorics',
    topic: isCombination ? T('Combination', 'সমাবেশ') : T('Permutation', 'বিন্যাস'),
    input: original,
    answer: isCombination ? `${n}C${r} = ${valueText}` : `${n}P${r} = ${valueText}`,
    steps: [
      {
        title: T('Write the formula', 'সূত্রটি লেখো'),
        expr: isCombination ? `ⁿCᵣ = n! / [r!(n − r)!]` : `ⁿPᵣ = n! / (n − r)!`,
      },
      {
        title: T('Substitute', 'মান বসাও'),
        expr: isCombination ? `${n}! / [${r}!(${n} − ${r})!]` : `${n}! / (${n} − ${r})!`,
      },
      {
        title: T('Calculate', 'গণনা করো'),
        expr: isCombination ? `${factorial(n)} / (${factorial(r)} × ${factorial(n - r)}) = ${valueText}` : `${factorial(n)} / ${factorial(n - r)} = ${valueText}`,
      },
    ],
    tip: T(
      'Order matters in permutations but not in combinations.',
      'বিন্যাসে ক্রম গুরুত্বপূর্ণ, সমাবেশে নয়।',
    ),
  });
}

/* ========================================================================== */
/*  Determinants                                                               */
/* ========================================================================== */

export function solveMatrix(text: string, original: string): SolveResult | null {
  const detMatch = text.match(/^det(?:erminant)?\s*(?:of\s*)?(.+)$/i);
  const invMatch = text.match(/^inverse\s*(?:of\s*)?(.+)$/i);
  const match = detMatch ?? invMatch;
  if (!match) return null;

  const numbers = (match[1].match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const isInverse = !!invMatch;

  if (numbers.length === 4) {
    const [a, b, c, d] = numbers;
    const det = a * d - b * c;
    if (isInverse) {
      if (Math.abs(det) < 1e-12) {
        return failed(
          T('This matrix has no inverse because its determinant is zero.', 'নির্ণায়ক শূন্য হওয়ায় এই ম্যাট্রিক্সের বিপরীত নেই।'),
          T('A matrix is invertible only when det(A) ≠ 0.', 'det(A) ≠ 0 হলেই ম্যাট্রিক্সটি বিপরীতযোগ্য।'),
        );
      }
      return solved({
        kind: 'matrix',
        topic: T('Matrix inverse', 'ম্যাট্রিক্সের বিপরীত'),
        input: original,
        answer: `A⁻¹ = (1/${nice(det)}) [[${nice(d)}, ${nice(-b)}], [${nice(-c)}, ${nice(a)}]]`,
        steps: [
          {
            title: T('Find the determinant', 'নির্ণায়ক নির্ণয় করো'),
            expr: `|A| = (${nice(a)})(${nice(d)}) − (${nice(b)})(${nice(c)}) = ${nice(det)}`,
          },
          {
            title: T('Swap and negate', 'অদল-বদল করে চিহ্ন বদলাও'),
            expr: `A⁻¹ = (1/|A|) [[d, −b], [−c, a]]`,
          },
          {
            title: T('Write the result', 'ফলাফল লেখো'),
            expr: `A⁻¹ = (1/${nice(det)}) [[${nice(d)}, ${nice(-b)}], [${nice(-c)}, ${nice(a)}]]`,
          },
        ],
        tip: T('A matrix times its inverse gives the identity matrix.', 'একটি ম্যাট্রিক্সকে তার বিপরীত দিয়ে গুণ করলে একক ম্যাট্রিক্স পাওয়া যায়।'),
      });
    }
    return solved({
      kind: 'matrix',
      topic: T('Determinant', 'নির্ণায়ক'),
      input: original,
      answer: `|A| = ${nice(det)}`,
      steps: [
        {
          title: T('Use the 2 × 2 rule', '২ × ২ নিয়ম ব্যবহার করো'),
          expr: `|A| = ad − bc`,
        },
        {
          title: T('Substitute the entries', 'মৌলিক সংখ্যাগুলো বসাও'),
          expr: `|A| = (${nice(a)})(${nice(d)}) − (${nice(b)})(${nice(c)})`,
        },
        {
          title: T('Calculate', 'গণনা করো'),
          expr: `|A| = ${nice(a * d)} − ${nice(b * c)} = ${nice(det)}`,
        },
      ],
      tip: T('If the determinant is zero the matrix is singular and has no inverse.', 'নির্ণায়ক শূন্য হলে ম্যাট্রিক্সটি অসিঙ্গুলার এবং এর বিপরীত নেই।'),
    });
  }

  if (numbers.length === 9) {
    const [a, b, c, d, e, f, g, h, i] = numbers;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    return solved({
      kind: 'matrix',
      topic: T('Determinant', 'নির্ণায়ক'),
      input: original,
      answer: `|A| = ${nice(det)}`,
      steps: [
        {
          title: T('Expand along the first row', 'প্রথম সারি বরাবর বিস্তার করো'),
          expr: `|A| = a(ei − fh) − b(di − fg) + c(dh − eg)`,
        },
        {
          title: T('Compute the 2 × 2 minors', '২ × ২ অপ্রধান নির্ণায়ক নির্ণয় করো'),
          expr: `ei − fh = ${nice(e * i - f * h)},  di − fg = ${nice(d * i - f * g)},  dh − eg = ${nice(d * h - e * g)}`,
        },
        {
          title: T('Substitute and add', 'মান বসিয়ে যোগ করো'),
          expr: `${nice(a)}(${nice(e * i - f * h)}) − ${nice(b)}(${nice(d * i - f * g)}) + ${nice(c)}(${nice(d * h - e * g)}) = ${nice(det)}`,
        },
      ],
      tip: T('A determinant changes sign if you swap two rows.', 'দুটি সারি অদল-বদল করলে নির্ণায়কের চিহ্ন বদলায়।'),
    });
  }

  return null;
}

/* shared helpers */
