/** Exact rational arithmetic — keeps school answers like 1/3 or 5/6 exact. */
export interface Rat {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

export function rat(n: number, d = 1): Rat {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
    return { n: Number.NaN, d: 1 };
  }
  if (d < 0) {
    n = -n;
    d = -d;
  }
  // Collapse floating point noise before reducing.
  if (!Number.isInteger(n)) {
    const scaled = Math.round(n * 1e9);
    if (Math.abs(n * 1e9 - scaled) < 1e-3) {
      n = scaled;
      d = d * 1e9;
    }
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export const rAdd = (a: Rat, b: Rat): Rat => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const rSub = (a: Rat, b: Rat): Rat => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const rMul = (a: Rat, b: Rat): Rat => rat(a.n * b.n, a.d * b.d);
export const rDiv = (a: Rat, b: Rat): Rat => rat(a.n * b.d, a.d * b.n);
export const rNeg = (a: Rat): Rat => ({ n: -a.n, d: a.d });
export const rVal = (a: Rat): number => a.n / a.d;
export const rIsZero = (a: Rat): boolean => a.n === 0;
export const rIsInt = (a: Rat): boolean => a.d === 1 && Number.isInteger(a.n);

export function rPow(a: Rat, p: number): Rat {
  if (Number.isInteger(p)) {
    if (p >= 0) {
      let out: Rat = { n: 1, d: 1 };
      for (let i = 0; i < p; i++) out = rMul(out, a);
      return out;
    }
    return rDiv({ n: 1, d: 1 }, rPow(a, -p));
  }
  const value = Math.pow(rVal(a), p);
  return rat(value);
}

/** Plain number formatting with a typographic minus sign. */
export function num(value: number, digits = 6): string {
  if (Number.isNaN(value)) return 'undefined';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '−∞';
  const rounded = Number(value.toFixed(digits));
  let out = String(rounded);
  if (out.includes('e')) out = rounded.toFixed(digits);
  out = out.replace('-', '−');
  return out;
}

/** Format a rational exactly when the denominator is small. */
export function rStr(a: Rat, opts: { decimal?: boolean } = {}): string {
  if (Number.isNaN(a.n)) return 'undefined';
  if (a.d === 1) {
    if (Number.isInteger(a.n)) return a.n === 0 ? '0' : num(a.n);
    return num(a.n, 8);
  }
  const exact = `${a.n < 0 ? '−' : ''}${Math.abs(a.n)}/${a.d}`;
  if (opts.decimal) return `${exact} ≈ ${num(rVal(a), 6)}`;
  if (a.d <= 999999 && Math.abs(a.n) <= 1e9) return exact;
  return num(rVal(a), 6);
}

/** Nice display of a coefficient in front of a variable / power of x. */
export function coeffStr(c: number, variable = 'x', power = 0): string {
  const sign = c < 0 ? '−' : '';
  const abs = Math.abs(c);
  const rounded = Number(abs.toFixed(8));
  if (power === 0) return `${sign}${num(rounded)}`;
  const body = power === 1 ? variable : `${variable}${sup(power)}`;
  if (rounded === 1) return `${sign}${body}`;
  if (rounded === 0) return '0';
  return `${sign}${num(rounded)}${body}`;
}

const SUPER: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

export function sup(power: number): string {
  if (!Number.isInteger(power)) return `^${power}`;
  return String(power)
    .split('')
    .map((ch) => SUPER[ch] ?? ch)
    .join('');
}

/** Best rational approximation with a small denominator (continued fractions). */
export function rationalize(value: number, maxDenominator = 10000): Rat | null {
  if (!Number.isFinite(value)) return null;
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  let previousNumerator = 0;
  let numerator = 1;
  let previousDenominator = 1;
  let denominator = 0;
  let remainder = x;

  for (let i = 0; i < 32; i++) {
    const a = Math.floor(remainder);
    const nextNumerator = a * numerator + previousNumerator;
    const nextDenominator = a * denominator + previousDenominator;
    if (nextDenominator > maxDenominator) break;
    if (Math.abs(x - nextNumerator / nextDenominator) < 1e-10) {
      return rat(sign * nextNumerator, nextDenominator);
    }
    previousNumerator = numerator;
    numerator = nextNumerator;
    previousDenominator = denominator;
    denominator = nextDenominator;
    const fraction = remainder - a;
    if (fraction < 1e-12) break;
    remainder = 1 / fraction;
  }
  return null;
}

/** Format coefficients (used for matrix entries etc.). */
export function nice(value: number): string {
  if (Number.isInteger(value)) return num(value);
  const rounded = rat(value);
  if (rounded.d <= 1000) return rStr(rounded);
  const approx = rationalize(value);
  return approx ? rStr(approx) : num(value, 6);
}
