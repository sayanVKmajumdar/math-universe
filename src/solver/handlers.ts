import type { Bi, Step } from '@/lib/types';
import {
  collectVars,
  evaluateExact,
  evaluateNode,
  polyEval,
  polyToString,
  simplify,
  stringify,
  subNode,
  syntheticDivide,
  toPoly,
  tryParse,
  type Node,
  type Poly,
} from './ast';
import { nice, num, rat, rDiv, rStr, sup } from './rational';
import { bi, failed, solved, type SolveResult } from './result';

const T = bi;

export function stripLead(text: string): string {
  return text
    .replace(/^(please\s+)?(solve|find|evaluate|calculate|compute|simplify|expand|work\s+out)\b/i, '')
    .replace(/^\s*(for\s+[a-z]\s*)?[:=]?\s*/i, '')
    .trim();
}

/** Split "lhs = rhs" into an expression node for lhs − rhs. */
export function equationDifference(text: string): { left: Node; right: Node; diff: Node } | null {
  const parts = text.split('=');
  if (parts.length !== 2) return null;
  const left = tryParse(parts[0]);
  const right = tryParse(parts[1]);
  if (!left || !right) return null;
  return { left, right, diff: subNode(left, right) };
}

export function variableOf(nodes: Node[]): string | null {
  const vars = new Set<string>();
  nodes.forEach((node) => collectVars(node, vars));
  if (vars.size === 0) return null;
  if (vars.has('x')) return 'x';
  return [...vars][0];
}

/* ========================================================================== */
/*  1. Linear equations                                                        */
/* ========================================================================== */

export function solveLinear(diff: Node, variable: string, original: string): SolveResult | null {
  const poly = toPoly(diff, variable);
  if (!poly) return null;
  const degree = poly.length - 1;
  if (degree !== 1) return null;

  const b = poly[0];
  const a = poly[1];
  if (Math.abs(a) < 1e-12) {
    const consistent = Math.abs(b) < 1e-12;
    return solved({
      kind: 'linear',
      topic: T('Linear equation', 'রৈখিক সমীকরণ'),
      input: original,
      answer: consistent ? 'Infinitely many solutions' : 'No solution',
      answerNote: consistent
        ? T('Both sides are identical after simplifying.', 'সরল করার পর দুই পক্ষ একই হয়।')
        : T('The variable cancels out and leaves a false statement.', 'চলকটি বাদ পড়ে একটি অসত্য বিবৃতি থাকে।'),
      steps: [
        {
          title: T('Simplify both sides', 'উভয় পক্ষ সরল করো'),
          expr: `${polyToString([b])} = 0`,
          detail: consistent
            ? T('The equation reduces to 0 = 0, which is always true.', 'সমীকরণটি 0 = 0-এ দাঁড়ায়, যা সর্বদা সত্য।')
            : T('The equation reduces to a contradiction.', 'সমীকরণটি একটি বিরোধে দাঁড়ায়।'),
        },
      ],
    });
  }

  const root = rDiv(rat(-b), rat(a));
  const answer = `${variable} = ${rStr(root)}`;
  const sideA = stringify(simplify(subNode(diff, { t: 'num', v: 0 })));

  const steps: Step[] = [
    {
      title: T('Write the equation in standard form', 'সমীকরণটি প্রমিত আকারে লেখো'),
      expr: `${polyToString(poly, variable)} = 0`,
      detail: T('Move every term to the left-hand side.', 'সব পদ বাম দিকে আনো।'),
    },
    {
      title: T('Isolate the variable term', 'চলকযুক্ত পদটিকে আলাদা করো'),
      expr: `${nice(a)}${variable} = ${nice(-b)}`,
      detail: T(`Move the constant ${nice(-b)} to the right-hand side.`, `ধ্রুবক ${nice(-b)} ডান দিকে নাও।`),
    },
    {
      title: T('Divide both sides by the coefficient', 'উভয় পক্ষকে সহগ দিয়ে ভাগ করো'),
      expr: `${variable} = ${nice(-b)} / ${nice(a)}${rStr(root) !== num(-b / a) ? ` = ${rStr(root)}` : ''}`,
      detail: T(
        `Dividing both sides by ${nice(a)} gives ${variable} = ${rStr(root)}.`,
        `উভয় পক্ষকে ${nice(a)} দিয়ে ভাগ করলে ${variable} = ${rStr(root)} পাওয়া যায়।`,
      ),
    },
    {
      title: T('Check', 'যাচাই'),
      expr: `${sideA.replace(/= 0$/, '')} at ${variable} = ${rStr(root)} → 0`,
    },
  ];

  return solved({
    kind: 'linear',
    topic: T('Linear equation', 'রৈখিক সমীকরণ'),
    input: original,
    answer,
    steps,
    tip: T(
      'Whatever you do to one side of an equation, do to the other side as well.',
      'সমীকরণের এক পাশে যা করো, অন্য পাশেও ঠিক তা-ই করো।',
    ),
    plot: {
      fn: (x) => a * x + b,
      xMin: Math.min(0, -b / a) - 3,
      xMax: Math.max(0, -b / a) + 3,
      points: [{ x: -b / a, y: 0, label: `(${rStr(root)}, 0)` }],
    },
  });
}

/* ========================================================================== */
/*  2. Quadratic equations                                                     */
/* ========================================================================== */

function rootText(value: number): string {
  return nice(value);
}

function gcdInt(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** (−b ± √D) / 2a with the fraction fully reduced: 1 ± √2, ±√5, (3 ± √7)/2. */
function reducedSurdText(constant: number, discriminant: number, denominator: number): string {
  const { coefficient, radicand } = simplifySurd(discriminant);
  const divisor = gcdInt(gcdInt(Math.abs(denominator), Math.abs(constant)), coefficient);
  const q = denominator / divisor;
  const c = constant / divisor;
  const k = coefficient / divisor;
  const surd = `${k === 1 ? '' : k}√${radicand}`;
  const head = Math.abs(c) < 1e-9 ? '' : `${nice(c)} `;
  const body = `${head}± ${surd}`.trim();
  return q === 1 ? body : `(${body}) / ${q}`;
}

/** Pull the largest square factor out of a surd: √12 → 2√3. */
function simplifySurd(value: number): { coefficient: number; radicand: number } {
  const whole = Math.round(value);
  for (let factor = Math.floor(Math.sqrt(whole)); factor >= 2; factor--) {
    if (whole % (factor * factor) === 0) {
      return { coefficient: factor, radicand: whole / (factor * factor) };
    }
  }
  return { coefficient: 1, radicand: whole };
}

export function solveQuadratic(
  diff: Node,
  variable: string,
  original: string,
  polyOverride?: Poly,
): SolveResult | null {
  const poly = polyOverride ?? toPoly(diff, variable);
  if (!poly || poly.length !== 3) return null;
  const [c, b, a] = poly;
  if (Math.abs(a) < 1e-12) return null;

  const discriminant = b * b - 4 * a * c;
  const denominator = 2 * a;
  const vertex = -b / denominator;
  const steps: Step[] = [];

  steps.push({
    title: T('Identify the coefficients', 'সহগগুলো নির্ণয় করো'),
    expr: `${variable}² equation: a = ${nice(a)}, b = ${nice(b)}, c = ${nice(c)}`,
    detail: T(
      'Compare with the standard form ax² + bx + c = 0.',
      'প্রমিত রূপ ax² + bx + c = 0 এর সাথে তুলনা করো।',
    ),
  });

  steps.push({
    title: T('Find the discriminant', 'বিবেচক নির্ণয় করো'),
    expr: `D = b² − 4ac = (${nice(b)})² − 4(${nice(a)})(${nice(c)}) = ${nice(discriminant)}`,
    detail:
      discriminant > 0
        ? T('D > 0, so there are two distinct real roots.', 'D > 0, তাই দুটি ভিন্ন বাস্তব বীজ আছে।')
        : discriminant === 0
          ? T('D = 0, so the two roots coincide.', 'D = 0, তাই দুটি বীজ একই।')
          : T('D < 0, so the roots are a complex-conjugate pair.', 'D < 0, তাই বীজ দুটি জটিল ও পরস্পর অনুবন্ধী।'),
  });

  let answer: string;
  let answerNote: Bi | undefined;
  const points: { x: number; y: number; label?: string }[] = [];

  if (discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    const root1 = (-b + sqrtD) / denominator;
    const root2 = (-b - sqrtD) / denominator;
    const exact = Number.isInteger(sqrtD) && Number.isInteger(discriminant);
    const decimals = Math.abs(discriminant) > 1e-12;

    if (decimals) {
      const r1 = rDiv(rat(-b + sqrtD), rat(denominator));
      const r2 = rDiv(rat(-b - sqrtD), rat(denominator));
      const surd = simplifySurd(discriminant);
      const surdText = surd.coefficient === 1 ? `√${surd.radicand}` : `${surd.coefficient}√${surd.radicand}`;

      if (exact) {
        const ordered = [r1, r2].sort((first, second) => first.n / first.d - second.n / second.d);
        answer = `${variable} = ${rStr(ordered[0])}   or   ${variable} = ${rStr(ordered[1])}`;
      } else {
        answer = `${variable} = ${reducedSurdText(-b, discriminant, denominator)}`;
      }

      steps.push({
        title: T('Apply the quadratic formula', 'দ্বিঘাত সূত্র প্রয়োগ করো'),
        expr: `${variable} = (−b ± √D) / 2a = (${nice(-b)} ± ${surdText}) / ${nice(denominator)}`,
        detail: exact
          ? T('√D is a whole number, so both roots are rational.', '√D পূর্ণসংখ্যা, তাই দুটি বীজই মূলদ।')
          : T('√D is irrational, so the exact answer keeps the surd.', '√D অমূলদ, তাই সঠিক উত্তরে করণী থাকে।'),
      });

      if (exact) {
        const factorText = (root: typeof r1) => {
          const q = root.d;
          const p = root.n;
          const qPart = q === 1 ? variable : `${q}${variable}`;
          const pPart = p < 0 ? `+ ${Math.abs(p)}` : `− ${p}`;
          return `(${qPart} ${pPart})`;
        };
        const scale = a / (r1.d * r2.d);
        const prefix = Math.abs(scale - 1) < 1e-9 ? '' : nice(scale);
        answerNote = T(
          `Factorised: ${prefix}${factorText(r1)}${factorText(r2)} = 0`,
          `উৎপাদকে: ${prefix}${factorText(r1)}${factorText(r2)} = 0`,
        );
      } else {
        const lowRoot = Math.min(root1, root2);
        const highRoot = Math.max(root1, root2);
        answerNote = T(
          `≈ ${nice(lowRoot)} and ${nice(highRoot)}`,
          `≈ ${nice(lowRoot)} এবং ${nice(highRoot)}`,
        );
      }

      points.push(
        { x: root1, y: 0, label: `(${rootText(root1)}, 0)` },
        { x: root2, y: 0, label: `(${rootText(root2)}, 0)` },
      );
    } else {
      answer = `${variable} = ${nice(root1)} (double root)`;
      steps.push({
        title: T('Apply the quadratic formula', 'দ্বিঘাত সূত্র প্রয়োগ করো'),
        expr: `x = (−b ± √D) / 2a = ${nice(-b)} / ${nice(denominator)}`,
        detail: T('Since D = 0, the ± part vanishes.', 'যেহেতু D = 0, ± অংশটি বাদ যায়।'),
      });
      points.push({ x: root1, y: 0, label: `(${rootText(root1)}, 0)` });
    }
  } else {
    const real = rat(-b / denominator);
    const imag = rat(Math.sqrt(-discriminant) / denominator);
    const imagText = imag.n === 1 && imag.d === 1 ? 'i' : `${rStr(imag)}i`;
    answer = real.n === 0 ? `${variable} = ± ${imagText}` : `${variable} = ${rStr(real)} ± ${imagText}`;
    steps.push({
      title: T('Apply the quadratic formula', 'দ্বিঘাত সূত্র প্রয়োগ করো'),
      expr: `${variable} = (${nice(-b)} ± √${nice(discriminant)}) / ${nice(denominator)} = ${nice(-b / denominator)} ± ${nice(Math.sqrt(-discriminant) / denominator)}i`,
      detail: T('√(negative) becomes an imaginary number.', '√(ঋণাত্মক) কাল্পনিক সংখ্যা হয়।'),
    });
    answerNote = T(
      'The two roots are complex conjugates of each other.',
      'দুটি বীজ পরস্পরের জটিল অনুবন্ধী।',
    );
  }

  steps.push({
    title: T('Vertex of the parabola', 'পরাবৃত্তের শীর্ষবিন্দু'),
    expr: `V = (−b/2a, c − b²/4a) = (${rootText(vertex)}, ${rootText(c - (b * b) / (4 * a))})`,
    detail: T(
      'The axis of symmetry is x = −b/2a.',
      'প্রতিসাম্যের অক্ষটি x = −b/2a।',
    ),
  });

  const span = Math.max(3, Math.abs(vertex) + 2);
  return solved({
    kind: 'quadratic',
    topic: T('Quadratic equation', 'দ্বিঘাত সমীকরণ'),
    input: original,
    answer,
    answerNote,
    steps,
    tip: T(
      'Check the sign of D first — it tells you what kind of roots to expect before any calculation.',
      'প্রথমে D-এর চিহ্ন দেখো — হিসাবের আগেই বুঝে নেবে কেমন বীজ পাবে।',
    ),
    plot: {
      fn: (x) => a * x * x + b * x + c,
      xMin: vertex - span,
      xMax: vertex + span,
      points: [
        ...points,
        { x: vertex, y: c - (b * b) / (4 * a), label: 'vertex' },
      ],
    },
  });
}

/* ========================================================================== */
/*  3. Higher degree polynomial equations                                      */
/* ========================================================================== */

export function solvePolynomial(diff: Node, variable: string, original: string): SolveResult | null {
  let poly = toPoly(diff, variable);
  if (!poly || poly.length < 4) return null;

  const roots: number[] = [];
  const factorSteps: Step[] = [];
  let guard = 0;
  while (poly.length > 3 && guard++ < 4) {
    let found: number | null = null;
    for (let candidate = -24; candidate <= 24; candidate++) {
      if (candidate === 0) continue;
      if (Math.abs(polyEval(poly, candidate)) < 1e-9) {
        found = candidate;
        break;
      }
    }
    if (found === null) break;
    roots.push(found);
    factorSteps.push({
      title: T('Find a factor', 'একটি উৎপাদক খোঁজো'),
      expr: `${variable} = ${nice(found)} satisfies the equation, so (${variable} ${found < 0 ? '+' : '−'} ${Math.abs(found)}) is a factor`,
      detail: T('Using the factor theorem on integer candidates.', 'পূর্ণসংখ্যা প্রার্থীর উপর উৎপাদক উপপাদ্য প্রয়োগ।'),
    });
    poly = syntheticDivide(poly, found);
  }

  if (!roots.length) return null;

  let remaining = '';
  if (poly.length === 3) {
    const [c, b, a] = poly;
    const d = b * b - 4 * a * c;
    if (d >= 0) {
      const s = Math.sqrt(d);
      roots.push((-b + s) / (2 * a), (-b - s) / (2 * a));
      remaining = `${variable} = ${nice((-b + s) / (2 * a))}, ${nice((-b - s) / (2 * a))}`;
    } else {
      remaining = `two complex roots ${nice(-b / (2 * a))} ± ${nice(Math.sqrt(-d) / (2 * a))}i`;
    }
  } else if (poly.length === 2) {
    const root = -poly[0] / poly[1];
    roots.push(root);
    remaining = `${variable} = ${nice(root)}`;
  }

  const unique = [...new Set(roots.map((r) => Number(r.toFixed(6))))].sort((a, b) => a - b);
  return solved({
    kind: 'polynomial',
    topic: T('Polynomial equation', 'বহুপদী সমীকরণ'),
    input: original,
    answer: `${variable} = ${unique.map((r) => nice(r)).join(', ') || '—'}`,
    answerNote: remaining ? T(`Remaining factor gives ${remaining}.`, `অবশিষ্ট উৎপাদক থেকে ${remaining} পাওয়া যায়।`) : undefined,
    steps: [
      {
        title: T('Try the factor theorem', 'উৎপাদক উপপাদ্য প্রয়োগ করো'),
        detail: T(
          'Test small integer values until one makes the polynomial zero.',
          'ছোট পূর্ণসংখ্যা বসিয়ে দেখো কখন বহুপদীটি শূন্য হয়।',
        ),
      },
      ...factorSteps,
      {
        title: T('Solve the remaining factor', 'অবশিষ্ট উৎপাদক সমাধান করো'),
        expr: polyToString(poly, variable) + ' = 0',
        detail: remaining
          ? T(`The leftover factor gives ${remaining}.`, `অবশিষ্ট উৎপাদক থেকে ${remaining} পাওয়া যায়।`)
          : T('The leftover factor is linear or quadratic — solve it directly.', 'অবশিষ্ট উৎপাদক রৈখিক বা দ্বিঘাত — সরাসরি সমাধান করো।'),
      },
    ],
    tip: T(
      'A polynomial of degree n has exactly n roots once complex roots are counted.',
      'জটিল বীজসহ n ঘাতের বহুপদীর ঠিক n-টি বীজ থাকে।',
    ),
  });
}

/* ========================================================================== */
/*  4. Systems of linear equations                                             */
/* ========================================================================== */

type LinearMap = Record<string, number>;

function toLinear(node: Node): LinearMap | null {
  switch (node.t) {
    case 'num':
      return { '': node.v };
    case 'var':
      if (node.name === 'pi' || node.name === 'e') return { '': evaluateNode(node) ?? Number.NaN };
      return { '': 0, [node.name]: 1 };
    case 'neg': {
      const inner = toLinear(node.a);
      if (!inner) return null;
      return Object.fromEntries(Object.entries(inner).map(([k, v]) => [k, -v]));
    }
    case 'add':
    case 'sub': {
      const a = toLinear(node.a);
      const b = toLinear(node.b);
      if (!a || !b) return null;
      const sign = node.t === 'add' ? 1 : -1;
      const out: LinearMap = { ...a };
      for (const [key, value] of Object.entries(b)) out[key] = (out[key] ?? 0) + sign * value;
      return out;
    }
    case 'mul': {
      const a = toLinear(node.a);
      const b = toLinear(node.b);
      if (!a || !b) return null;
      const aConst = Object.keys(a).every((k) => k === '');
      const bConst = Object.keys(b).every((k) => k === '');
      if (aConst) return Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v * (a[''] ?? 0)]));
      if (bConst) return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v * (b[''] ?? 0)]));
      return null;
    }
    case 'div': {
      const a = toLinear(node.a);
      const b = toLinear(node.b);
      if (!a || !b) return null;
      if (!Object.keys(b).every((k) => k === '')) return null;
      const divisor = b[''] ?? 0;
      if (divisor === 0) return null;
      return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v / divisor]));
    }
    case 'pow': {
      const a = toLinear(node.a);
      const exponent = evaluateNode(node.b);
      if (!a || exponent === null || !Number.isInteger(exponent)) return null;
      if (exponent === 0) return { '': 1 };
      if (exponent === 1) return a;
      return null;
    }
    default:
      return null;
  }
}

export function solveSystem(text: string, original: string): SolveResult | null {
  const equations = text
    .split(/[;,]/)
    .map((piece) => piece.trim())
    .filter((piece) => piece.includes('='));
  if (equations.length !== 2) return null;

  const maps: LinearMap[] = [];
  for (const equation of equations) {
    const parts = equation.split('=');
    if (parts.length !== 2) return null;
    const left = tryParse(parts[0]);
    const right = tryParse(parts[1]);
    if (!left || !right) return null;
    const map = toLinear(subNode(left, right));
    if (!map) return null;
    maps.push(map);
  }

  const variables = [...new Set([...Object.keys(maps[0]), ...Object.keys(maps[1])])].filter((key) => key !== '');
  if (variables.length !== 2) return null;
  const [v1, v2] = variables;

  const a1 = maps[0][v1] ?? 0;
  const b1 = maps[0][v2] ?? 0;
  const c1 = maps[0][''] ?? 0;
  const a2 = maps[1][v1] ?? 0;
  const b2 = maps[1][v2] ?? 0;
  const c2 = maps[1][''] ?? 0;

  const determinant = a1 * b2 - a2 * b1;
  if (Math.abs(determinant) < 1e-12) {
    return failed(
      T('The system has no unique solution.', 'এই সমীকরণজোটের অনন্য সমাধান নেই।'),
      T(
        'The two lines are parallel or identical. Check the coefficients.',
        'দুটি রেখা সমান্তরাল বা একই — সহগগুলো দেখো।',
      ),
    );
  }

  const x = (b1 * c2 - b2 * c1) / determinant;
  const y = (c1 * a2 - c2 * a1) / determinant;

  const eq = (a: number, b: number, c: number) => {
    const term = (coefficient: number, name: string, first: boolean) => {
      if (Math.abs(coefficient) < 1e-12) return '';
      const sign = coefficient < 0 ? (first ? '−' : ' − ') : first ? '' : ' + ';
      const abs = Math.abs(coefficient);
      const body = name ? `${abs === 1 ? '' : nice(abs)}${name}` : nice(abs);
      return `${sign}${body}`;
    };
    const left = `${term(a, v1, true)}${term(b, v2, false)}`;
    return `${left || '0'} = ${nice(-c)}`;
  };

  return solved({
    kind: 'system',
    topic: T('System of linear equations', 'রৈখিক সমীকরণজোট'),
    input: original,
    answer: `${v1} = ${nice(x)},   ${v2} = ${nice(y)}`,
    steps: [
      {
        title: T('Write both equations', 'উভয় সমীকরণ লেখো'),
        detail: T('Line the variables up in the same order.', 'চলকগুলো একই ক্রমে সাজাও।'),
        expr: `${eq(a1, b1, c1)}   ;   ${eq(a2, b2, c2)}`,
      },
      {
        title: T('Eliminate one variable', 'একটি চলক অপসারণ করো'),
        detail: T(
          `Multiply the equations so the coefficients of ${v2} match, then subtract.`,
          `সমীকরণ দুটিকে এমনভাবে গুণ করো যাতে ${v2}-এর সহগ সমান হয়, তারপর বিয়োগ করো।`,
        ),
        expr: `${nice(determinant)}·${v1} = ${nice(b1 * c2 - b2 * c1)}`,
      },
      {
        title: T(`Solve for ${v1}`, `${v1}-এর মান নির্ণয় করো`),
        expr: `${v1} = ${nice(b1 * c2 - b2 * c1)} / ${nice(determinant)} = ${nice(x)}`,
      },
      {
        title: T(`Substitute back to find ${v2}`, `পুনরায় বসিয়ে ${v2} নির্ণয় করো`),
        expr: `${nice(a1)}(${nice(x)}) + ${nice(b1)}${v2} = ${nice(-c1)}  →  ${v2} = ${nice(y)}`,
        detail: T('Use the first equation and substitute the value you found.', 'প্রথম সমীকরণে পাওয়া মানটি বসাও।'),
      },
      {
        title: T('Check in the second equation', 'দ্বিতীয় সমীকরণে যাচাই করো'),
        expr: `${nice(a2)}(${nice(x)}) + ${nice(b2)}(${nice(y)}) = ${nice(a2 * x + b2 * y)}  (= ${nice(-c2)})`,
      },
    ],
    tip: T(
      'Cramer’s rule: x = Δx/Δ and y = Δy/Δ, where Δ is the determinant of the coefficient matrix.',
      'ক্র্যামারের নিয়ম: x = Δx/Δ এবং y = Δy/Δ, যেখানে Δ হলো সহগ ম্যাট্রিক্সের নির্ণায়ক।',
    ),
    plot: {
      fn: (t) => (Math.abs(b1) < 1e-12 ? Number.NaN : (-c1 - a1 * t) / b1),
      fn2: (t) => (Math.abs(b2) < 1e-12 ? Number.NaN : (-c2 - a2 * t) / b2),
      label: T('first line', 'প্রথম রেখা'),
      label2: T('second line', 'দ্বিতীয় রেখা'),
      xMin: x - 5,
      xMax: x + 5,
      points: [{ x, y, label: `(${nice(x)}, ${nice(y)})` }],
    },
  });
}

/* ========================================================================== */
/*  5. Simplify / expand expressions                                           */
/* ========================================================================== */

export function solveSimplify(text: string, original: string): SolveResult | null {
  const node = tryParse(text);
  if (!node) return null;
  const vars = [...collectVars(node)];

  if (vars.length === 0) return null;

  const variable = vars.includes('x') ? 'x' : vars[0];

  if (vars.length > 1) {
    const expanded = expandSpecial(node);
    if (expanded) return expanded;
    return null;
  }

  const poly = toPoly(node, variable);
  if (!poly) {
    return solved({
      kind: 'simplify',
      topic: T('Expression', 'রাশি'),
      input: original,
      answer: stringify(simplify(node)),
      steps: [
        {
          title: T('Simplify the expression', 'রাশিটি সরল করো'),
          expr: stringify(simplify(node)),
          detail: T('There is no further algebraic simplification available.', 'এর বেশি বীজগাণিতিক সরলীকরণ সম্ভব নয়।'),
        },
      ],
    });
  }

  const simplified = polyToString(poly, variable);
  const steps: Step[] = [
    {
      title: T('Expand and collect like terms', 'বিস্তার করে সহগুণিত পদ একত্র করো'),
      expr: simplified,
      detail: T('Multiply out the brackets and add terms with the same power.', 'বন্ধনী গুণ করো এবং একই ঘাতের পদ যোগ করো।'),
    },
  ];

  let answerNote: Bi | undefined;
  if (poly.length === 3) {
    const [c, b, a] = poly;
    const d = b * b - 4 * a * c;
    if (d > 0 && Number.isInteger(Math.sqrt(d))) {
      const s = Math.sqrt(d);
      const r1 = (-b + s) / (2 * a);
      const r2 = (-b - s) / (2 * a);
      if (Number.isInteger(r1) && Number.isInteger(r2)) {
        const factor = (root: number) => `(${variable} ${root < 0 ? '+' : '−'} ${Math.abs(root)})`;
        answerNote = T(
          `Factorised: ${a === 1 ? '' : nice(a)}${factor(r1)}${factor(r2)}`,
          `উৎপাদকে: ${a === 1 ? '' : nice(a)}${factor(r1)}${factor(r2)}`,
        );
        steps.push({
          title: T('Factorise', 'উৎপাদকে বিশ্লেষণ করো'),
          expr: `${a === 1 ? '' : nice(a)}${factor(r1)}${factor(r2)}`,
          detail: T('Both roots are integers, so the quadratic factorises neatly.', 'দুটি বীজই পূর্ণসংখ্যা, তাই দ্বিঘাতটি সহজে উৎপাদকে ভাঙা যায়।'),
        });
      }
    }
  }

  return solved({
    kind: 'simplify',
    topic: T('Algebraic expression', 'বীজগাণিতিক রাশি'),
    input: original,
    answer: simplified,
    answerNote,
    steps,
    tip: T(
      'Only like terms can be combined — x² and x are different animals.',
      'শুধু সহগুণিত পদ একত্র করা যায় — x² আর x আলাদা।',
    ),
  });
}

/** Expand (a ± b)^n and (a ± b)(c ± d) style identities. */
function expandSpecial(node: Node): SolveResult | null {
  if (node.t !== 'pow') {
    if (node.t === 'mul') {
      const left = node.a;
      const right = node.b;
      const isBin = (n: Node) => n.t === 'add' || n.t === 'sub';
      if (isBin(left) && isBin(right) && left.t !== right.t) {
        const l = left as Extract<Node, { t: 'add' | 'sub' }>;
        const r = right as Extract<Node, { t: 'add' | 'sub' }>;
        const same = (x: Node, y: Node) => stringify(x) === stringify(y);
        if (same(l.a, r.a) && same(l.b, r.b)) {
          const answer = `${stringify(l.a)}² − ${stringify(l.b)}²`;
          return solved({
            kind: 'expand',
            topic: T('Expansion', 'বিস্তার'),
            input: stringify(node),
            answer,
            steps: [
              {
                title: T('Recognise the difference of squares', 'বর্গের বিয়োগফল চেনো'),
                expr: `(${stringify(l.a)} + ${stringify(l.b)})(${stringify(l.a)} − ${stringify(l.b)}) = ${answer}`,
                detail: T('The middle terms cancel out.', 'মাঝের পদগুলো কেটে যায়।'),
              },
              {
                title: T('Check by expanding', 'বিস্তার করে যাচাই করো'),
                expr: `${stringify(l.a)}² + ${stringify(l.a)}${stringify(l.b)} − ${stringify(l.a)}${stringify(l.b)} − ${stringify(l.b)}²`,
              },
            ],
            tip: T('(a + b)(a − b) = a² − b²', '(a + b)(a − b) = a² − b²'),
          });
        }
      }
    }
    return null;
  }

  const base = node.a;
  const exponent = node.b;
  if (exponent.t !== 'num' || !Number.isInteger(exponent.v) || exponent.v < 2 || exponent.v > 4) return null;
  if (base.t !== 'add' && base.t !== 'sub') return null;

  const first = base.a;
  const second = base.b;
  if (first.t !== 'var' || second.t !== 'var') return null;

  const n = exponent.v;
  const a = first.name;
  const b = second.name;
  const sign = base.t === 'add' ? 1 : -1;

  const binomial = (k: number) => {
    let out = 1;
    for (let i = 1; i <= k; i++) out = (out * (n - i + 1)) / i;
    return Math.round(out);
  };

  const pieces: string[] = [];
  for (let k = 0; k <= n; k++) {
    const coefficient = binomial(k) * Math.pow(sign, k);
    const powerA = n - k;
    const powerB = k;
    const abs = Math.abs(coefficient);
    const aPart = powerA === 0 ? '' : powerA === 1 ? a : `${a}${sup(powerA)}`;
    const bPart = powerB === 0 ? '' : powerB === 1 ? b : `${b}${sup(powerB)}`;
    const body = `${abs === 1 ? '' : abs}${aPart}${bPart}`;
    pieces.push(pieces.length === 0 ? (coefficient < 0 ? `−${body}` : body) : `${coefficient < 0 ? '−' : '+'} ${body}`);
  }
  const expanded = pieces.join(' ');

  return solved({
    kind: 'expand',
    topic: T('Binomial expansion', 'দ্বিপদী বিস্তার'),
    input: `(${a} ${sign > 0 ? '+' : '−'} ${b})${sup(n)}`,
    answer: expanded,
    steps: [
      {
        title: T('Apply the binomial theorem', 'দ্বিপদী উপপাদ্য প্রয়োগ করো'),
        expr: `(${a} ${sign > 0 ? '+' : '−'} ${b})${sup(n)} = Σ ${n}Cₖ · ${a}${sup(n)}⁻ᵏ · (±${b})ᵏ`,
        detail: T('Each term uses a binomial coefficient.', 'প্রতিটি পদে একটি দ্বিপদী সহগ থাকে।'),
      },
      {
        title: T('Write every term', 'প্রতিটি পদ লেখো'),
        expr: expanded,
      },
      {
        title: T('Check with a = b = 1', 'a = b = 1 বসিয়ে যাচাই করো'),
        expr: `${sign > 0 ? '2' : '0'}${sup(n)} = ${Math.pow(sign > 0 ? 2 : 0, n)}`,
        detail: T('The coefficients should add up to this value.', 'সহগগুলোর যোগফল এই মান হবে।'),
      },
    ],
    tip: T('Pascal’s triangle gives the coefficients for small powers.', 'ছোট ঘাতের সহগ পাস্কেলের ত্রিভুজ থেকে পাওয়া যায়।'),
  });
}

/* ========================================================================== */
/*  6. Plain evaluation                                                        */
/* ========================================================================== */

interface Trace {
  text: string;
  value: number | null;
  steps: Step[];
}

function traceEval(node: Node): Trace {
  const step = (expr: string): Step => ({
    title: T('Work through the operations', 'ক্রম অনুযায়ী হিসাব করো'),
    expr,
  });

  switch (node.t) {
    case 'num':
      return { text: num(node.v), value: node.v, steps: [] };
    case 'var':
      return { text: node.name, value: evaluateNode(node), steps: [] };
    case 'neg': {
      const inner = traceEval(node.a);
      const value = inner.value === null ? null : -inner.value;
      const text = `−${inner.text}`;
      return {
        text: value === null ? text : num(value),
        value,
        steps: value === null ? inner.steps : [...inner.steps, step(`${text} = ${num(value)}`)],
      };
    }
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
    case 'pow': {
      const a = traceEval(node.a);
      const b = traceEval(node.b);
      const symbol = node.t === 'add' ? '+' : node.t === 'sub' ? '−' : node.t === 'mul' ? '×' : node.t === 'div' ? '÷' : '^';
      const text = `${a.text} ${symbol} ${b.text}`;
      let value: number | null = null;
      if (a.value !== null && b.value !== null) {
        const left = a.value;
        const right = b.value;
        if (node.t === 'add') value = left + right;
        if (node.t === 'sub') value = left - right;
        if (node.t === 'mul') value = left * right;
        if (node.t === 'div') value = right === 0 ? null : left / right;
        if (node.t === 'pow') value = Math.pow(left, right);
      }
      const steps = [...a.steps, ...b.steps];
      if (value !== null) steps.push(step(`${text} = ${num(value)}`));
      return { text: value === null ? text : num(value), value, steps };
    }
    case 'fn': {
      const inner = traceEval(node.arg);
      const text = `${node.name}(${inner.text})`;
      const value = evaluateNode(node);
      const steps = [...inner.steps];
      if (value !== null) steps.push(step(`${text} = ${num(value)}`));
      return { text: value === null ? text : num(value), value, steps };
    }
    case 'fact': {
      const inner = traceEval(node.a);
      const text = `${inner.text}!`;
      const value = evaluateNode(node);
      const steps = [...inner.steps];
      if (value !== null) steps.push(step(`${text} = ${num(value)}`));
      return { text: value === null ? text : num(value), value, steps };
    }
    case 'pct': {
      const inner = traceEval(node.a);
      const text = `${inner.text}%`;
      const value = evaluateNode(node);
      const steps = [...inner.steps];
      if (value !== null) steps.push(step(`${text} = ${num(value)}`));
      return { text: value === null ? text : num(value), value, steps };
    }
    default:
      return { text: '', value: null, steps: [] };
  }
}

export function solveEvaluate(text: string, original: string): SolveResult | null {
  const node = tryParse(text);
  if (!node) return null;
  if (collectVars(node).size > 0) return null;

  const exact = evaluateExact(node);
  if (!exact) return null;
  const value = evaluateNode(node);
  if (value === null) return null;

  const trace = traceEval(node);
  const steps = trace.steps.slice(0, 14);
  if (!steps.length) {
    steps.push({
      title: T('Evaluate', 'মান নির্ণয়'),
      expr: `${stringify(node)} = ${rStr(exact)}`,
    });
  }

  const answer = rStr(exact, { decimal: exact.d !== 1 }) as string;

  return solved({
    kind: 'evaluate',
    topic: T('Arithmetic', 'পাটিগণিত'),
    input: original,
    answer,
    steps,
    tip: T(
      'BODMAS: Brackets, Orders, Division/Multiplication, Addition/Subtraction.',
      'বন্ধনী → ঘাত → ভাগ/গুণ → যোগ/বিয়োগ এই ক্রমে হিসাব করো।',
    ),
  });
}

/* ========================================================================== */
/*  7. Statistics                                                              */
/* ========================================================================== */

const STAT_PATTERNS: { key: string; re: RegExp }[] = [
  { key: 'sd', re: /^(standard\s+deviation|std\.?\s*dev\.?|sd)\b/i },
  { key: 'variance', re: /^(variance|var)\b/i },
  { key: 'median', re: /^median\b/i },
  { key: 'mode', re: /^mode\b/i },
  { key: 'range', re: /^range\b/i },
  { key: 'mean', re: /^(mean|average|arithmetic\s+mean)\b/i },
];

export function solveStatistics(text: string, original: string): SolveResult | null {
  let key: string | null = null;
  let rest = '';
  for (const pattern of STAT_PATTERNS) {
    const match = text.match(pattern.re);
    if (match) {
      key = pattern.key;
      rest = text.slice(match[0].length);
      break;
    }
  }
  if (!key) return null;

  const numbers = (rest.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite);
  if (numbers.length < 2) return null;

  const n = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const sorted = [...numbers].sort((a, b) => a - b);
  const median =
    n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = new Map<number, number>();
  numbers.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const maxCount = Math.max(...counts.values());
  const modes = [...counts.entries()].filter(([, c]) => c === maxCount).map(([value]) => value);
  const variance = numbers.reduce((acc, value) => acc + (value - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);
  const range = sorted[n - 1] - sorted[0];

  const list = numbers.map((value) => nice(value)).join(', ');
  const steps: Step[] = [
    {
      title: T('Order the data', 'তথ্যগুলো সাজাও'),
      expr: sorted.map((value) => nice(value)).join(' ≤ '),
      detail: T(`${n} values in the data set.`, `তথ্যসেটে ${n}টি মান আছে।`),
    },
    {
      title: T('Add the values', 'মানগুলো যোগ করো'),
      expr: `${list.split(', ').join(' + ')} = ${nice(sum)}`,
    },
  ];

  let answer = '';
  let detail: Bi = T('', '');

  switch (key) {
    case 'mean':
      answer = `x̄ = ${nice(mean)}`;
      steps.push({
        title: T('Divide by the number of values', 'মানের সংখ্যা দিয়ে ভাগ করো'),
        expr: `x̄ = ${nice(sum)} / ${n} = ${nice(mean)}`,
      });
      detail = T('The mean balances all the values.', 'গড় সব মানকে ভারসাম্যে রাখে।');
      break;
    case 'median':
      answer = `median = ${nice(median)}`;
      steps.push({
        title: T('Take the middle value', 'মাঝের মানটি নাও'),
        expr:
          n % 2 === 1
            ? `position (n + 1)/2 = ${(n + 1) / 2} → ${nice(median)}`
            : `average of positions ${n / 2} and ${n / 2 + 1} → ${nice(median)}`,
      });
      detail = T('The median splits the data in half.', 'মধ্যমান তথ্যকে দুই ভাগে ভাগ করে।');
      break;
    case 'mode':
      answer = modes.length === n ? 'No mode (all values occur once)' : `mode = ${modes.map(nice).join(', ')}`;
      steps.push({
        title: T('Count how often each value occurs', 'প্রতিটি মান কতবার আছে গোনো'),
        expr: [...counts.entries()].map(([value, count]) => `${nice(value)}×${count}`).join(', '),
      });
      detail = T('The mode is the most frequent value.', 'সর্বাধিক বার থাকা মানই বহুলক।');
      break;
    case 'variance':
    case 'sd':
      answer = key === 'variance' ? `σ² = ${nice(variance)}` : `σ = ${nice(sd)}`;
      steps.push({
        title: T('Find the deviations from the mean', 'গড় থেকে বিচ্যুতি নির্ণয় করো'),
        expr: `x̄ = ${nice(mean)}; Σ(x − x̄)² = ${nice(variance * n)}`,
      });
      steps.push({
        title: T('Average the squared deviations', 'বর্গ বিচ্যুতির গড় নাও'),
        expr: key === 'variance' ? `σ² = ${nice(variance)}` : `σ² = ${nice(variance)} → σ = √${nice(variance)} = ${nice(sd)}`,
      });
      detail = T('Standard deviation measures spread around the mean.', 'প্রমাণ বিচ্যুতি গড়ের চারপাশে ছড়িয়ে থাকার মাপ।');
      break;
    case 'range':
      answer = `range = ${nice(range)}`;
      steps.push({
        title: T('Subtract the smallest from the largest', 'বৃহত্তম থেকে ক্ষুদ্রতম বিয়োগ করো'),
        expr: `${nice(sorted[n - 1])} − ${nice(sorted[0])} = ${nice(range)}`,
      });
      detail = T('Range is the simplest measure of spread.', 'পরিসর হলো ছড়ানোর সবচেয়ে সহজ মাপ।');
      break;
    default:
      return null;
  }

  return solved({
    kind: 'statistics',
    topic: T('Statistics', 'পরিসংখ্যান'),
    input: original,
    answer,
    answerNote: detail,
    steps,
    tip: T('Always sort the data first — median and mode both depend on it.', 'প্রথমে তথ্য সাজাও — মধ্যমান ও বহুলক দুটিই এর উপর নির্ভর করে।'),
  });
}

/* ========================================================================== */
/*  8. Sequences (AP / GP)                                                     */
/* ========================================================================== */

export function solveSequence(text: string, original: string): SolveResult | null {
  const isSequence = /\b(ap|gp|a\.p\.|g\.p\.|progression|sequence|series)\b/i.test(text);
  if (!isSequence) return null;

  const numbers = (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite);
  if (numbers.length < 3) return null;

  const termMatch = text.match(/(\d+)\s*(?:st|nd|rd|th)\s+term/i) ?? text.match(/n\s*=\s*(\d+)/i);
  const countMatch = text.match(/(?:first\s+)?(\d+)\s+terms?\b/i);
  const sumMatch = /\bsum\b|\btotal\b/i.test(text);

  let requested = termMatch ? Number(termMatch[1]) : NaN;
  if (!Number.isFinite(requested) && sumMatch && countMatch) {
    requested = Number(countMatch[1]);
    const position = numbers.indexOf(requested);
    if (position >= 0) numbers.splice(position, 1);
  }

  let series = [...numbers];
  if (Number.isFinite(requested) && series[series.length - 1] === requested && series.length > 3) {
    series = series.slice(0, -1);
  }
  if (series.length < 3) return null;

  const isGP = /\b(gp|g\.p\.|geometric)\b/i.test(text);
  const d = series[1] - series[0];
  const r = series[0] === 0 ? Number.NaN : series[1] / series[0];
  const looksAP = series.every((value, index) => index === 0 || Math.abs(value - series[index - 1] - d) < 1e-9);
  const looksGP = series.every(
    (value, index) => index === 0 || Math.abs(value - series[index - 1] * r) < 1e-9,
  );
  const geometric = isGP || (!looksAP && looksGP);
  if (geometric && (!Number.isFinite(r) || r === 0)) return null;
  if (!geometric && !looksAP) return null;

  const first = series[0];
  const n = Number.isFinite(requested) && requested > 0 ? requested : series.length + 1;
  const nth = geometric ? first * Math.pow(r, n - 1) : first + (n - 1) * d;
  const sum = geometric
    ? Math.abs(r - 1) < 1e-12
      ? first * n
      : (first * (1 - Math.pow(r, n))) / (1 - r)
    : (n / 2) * (2 * first + (n - 1) * d);

  const steps: Step[] = geometric
    ? [
        {
          title: T('Find the common ratio', 'সাধারণ অনুপাত নির্ণয় করো'),
          expr: `r = ${nice(series[1])} / ${nice(series[0])} = ${nice(r)}`,
          detail: T('Every term is the previous term multiplied by r.', 'প্রতিটি পদ আগের পদকে r দিয়ে গুণ করলে পাওয়া যায়।'),
        },
        {
          title: T('Use the n-th term formula', 'n-তম পদের সূত্র ব্যবহার করো'),
          expr: `aₙ = a rⁿ⁻¹ = ${nice(first)} · ${nice(r)}^${n - 1} = ${nice(nth)}`,
        },
      ]
    : [
        {
          title: T('Find the common difference', 'সাধারণ অন্তর নির্ণয় করো'),
          expr: `d = ${nice(series[1])} − ${nice(series[0])} = ${nice(d)}`,
          detail: T('Subtract any term from the one after it.', 'যেকোনো পদকে তার পরের পদ থেকে বিয়োগ করো।'),
        },
        {
          title: T('Use the n-th term formula', 'n-তম পদের সূত্র ব্যবহার করো'),
          expr: `aₙ = a + (n − 1)d = ${nice(first)} + ${n - 1}(${nice(d)}) = ${nice(nth)}`,
        },
      ];

  if (sumMatch) {
    steps.push({
      title: T('Add the first n terms', 'প্রথম n পদের যোগফল'),
      expr: geometric
        ? `Sₙ = a(1 − rⁿ)/(1 − r) = ${nice(sum)}`
        : `Sₙ = n/2 [2a + (n − 1)d] = ${nice(sum)}`,
    });
  }

  return solved({
    kind: 'sequence',
    topic: geometric ? T('Geometric progression', 'গুণোত্তর প্রগতি') : T('Arithmetic progression', 'সমান্তর প্রগতি'),
    input: original,
    answer: `aₙ = ${nice(nth)}${sumMatch ? `,   S${subscript(n)} = ${nice(sum)}` : ''}`,
    answerNote: T(
      `${n === series.length + 1 ? 'Next term' : `Term ${n}`} of the ${geometric ? 'GP' : 'AP'} with first term ${nice(first)}.`,
      `${nice(first)} প্রথম পদবিশিষ্ট ${geometric ? 'গুণোত্তর' : 'সমান্তর'} প্রগতির ${n === series.length + 1 ? 'পরবর্তী পদ' : `${n}-তম পদ`}।`,
    ),
    steps,
    tip: geometric
      ? T('In a GP the ratio between consecutive terms is constant.', 'গুণোত্তর প্রগতিতে পরপর পদের অনুপাত স্থির থাকে।')
      : T('In an AP the difference between consecutive terms is constant.', 'সমান্তর প্রগতিতে পরপর পদের অন্তর স্থির থাকে।'),
  });
}

function subscript(value: number): string {
  const map: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return String(value)
    .split('')
    .map((character) => map[character] ?? character)
    .join('');
}

/* Utility used by other handler files. */
export { T, toLinear };
export type { LinearMap };
