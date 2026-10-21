export interface SolverExample {
  label: string;
  expr: string;
  group: 'algebra' | 'calculus' | 'other';
}

export const solverExamples: SolverExample[] = [
  { label: 'Quadratic', expr: '2x² − 5x + 3 = 0', group: 'algebra' },
  { label: 'Linear', expr: '3x + 7 = 22', group: 'algebra' },
  { label: 'System', expr: '2x + 3y = 12, x − y = 1', group: 'algebra' },
  { label: 'Expand', expr: '(a + b)³', group: 'algebra' },
  { label: 'Derivative', expr: 'd/dx(x³ + 2x²)', group: 'calculus' },
  { label: 'Chain rule', expr: 'd/dx(sin(x²))', group: 'calculus' },
  { label: 'Integral', expr: '∫(3x² + 2x)dx', group: 'calculus' },
  { label: 'Limit', expr: 'lim x→0 sin(x)/x', group: 'calculus' },
  { label: 'Trig value', expr: 'sin 30°', group: 'other' },
  { label: 'Circle', expr: 'area of circle r = 7', group: 'other' },
  { label: 'Mean', expr: 'mean of 4, 8, 6, 10', group: 'other' },
  { label: 'AP', expr: 'AP: 3, 7, 11 10th term', group: 'other' },
  { label: 'HCF', expr: 'gcd(24, 36)', group: 'other' },
  { label: 'Complexity', expr: '2 + 3 × 4² − 8 ÷ 2', group: 'other' },
];

export const keypadKeys = [
  { label: 'x²', insert: '^2' },
  { label: 'x³', insert: '^3' },
  { label: '√', insert: '√(' },
  { label: 'π', insert: 'π' },
  { label: 'θ', insert: 'θ' },
  { label: '∫', insert: '∫(' },
  { label: 'd/dx', insert: 'd/dx(' },
  { label: '°', insert: '°' },
  { label: '×', insert: ' × ' },
  { label: '÷', insert: ' ÷ ' },
  { label: '≤', insert: ' ≤ ' },
  { label: '∞', insert: '∞' },
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
];

export const quickSymbols = ['x', 'y', '=', '+', '−', '/', '^', '!', '%', ',', '.', '→'];
