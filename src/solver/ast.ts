import { num, rat, rAdd, rDiv, rMul, rNeg, rPow, rStr, rSub, rVal, sup, type Rat } from './rational';

/* ========================================================================== */
/*  AST                                                                        */
/* ========================================================================== */

export type Node =
  | { t: 'num'; v: number }
  | { t: 'var'; name: string }
  | { t: 'add'; a: Node; b: Node }
  | { t: 'sub'; a: Node; b: Node }
  | { t: 'mul'; a: Node; b: Node }
  | { t: 'div'; a: Node; b: Node }
  | { t: 'pow'; a: Node; b: Node }
  | { t: 'neg'; a: Node }
  | { t: 'fn'; name: string; arg: Node }
  | { t: 'fact'; a: Node }
  | { t: 'pct'; a: Node };

export const numNode = (v: number): Node => ({ t: 'num', v });
export const varNode = (name: string): Node => ({ t: 'var', name });
export const addNode = (a: Node, b: Node): Node => ({ t: 'add', a, b });
export const subNode = (a: Node, b: Node): Node => ({ t: 'sub', a, b });
export const mulNode = (a: Node, b: Node): Node => ({ t: 'mul', a, b });
export const divNode = (a: Node, b: Node): Node => ({ t: 'div', a, b });
export const powNode = (a: Node, b: Node): Node => ({ t: 'pow', a, b });
export const negNode = (a: Node): Node => ({ t: 'neg', a });
export const fnNode = (name: string, arg: Node): Node => ({ t: 'fn', name, arg });

export const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'cot',
  'sec',
  'csc',
  'log',
  'ln',
  'sqrt',
  'cbrt',
  'exp',
  'abs',
  'asin',
  'acos',
  'atan',
  'arcsin',
  'arccos',
  'arctan',
]);

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

/* ========================================================================== */
/*  Input normalisation                                                        */
/* ========================================================================== */

const SUPERSCRIPT: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  'ⁿ': 'n',
  '⁻': '-',
  '⁺': '+',
};

export function normalizeInput(raw: string): string {
  let s = raw.replace(/\u00a0/g, ' ');
  // superscript runs -> ^digits
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁻⁺]+/g, (run) => {
    const mapped = run
      .split('')
      .map((ch) => SUPERSCRIPT[ch] ?? ch)
      .join('');
    return `^${mapped}`;
  });
  return s
    .replace(/[×·⋅∙]/g, '*')
    .replace(/[÷∕]/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/[πΠ]/g, 'pi')
    .replace(/θ/g, 'theta')
    .replace(/[√]/g, 'sqrt')
    .replace(/\*\*/g, '^')
    .replace(/½/g, '(1/2)')
    .replace(/¼/g, '(1/4)')
    .replace(/¾/g, '(3/4)')
    .replace(/⅓/g, '(1/3)')
    .replace(/⅔/g, '(2/3)')
    .replace(/[，、]/g, ',')
    .trim();
}

/* ========================================================================== */
/*  Tokenizer + parser                                                         */
/* ========================================================================== */

type Token =
  | { k: 'num'; v: number }
  | { k: 'id'; v: string }
  | { k: 'op'; v: string }
  | { k: 'lp' }
  | { k: 'rp' }
  | { k: 'bar' };

class ParseError extends Error {}

function tokenize(input: string): Token[] {
  const src = input.toLowerCase();
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      // scientific notation: 1e10, 2.5e-3 (but not 2e^x, where e is Euler's number)
      if (src[j] === 'e') {
        let k = j + 1;
        if (src[k] === '+' || src[k] === '-') k++;
        if (/[0-9]/.test(src[k] ?? '')) {
          while (k < src.length && /[0-9]/.test(src[k])) k++;
          j = k;
        }
      }
      const text = src.slice(i, j);
      const value = Number(text);
      if (!Number.isFinite(value)) throw new ParseError(`Bad number: ${text}`);
      tokens.push({ k: 'num', v: value });
      i = j;
      continue;
    }
    if (/[a-z]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-z]/.test(src[j])) j++;
      let word = src.slice(i, j);
      i = j;
      // Split unknown words into single-letter variables: "ab" -> a*b
      while (word.length > 1 && !FUNCTIONS.has(word) && !(word in CONSTANTS)) {
        const twoLetterFn = word.slice(0, 2);
        if (FUNCTIONS.has(twoLetterFn) && word.length === 2) break;
        const head = word[0];
        tokens.push({ k: 'id', v: head });
        word = word.slice(1);
        // allow trailing known function names to stay intact
        if (FUNCTIONS.has(word) || word in CONSTANTS) {
          tokens.push({ k: 'id', v: word });
          word = '';
        }
      }
      if (word) tokens.push({ k: 'id', v: word });
      continue;
    }
    if ('+-*/^!%°'.includes(ch) || ch === '!') {
      tokens.push({ k: 'op', v: ch });
      i++;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      tokens.push({ k: 'lp' });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      tokens.push({ k: 'rp' });
      i++;
      continue;
    }
    if (ch === '|') {
      tokens.push({ k: 'bar' });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ k: 'op', v: ',' });
      i++;
      continue;
    }
    throw new ParseError(`Unexpected character: ${ch}`);
  }
  return tokens;
}

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  get done(): boolean {
    return this.pos >= this.tokens.length;
  }

  peek(offset = 0): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  next(): Token {
    const token = this.tokens[this.pos++];
    if (!token) throw new ParseError('Unexpected end of expression');
    return token;
  }

  parse(): Node {
    const node = this.parseExpression();
    if (!this.done) throw new ParseError('Unexpected token at end of expression');
    return node;
  }

  private parseExpression(): Node {
    let left = this.parseTerm();
    for (;;) {
      const token = this.peek();
      if (token?.k === 'op' && (token.v === '+' || token.v === '-')) {
        this.next();
        const right = this.parseTerm();
        left = token.v === '+' ? addNode(left, right) : subNode(left, right);
      } else break;
    }
    return left;
  }

  private startsPrimary(token: Token | undefined): boolean {
    return !!token && (token.k === 'num' || token.k === 'id' || token.k === 'lp');
  }

  private parseTerm(): Node {
    let left = this.parseUnary();
    for (;;) {
      const token = this.peek();
      if (token?.k === 'op' && (token.v === '*' || token.v === '/')) {
        this.next();
        const right = this.parseUnary();
        left = token.v === '*' ? mulNode(left, right) : divNode(left, right);
      } else if (this.startsPrimary(token)) {
        // implicit multiplication: 2x, 3(x+1), xy
        const right = this.parseUnary();
        left = mulNode(left, right);
      } else break;
    }
    return left;
  }

  private parseUnary(): Node {
    const token = this.peek();
    if (token?.k === 'op' && (token.v === '+' || token.v === '-')) {
      this.next();
      const node = this.parseUnary();
      return token.v === '-' ? negNode(node) : node;
    }
    return this.parsePower();
  }

  private parsePower(): Node {
    const base = this.parsePostfix();
    const token = this.peek();
    if (token?.k === 'op' && token.v === '^') {
      this.next();
      const exponent = this.parseUnary();
      return powNode(base, exponent);
    }
    return base;
  }

  private parsePostfix(): Node {
    let node = this.parsePrimary();
    for (;;) {
      const token = this.peek();
      if (token?.k === 'op' && token.v === '!') {
        this.next();
        node = { t: 'fact', a: node };
      } else if (token?.k === 'op' && token.v === '%') {
        this.next();
        node = { t: 'pct', a: node };
      } else if (token?.k === 'op' && token.v === '°') {
        this.next();
        node = mulNode(node, numNode(Math.PI / 180));
      } else break;
    }
    return node;
  }

  private parsePrimary(): Node {
    const token = this.next();
    if (token.k === 'num') return numNode(token.v);
    if (token.k === 'lp') {
      const node = this.parseExpression();
      const close = this.next();
      if (close.k !== 'rp') throw new ParseError('Missing )');
      return node;
    }
    if (token.k === 'bar') {
      const node = this.parseExpression();
      const close = this.next();
      if (close.k !== 'bar') throw new ParseError('Missing |');
      return fnNode('abs', node);
    }
    if (token.k === 'id') {
      if (FUNCTIONS.has(token.v)) {
        let arg: Node;
        const next = this.peek();
        if (next?.k === 'lp') {
          this.next();
          arg = this.parseExpression();
          const close = this.next();
          if (close.k !== 'rp') throw new ParseError('Missing )');
        } else {
          arg = this.parsePower();
        }
        return fnNode(token.v, arg);
      }
      return varNode(token.v);
    }
    throw new ParseError('Unexpected token');
  }
}

export function parse(input: string): Node {
  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);
  if (!tokens.length) throw new ParseError('Empty expression');
  return new Parser(tokens).parse();
}

export function tryParse(input: string): Node | null {
  try {
    return parse(input);
  } catch {
    return null;
  }
}

/* ========================================================================== */
/*  Printing                                                                   */
/* ========================================================================== */

const PREC: Record<Node['t'], number> = {
  add: 1,
  sub: 1,
  mul: 2,
  div: 2,
  neg: 3,
  pow: 4,
  fn: 5,
  var: 6,
  num: 6,
  fact: 6,
  pct: 6,
};

export function stringify(node: Node): string {
  const str = (n: Node, parentPrecedence = 0): string => {
    let out: string;
    switch (n.t) {
      case 'num':
        out = num(n.v);
        break;
      case 'var':
        return n.name === 'pi' ? 'π' : n.name === 'theta' ? 'θ' : n.name;
      case 'add':
        out = `${str(n.a, 1)} + ${str(n.b, 1)}`;
        break;
      case 'sub':
        out = `${str(n.a, 1)} − ${str(n.b, 2)}`;
        break;
      case 'mul': {
        const factors = flattenProduct(n);
        const simple = factors.every(
          (factor) => factor.t === 'num' || factor.t === 'var' || factor.t === 'pow' || factor.t === 'fn',
        );
        const ordered = simple ? [...factors].sort((a, b) => productRank(a) - productRank(b)) : factors;
        out = ordered
          .map((factor, index) => {
            const text = str(factor, 2);
            if (index === 0) return text;
            return `${ordered[index - 1].t === 'num' ? '' : '·'}${text}`;
          })
          .join('');
        break;
      }
      case 'div':
        out = `${str(n.a, 2)} / ${str(n.b, 3)}`;
        break;
      case 'neg':
        out = `−${str(n.a, 3)}`;
        break;
      case 'pow': {
        const base = str(n.a, 5);
        if (n.b.t === 'num' && Number.isInteger(n.b.v)) out = `${base}${sup(n.b.v)}`;
        else out = `${base}^${str(n.b, 4)}`;
        break;
      }
      case 'fn': {
        if (n.name === 'sqrt') out = `√${wrap(str(n.arg, 0))}`;
        else if (n.name === 'abs') out = `|${str(n.arg, 0)}|`;
        else if (n.name === 'cbrt') out = `∛${wrap(str(n.arg, 0))}`;
        else out = `${n.name}(${str(n.arg, 0)})`;
        return out;
      }
      case 'fact':
        out = `${str(n.a, 5)}!`;
        break;
      case 'pct':
        out = `${str(n.a, 5)}%`;
        break;
      default:
        out = '';
    }
    return PREC[n.t] < parentPrecedence ? `(${out})` : out;
  };
  return str(node);
}

function flattenProduct(node: Node, out: Node[] = []): Node[] {
  if (node.t === 'mul') {
    flattenProduct(node.a, out);
    flattenProduct(node.b, out);
  } else {
    out.push(node);
  }
  return out;
}

function productRank(node: Node): number {
  if (node.t === 'num') return 0;
  if (node.t === 'var' || node.t === 'pow') return 1;
  return 2;
}

function wrap(text: string): string {
  return /[+\-−*/^ ]/.test(text) && !/^[a-z]+$/.test(text) ? `(${text})` : text;
}

export function isConstantNode(node: Node): boolean {
  switch (node.t) {
    case 'num':
      return true;
    case 'var':
      return false;
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
    case 'pow':
      return isConstantNode(node.a) && isConstantNode(node.b);
    case 'neg':
    case 'fact':
    case 'pct':
      return isConstantNode(node.a);
    case 'fn':
      return isConstantNode(node.arg);
  }
}

export function collectVars(node: Node, into = new Set<string>()): Set<string> {
  switch (node.t) {
    case 'var':
      if (node.name !== 'pi' && node.name !== 'e') into.add(node.name);
      break;
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
    case 'pow':
      collectVars(node.a, into);
      collectVars(node.b, into);
      break;
    case 'neg':
    case 'fact':
    case 'pct':
      collectVars(node.a, into);
      break;
    case 'fn':
      collectVars(node.arg, into);
      break;
    default:
      break;
  }
  return into;
}

/* ========================================================================== */
/*  Numeric evaluation                                                         */
/* ========================================================================== */

function applyFunction(name: string, x: number): number {
  switch (name) {
    case 'sin':
      return Math.sin(x);
    case 'cos':
      return Math.cos(x);
    case 'tan':
      return Math.tan(x);
    case 'cot':
      return 1 / Math.tan(x);
    case 'sec':
      return 1 / Math.cos(x);
    case 'csc':
      return 1 / Math.sin(x);
    case 'log':
      return Math.log10(x);
    case 'ln':
      return Math.log(x);
    case 'sqrt':
      return Math.sqrt(x);
    case 'cbrt':
      return Math.cbrt(x);
    case 'exp':
      return Math.exp(x);
    case 'abs':
      return Math.abs(x);
    case 'asin':
    case 'arcsin':
      return Math.asin(x);
    case 'acos':
    case 'arccos':
      return Math.acos(x);
    case 'atan':
    case 'arctan':
      return Math.atan(x);
    default:
      return Number.NaN;
  }
}

export function evaluateNode(node: Node, env: Record<string, number> = {}): number | null {
  const run = (n: Node): number => {
    switch (n.t) {
      case 'num':
        return n.v;
      case 'var':
        if (n.name in env) return env[n.name];
        if (n.name in CONSTANTS) return CONSTANTS[n.name];
        throw new Error(`Unknown variable ${n.name}`);
      case 'add':
        return run(n.a) + run(n.b);
      case 'sub':
        return run(n.a) - run(n.b);
      case 'mul':
        return run(n.a) * run(n.b);
      case 'div': {
        const denominator = run(n.b);
        if (denominator === 0) throw new Error('Division by zero');
        return run(n.a) / denominator;
      }
      case 'pow': {
        const value = Math.pow(run(n.a), run(n.b));
        if (Number.isNaN(value)) throw new Error('Undefined power');
        return value;
      }
      case 'neg':
        return -run(n.a);
      case 'fn': {
        const value = applyFunction(n.name, run(n.arg));
        if (Number.isNaN(value)) throw new Error('Undefined function value');
        return value;
      }
      case 'fact': {
        const value = run(n.a);
        if (!Number.isInteger(value) || value < 0) throw new Error('Factorial needs an integer');
        let out = 1;
        for (let i = 2; i <= value; i++) out *= i;
        return out;
      }
      case 'pct':
        return run(n.a) / 100;
      default:
        throw new Error('Unsupported node');
    }
  };

  try {
    const value = run(node);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** Exact rational evaluation where possible (used for arithmetic answers). */
export function evaluateExact(node: Node, env: Record<string, Rat> = {}): Rat | null {
  const run = (n: Node): Rat => {
    switch (n.t) {
      case 'num':
        return rat(n.v);
      case 'var':
        if (n.name in env) return env[n.name];
        if (n.name in CONSTANTS) return rat(CONSTANTS[n.name]);
        throw new Error(`Unknown variable ${n.name}`);
      case 'add':
        return rAdd(run(n.a), run(n.b));
      case 'sub':
        return rSub(run(n.a), run(n.b));
      case 'mul':
        return rMul(run(n.a), run(n.b));
      case 'div':
        return rDiv(run(n.a), run(n.b));
      case 'neg':
        return rNeg(run(n.a));
      case 'pow': {
        const exponent = run(n.b);
        if (exponent.d === 1 && Number.isInteger(exponent.n) && Math.abs(exponent.n) <= 64) {
          return rPow(run(n.a), exponent.n);
        }
        return rat(Math.pow(rVal(run(n.a)), rVal(exponent)));
      }
      case 'fn': {
        const value = applyFunction(n.name, rVal(run(n.arg)));
        if (Number.isNaN(value)) throw new Error('Undefined');
        return rat(value);
      }
      case 'fact': {
        const value = run(n.a);
        if (value.d !== 1 || !Number.isInteger(value.n) || value.n < 0 || value.n > 170) {
          throw new Error('Factorial needs a small integer');
        }
        let out = 1;
        for (let i = 2; i <= value.n; i++) out *= i;
        return rat(out);
      }
      case 'pct':
        return rDiv(run(n.a), rat(100));
      default:
        throw new Error('Unsupported node');
    }
  };

  try {
    const value = run(node);
    if (!Number.isFinite(value.n) || !Number.isFinite(value.d)) return null;
    return value;
  } catch {
    return null;
  }
}

/** Evaluate substituting one variable. */
export function evalAt(node: Node, variable: string, value: number): number | null {
  return evaluateNode(node, { [variable]: value });
}

export const exactStr = (value: Rat): string => rStr(value);

/* ========================================================================== */
/*  Polynomials                                                                */
/* ========================================================================== */

export type Poly = number[]; // coefficients, index = power

function trimPoly(poly: Poly): Poly {
  const out = [...poly];
  while (out.length > 1 && Math.abs(out[out.length - 1]) < 1e-12) out.pop();
  return out;
}

export function polyDegree(poly: Poly): number {
  return trimPoly(poly).length - 1;
}

export function toPoly(node: Node, variable = 'x'): Poly | null {
  switch (node.t) {
    case 'num':
      return [node.v];
    case 'var':
      if (node.name === variable) return [0, 1];
      return null;
    case 'neg': {
      const inner = toPoly(node.a, variable);
      return inner ? inner.map((c) => -c) : null;
    }
    case 'add': {
      const a = toPoly(node.a, variable);
      const b = toPoly(node.b, variable);
      if (!a || !b) return null;
      const out = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0));
      return trimPoly(out);
    }
    case 'sub': {
      const a = toPoly(node.a, variable);
      const b = toPoly(node.b, variable);
      if (!a || !b) return null;
      const out = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) - (b[i] ?? 0));
      return trimPoly(out);
    }
    case 'mul': {
      const a = toPoly(node.a, variable);
      const b = toPoly(node.b, variable);
      if (!a || !b) return null;
      const out: Poly = new Array(a.length + b.length - 1).fill(0);
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
      }
      return trimPoly(out);
    }
    case 'div': {
      const a = toPoly(node.a, variable);
      const b = toPoly(node.b, variable);
      if (!a || !b || b.length !== 1 || b[0] === 0) return null;
      return trimPoly(a.map((c) => c / b[0]));
    }
    case 'pow': {
      const base = toPoly(node.a, variable);
      const exponent = evaluateNode(node.b);
      if (!base) return null;
      if (exponent === null || !Number.isInteger(exponent) || exponent < 0 || exponent > 12) return null;
      let out: Poly = [1];
      for (let i = 0; i < exponent; i++) {
        const next: Poly = new Array(out.length + base.length - 1).fill(0);
        for (let j = 0; j < out.length; j++) {
          for (let k = 0; k < base.length; k++) next[j + k] += out[j] * base[k];
        }
        out = next;
      }
      return trimPoly(out);
    }
    case 'fn':
    case 'fact':
    case 'pct':
      return null;
    default:
      return null;
  }
}

export function polyFromNodeDifference(left: Node, right: Node, variable: string): Poly | null {
  return toPoly(subNode(left, right), variable);
}

export function polyEval(poly: Poly, x: number): number {
  let out = 0;
  for (let i = poly.length - 1; i >= 0; i--) out = out * x + poly[i];
  return out;
}

export function polyDerivative(poly: Poly): Poly {
  if (poly.length <= 1) return [0];
  return trimPoly(poly.slice(1).map((c, i) => c * (i + 1)));
}

export function polyToString(poly: Poly, variable = 'x'): string {
  const p = trimPoly(poly);
  const pieces: string[] = [];
  for (let power = p.length - 1; power >= 0; power--) {
    const coefficient = p[power];
    if (Math.abs(coefficient) < 1e-12) continue;
    const abs = Math.abs(coefficient);
    const rounded = Number(abs.toFixed(8));
    const sign = coefficient < 0 ? '−' : '+';
    let body = '';
    if (power === 0) body = num(rounded);
    else {
      const variablePart = power === 1 ? variable : `${variable}${sup(power)}`;
      body = rounded === 1 ? variablePart : `${num(rounded)}${variablePart}`;
    }
    pieces.push(pieces.length === 0 ? (coefficient < 0 ? `−${body}` : body) : `${sign} ${body}`);
  }
  return pieces.length ? pieces.join(' ') : '0';
}

/** Divide a polynomial by (x − root); returns quotient. */
export function syntheticDivide(poly: Poly, root: number): Poly {
  const p = trimPoly(poly);
  const quotient: number[] = new Array(p.length - 1).fill(0);
  let carry = p[p.length - 1];
  for (let i = p.length - 2; i >= 0; i--) {
    quotient[i] = carry;
    carry = p[i] + carry * root;
  }
  return trimPoly(quotient);
}

export function polyRemainder(poly: Poly, root: number): number {
  return polyEval(poly, root);
}

/* ========================================================================== */
/*  Simplification                                                             */
/* ========================================================================== */

export function simplify(node: Node): Node {
  switch (node.t) {
    case 'num':
    case 'var':
      return node;
    case 'neg': {
      const inner = simplify(node.a);
      if (inner.t === 'num') return numNode(-inner.v);
      if (inner.t === 'neg') return inner.a;
      return negNode(inner);
    }
    case 'add': {
      const a = simplify(node.a);
      const b = simplify(node.b);
      if (a.t === 'num' && b.t === 'num') return numNode(a.v + b.v);
      if (a.t === 'num' && a.v === 0) return b;
      if (b.t === 'num' && b.v === 0) return a;
      if (b.t === 'neg') return simplify(subNode(a, b.a));
      return addNode(a, b);
    }
    case 'sub': {
      const a = simplify(node.a);
      const b = simplify(node.b);
      if (a.t === 'num' && b.t === 'num') return numNode(a.v - b.v);
      if (b.t === 'num' && b.v === 0) return a;
      if (a.t === 'num' && a.v === 0) return simplify(negNode(b));
      return subNode(a, b);
    }
    case 'mul': {
      const a = simplify(node.a);
      const b = simplify(node.b);
      if (a.t === 'num' && b.t === 'num') return numNode(a.v * b.v);
      if ((a.t === 'num' && a.v === 0) || (b.t === 'num' && b.v === 0)) return numNode(0);
      if (a.t === 'num' && a.v === 1) return b;
      if (b.t === 'num' && b.v === 1) return a;
      if (a.t === 'num' && a.v === -1) return simplify(negNode(b));
      if (b.t === 'num' && b.v === -1) return simplify(negNode(a));
      if (b.t === 'num' && a.t !== 'num') return mulNode(b, a);
      return mulNode(a, b);
    }
    case 'div': {
      const a = simplify(node.a);
      const b = simplify(node.b);
      if (a.t === 'num' && b.t === 'num' && b.v !== 0) {
        const value = a.v / b.v;
        if (Number.isInteger(value) || Math.abs(value) < 1e6) return numNode(value);
      }
      if (b.t === 'num' && b.v === 1) return a;
      return divNode(a, b);
    }
    case 'pow': {
      const a = simplify(node.a);
      const b = simplify(node.b);
      if (b.t === 'num') {
        if (b.v === 0) return numNode(1);
        if (b.v === 1) return a;
        if (a.t === 'num' && Number.isInteger(b.v)) return numNode(Math.pow(a.v, b.v));
      }
      return powNode(a, b);
    }
    case 'fn': {
      const arg = simplify(node.arg);
      if (arg.t === 'num') {
        const value = applyFunction(node.name, arg.v);
        if (Number.isFinite(value)) return numNode(value);
      }
      return fnNode(node.name, arg);
    }
    case 'fact': {
      const arg = simplify(node.a);
      if (arg.t === 'num' && Number.isInteger(arg.v) && arg.v >= 0 && arg.v <= 170) {
        let out = 1;
        for (let i = 2; i <= arg.v; i++) out *= i;
        return numNode(out);
      }
      return { t: 'fact', a: arg };
    }
    case 'pct': {
      const arg = simplify(node.a);
      if (arg.t === 'num') return numNode(arg.v / 100);
      return { t: 'pct', a: arg };
    }
    default:
      return node;
  }
}

/* ========================================================================== */
/*  Differentiation                                                            */
/* ========================================================================== */

export function differentiate(node: Node, variable = 'x'): Node {
  switch (node.t) {
    case 'num':
      return numNode(0);
    case 'var':
      return numNode(node.name === variable ? 1 : 0);
    case 'neg':
      return negNode(differentiate(node.a, variable));
    case 'add':
      return addNode(differentiate(node.a, variable), differentiate(node.b, variable));
    case 'sub':
      return subNode(differentiate(node.a, variable), differentiate(node.b, variable));
    case 'mul':
      return addNode(
        mulNode(differentiate(node.a, variable), node.b),
        mulNode(node.a, differentiate(node.b, variable)),
      );
    case 'div':
      return divNode(
        subNode(
          mulNode(differentiate(node.a, variable), node.b),
          mulNode(node.a, differentiate(node.b, variable)),
        ),
        powNode(node.b, numNode(2)),
      );
    case 'pow': {
      const exponent = node.b;
      if (exponent.t === 'num') {
        return mulNode(
          mulNode(exponent, powNode(node.a, numNode(exponent.v - 1))),
          differentiate(node.a, variable),
        );
      }
      if (node.a.t === 'var' && node.a.name === 'e') {
        return mulNode(node, differentiate(exponent, variable));
      }
      // general: a^b = a^b (b' ln a + b a'/a)
      return mulNode(
        node,
        addNode(
          mulNode(differentiate(exponent, variable), fnNode('ln', node.a)),
          mulNode(exponent, divNode(differentiate(node.a, variable), node.a)),
        ),
      );
    }
    case 'fn': {
      const inner = differentiate(node.arg, variable);
      const chain = (outer: Node) => simplify(mulNode(outer, inner));
      switch (node.name) {
        case 'sin':
          return chain(fnNode('cos', node.arg));
        case 'cos':
          return chain(negNode(fnNode('sin', node.arg)));
        case 'tan':
          return chain(powNode(fnNode('sec', node.arg), numNode(2)));
        case 'exp':
          return chain(fnNode('exp', node.arg));
        case 'ln':
          return chain(divNode(numNode(1), node.arg));
        case 'log':
          return chain(divNode(numNode(1), mulNode(node.arg, fnNode('ln', numNode(10)))));
        case 'sqrt':
          return chain(divNode(numNode(1), mulNode(numNode(2), fnNode('sqrt', node.arg))));
        default:
          return numNode(0);
      }
    }
    default:
      return numNode(0);
  }
}

/* ========================================================================== */
/*  Integration                                                                */
/* ========================================================================== */

/** Detect a·v + b inside an inner expression. */
function linearCoefficients(node: Node, variable: string): { a: number; b: number } | null {
  const poly = toPoly(node, variable);
  if (!poly || poly.length > 2) return null;
  return { a: poly[1] ?? 0, b: poly[0] ?? 0 };
}

export function integrate(node: Node, variable = 'x'): Node | null {
  switch (node.t) {
    case 'num':
      return mulNode(node, varNode(variable));
    case 'var':
      if (node.name === variable) return divNode(powNode(node, numNode(2)), numNode(2));
      return mulNode(node, varNode(variable));
    case 'neg': {
      const inner = integrate(node.a, variable);
      return inner ? negNode(inner) : null;
    }
    case 'add': {
      const a = integrate(node.a, variable);
      const b = integrate(node.b, variable);
      return a && b ? addNode(a, b) : null;
    }
    case 'sub': {
      const a = integrate(node.a, variable);
      const b = integrate(node.b, variable);
      return a && b ? subNode(a, b) : null;
    }
    case 'mul': {
      const aConstant = isConstantNode(node.a) || !collectVars(node.a).has(variable);
      const bConstant = isConstantNode(node.b) || !collectVars(node.b).has(variable);
      if (aConstant) {
        const inner = integrate(node.b, variable);
        return inner ? mulNode(node.a, inner) : null;
      }
      if (bConstant) {
        const inner = integrate(node.a, variable);
        return inner ? mulNode(node.b, inner) : null;
      }
      return null;
    }
    case 'div': {
      if (isConstantNode(node.b)) {
        const inner = integrate(node.a, variable);
        return inner ? divNode(inner, node.b) : null;
      }
      const linear = linearCoefficients(node.b, variable);
      if (linear && linear.a !== 0 && node.a.t === 'num') {
        const log = fnNode('ln', fnNode('abs', node.b));
        return mulNode(divNode(node.a, numNode(linear.a)), log);
      }
      return null;
    }
    case 'pow': {
      if (node.a.t === 'var' && node.a.name === variable && node.b.t === 'num') {
        if (node.b.v === -1) return fnNode('ln', fnNode('abs', node.a));
        const power = node.b.v + 1;
        if (power === 0) return fnNode('ln', fnNode('abs', node.a));
        return divNode(powNode(node.a, numNode(power)), numNode(power));
      }
      if (node.a.t === 'var' && node.a.name === 'e') {
        const linear = linearCoefficients(node.b, variable);
        if (linear && linear.a !== 0) return divNode(node, numNode(linear.a));
      }
      return null;
    }
    case 'fn': {
      const linear = linearCoefficients(node.arg, variable);
      if (!linear || linear.a === 0) return null;
      const { a } = linear;
      const arg = node.arg;
      switch (node.name) {
        case 'sin':
          return mulNode(divNode(numNode(-1), numNode(a)), fnNode('cos', arg));
        case 'cos':
          return mulNode(divNode(numNode(1), numNode(a)), fnNode('sin', arg));
        case 'exp':
          return divNode(fnNode('exp', arg), numNode(a));
        case 'ln':
          return divNode(
            subNode(mulNode(arg, fnNode('ln', arg)), arg),
            numNode(a),
          );
        default:
          return null;
      }
    }
    default:
      return null;
  }
}
