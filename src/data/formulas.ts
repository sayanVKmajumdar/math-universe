import type { FormulaCategory } from '@/lib/types';

export const formulaCategories: FormulaCategory[] = [
  {
    id: 'algebra',
    name: { en: 'Algebra', bn: 'বীজগণিত' },
    icon: 'x²',
    accent: 'teal',
    formulas: [
      {
        id: 'quadratic-formula',
        name: { en: 'Quadratic formula', bn: 'দ্বিঘাত সূত্র' },
        expr: 'x = (−b ± √(b² − 4ac)) / 2a',
        desc: { en: 'Roots of ax² + bx + c = 0, a ≠ 0', bn: 'ax² + bx + c = 0 এর বীজ, a ≠ 0' },
      },
      {
        id: 'discriminant',
        name: { en: 'Discriminant', bn: 'বিবেচক' },
        expr: 'D = b² − 4ac',
        desc: {
          en: 'D > 0: two real roots · D = 0: equal roots · D < 0: complex roots',
          bn: 'D > 0: দুটি বাস্তব বীজ · D = 0: সমান বীজ · D < 0: জটিল বীজ',
        },
      },
      {
        id: 'sum-product-roots',
        name: { en: 'Sum and product of roots', bn: 'বীজের সমষ্টি ও গুণফল' },
        expr: 'α + β = −b/a,   αβ = c/a',
      },
      {
        id: 'square-of-sum',
        name: { en: 'Square of a sum', bn: 'সমষ্টির বর্গ' },
        expr: '(a + b)² = a² + 2ab + b²',
      },
      {
        id: 'square-of-difference',
        name: { en: 'Square of a difference', bn: 'বিয়োগফলের বর্গ' },
        expr: '(a − b)² = a² − 2ab + b²',
      },
      {
        id: 'difference-of-squares',
        name: { en: 'Difference of squares', bn: 'বর্গের বিয়োগফল' },
        expr: 'a² − b² = (a + b)(a − b)',
      },
      {
        id: 'cube-of-sum',
        name: { en: 'Cube of a sum', bn: 'সমষ্টির ঘন' },
        expr: '(a + b)³ = a³ + 3a²b + 3ab² + b³',
      },
      {
        id: 'sum-of-cubes',
        name: { en: 'Sum of cubes', bn: 'ঘনফলের সমষ্টি' },
        expr: 'a³ + b³ = (a + b)(a² − ab + b²)',
      },
      {
        id: 'difference-of-cubes',
        name: { en: 'Difference of cubes', bn: 'ঘনফলের বিয়োগফল' },
        expr: 'a³ − b³ = (a − b)(a² + ab + b²)',
      },
      {
        id: 'three-term-square',
        name: { en: 'Square of three terms', bn: 'তিনটি পদের বর্গ' },
        expr: '(a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca',
      },
      {
        id: 'binomial-theorem',
        name: { en: 'Binomial theorem', bn: 'দ্বিপদী উপপাদ্য' },
        expr: '(a + b)ⁿ = Σ ⁿCᵣ aⁿ⁻ʳ bʳ,  r = 0…n',
      },
      {
        id: 'log-product',
        name: { en: 'Logarithm of a product', bn: 'গুণফলের লগারিদম' },
        expr: 'log(xy) = log x + log y',
      },
      {
        id: 'log-power',
        name: { en: 'Logarithm of a power', bn: 'ঘাতের লগারিদম' },
        expr: 'log(xⁿ) = n log x',
      },
      {
        id: 'change-of-base',
        name: { en: 'Change of base', bn: 'ভিত্তি পরিবর্তন' },
        expr: 'logₐ b = log b / log a',
      },
    ],
  },
  {
    id: 'trigonometry',
    name: { en: 'Trigonometry', bn: 'ত্রিকোণমিতি' },
    icon: 'θ',
    accent: 'indigo',
    formulas: [
      {
        id: 'pythagorean-identity',
        name: { en: 'Pythagorean identity', bn: 'পিথাগোরাসের অভেদ' },
        expr: 'sin²θ + cos²θ = 1',
      },
      {
        id: 'sec-identity',
        name: { en: 'Secant identity', bn: 'সেক্যান্ট অভেদ' },
        expr: '1 + tan²θ = sec²θ',
      },
      {
        id: 'csc-identity',
        name: { en: 'Cosecant identity', bn: 'কোসেক্যান্ট অভেদ' },
        expr: '1 + cot²θ = csc²θ',
      },
      {
        id: 'sin-addition',
        name: { en: 'Sine of A ± B', bn: 'sin(A ± B)' },
        expr: 'sin(A ± B) = sin A cos B ± cos A sin B',
      },
      {
        id: 'cos-addition',
        name: { en: 'Cosine of A ± B', bn: 'cos(A ± B)' },
        expr: 'cos(A ± B) = cos A cos B ∓ sin A sin B',
      },
      {
        id: 'tan-addition',
        name: { en: 'Tangent of A ± B', bn: 'tan(A ± B)' },
        expr: 'tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A tan B)',
      },
      {
        id: 'double-angle-sin',
        name: { en: 'Double angle — sine', bn: 'দ্বিগুণ কোণ — sin' },
        expr: 'sin 2θ = 2 sin θ cos θ',
      },
      {
        id: 'double-angle-cos',
        name: { en: 'Double angle — cosine', bn: 'দ্বিগুণ কোণ — cos' },
        expr: 'cos 2θ = cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1',
      },
      {
        id: 'double-angle-tan',
        name: { en: 'Double angle — tangent', bn: 'দ্বিগুণ কোণ — tan' },
        expr: 'tan 2θ = 2 tan θ / (1 − tan²θ)',
      },
      {
        id: 'sine-rule',
        name: { en: 'Sine rule', bn: 'সাইন নিয়ম' },
        expr: 'a / sin A = b / sin B = c / sin C = 2R',
      },
      {
        id: 'cosine-rule',
        name: { en: 'Cosine rule', bn: 'কোসাইন নিয়ম' },
        expr: 'a² = b² + c² − 2bc cos A',
      },
      {
        id: 'triangle-area-trig',
        name: { en: 'Triangle area (trig)', bn: 'ত্রিভুজের ক্ষেত্রফল (ত্রিকোণমিতি)' },
        expr: 'Area = ½ ab sin C',
      },
      {
        id: 'sector-area',
        name: { en: 'Sector area', bn: 'বৃত্তাংশের ক্ষেত্রফল' },
        expr: 'A = ½ r²θ   (θ in radians)',
      },
      {
        id: 'arc-length',
        name: { en: 'Arc length', bn: 'চাপের দৈর্ঘ্য' },
        expr: 's = rθ   (θ in radians)',
      },
    ],
  },
  {
    id: 'calculus',
    name: { en: 'Calculus', bn: 'ক্যালকুলাস' },
    icon: '∫',
    accent: 'gold',
    formulas: [
      {
        id: 'power-rule',
        name: { en: 'Power rule', bn: 'ঘাত নিয়ম' },
        expr: 'd/dx (xⁿ) = n xⁿ⁻¹',
      },
      {
        id: 'product-rule',
        name: { en: 'Product rule', bn: 'গুণন নিয়ম' },
        expr: 'd/dx (uv) = u′v + uv′',
      },
      {
        id: 'quotient-rule',
        name: { en: 'Quotient rule', bn: 'ভাগ নিয়ম' },
        expr: "d/dx (u/v) = (u′v − uv′) / v²",
      },
      {
        id: 'chain-rule',
        name: { en: 'Chain rule', bn: 'শৃঙ্খল নিয়ম' },
        expr: 'd/dx f(g(x)) = f′(g(x)) · g′(x)',
      },
      {
        id: 'derivative-sin',
        name: { en: 'Derivative of sin x', bn: 'sin x এর অন্তরকলজ' },
        expr: 'd/dx (sin x) = cos x',
      },
      {
        id: 'derivative-cos',
        name: { en: 'Derivative of cos x', bn: 'cos x এর অন্তরকলজ' },
        expr: 'd/dx (cos x) = −sin x',
      },
      {
        id: 'derivative-tan',
        name: { en: 'Derivative of tan x', bn: 'tan x এর অন্তরকলজ' },
        expr: 'd/dx (tan x) = sec² x',
      },
      {
        id: 'derivative-exp',
        name: { en: 'Derivative of eˣ', bn: 'eˣ এর অন্তরকলজ' },
        expr: 'd/dx (eˣ) = eˣ',
      },
      {
        id: 'derivative-log',
        name: { en: 'Derivative of ln x', bn: 'ln x এর অন্তরকলজ' },
        expr: 'd/dx (ln x) = 1/x',
      },
      {
        id: 'integral-power',
        name: { en: 'Integral of a power', bn: 'ঘাতের সমাকল' },
        expr: '∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + C,  n ≠ −1',
      },
      {
        id: 'integral-reciprocal',
        name: { en: 'Integral of 1/x', bn: '1/x এর সমাকল' },
        expr: '∫ (1/x) dx = ln |x| + C',
      },
      {
        id: 'fundamental-theorem',
        name: { en: 'Fundamental theorem', bn: 'মৌলিক উপপাদ্য' },
        expr: '∫ₐᵇ f(x) dx = F(b) − F(a)',
      },
      {
        id: 'integration-by-parts',
        name: { en: 'Integration by parts', bn: 'আংশিক সমাকলন' },
        expr: '∫ u dv = uv − ∫ v du',
      },
      {
        id: 'lhopital',
        name: { en: "L'Hôpital's rule", bn: 'লহোপিতালের নিয়ম' },
        expr: 'lim f/g = lim f′/g′   when the limit is 0/0 or ∞/∞',
      },
    ],
  },
  {
    id: 'geometry',
    name: { en: 'Geometry', bn: 'জ্যামিতি' },
    icon: '△',
    accent: 'emerald',
    formulas: [
      {
        id: 'circle-area',
        name: { en: 'Area of a circle', bn: 'বৃত্তের ক্ষেত্রফল' },
        expr: 'A = πr²',
      },
      {
        id: 'circumference',
        name: { en: 'Circumference', bn: 'পরিধি' },
        expr: 'C = 2πr',
      },
      {
        id: 'triangle-area',
        name: { en: 'Area of a triangle', bn: 'ত্রিভুজের ক্ষেত্রফল' },
        expr: 'A = ½ × base × height',
      },
      {
        id: 'heron',
        name: { en: "Heron's formula", bn: 'হেরনের সূত্র' },
        expr: 'A = √[s(s − a)(s − b)(s − c)],  s = (a + b + c)/2',
      },
      {
        id: 'rectangle-area',
        name: { en: 'Area of a rectangle', bn: 'আয়তক্ষেত্রের ক্ষেত্রফল' },
        expr: 'A = l × b',
      },
      {
        id: 'trapezium-area',
        name: { en: 'Area of a trapezium', bn: 'ট্রাপিজিয়ামের ক্ষেত্রফল' },
        expr: 'A = ½ (a + b) h',
      },
      {
        id: 'pythagoras',
        name: { en: 'Pythagoras theorem', bn: 'পিথাগোরাসের উপপাদ্য' },
        expr: 'a² + b² = c²',
      },
      {
        id: 'sphere-volume',
        name: { en: 'Volume of a sphere', bn: 'গোলকের আয়তন' },
        expr: 'V = (4/3) πr³',
      },
      {
        id: 'sphere-surface',
        name: { en: 'Surface area of a sphere', bn: 'গোলকের পৃষ্ঠতল' },
        expr: 'S = 4πr²',
      },
      {
        id: 'cylinder-volume',
        name: { en: 'Volume of a cylinder', bn: 'বেলনের আয়তন' },
        expr: 'V = πr²h',
      },
      {
        id: 'cylinder-lateral',
        name: { en: 'Curved surface of a cylinder', bn: 'বেলনের বক্রপৃষ্ঠ' },
        expr: 'S = 2πrh',
      },
      {
        id: 'cone-volume',
        name: { en: 'Volume of a cone', bn: 'শঙ্কুর আয়তন' },
        expr: 'V = (1/3) πr²h',
      },
      {
        id: 'cone-lateral',
        name: { en: 'Curved surface of a cone', bn: 'শঙ্কুর বক্রপৃষ্ঠ' },
        expr: 'S = πrl,   l = √(r² + h²)',
      },
    ],
  },
  {
    id: 'coordinate',
    name: { en: 'Coordinate Geometry', bn: 'স্থানাঙ্ক জ্যামিতি' },
    icon: 'xy',
    accent: 'rose',
    formulas: [
      {
        id: 'distance',
        name: { en: 'Distance formula', bn: 'দূরত্ব সূত্র' },
        expr: 'd = √[(x₂ − x₁)² + (y₂ − y₁)²]',
      },
      {
        id: 'midpoint',
        name: { en: 'Midpoint formula', bn: 'মধ্যবিন্দু সূত্র' },
        expr: 'M = ((x₁ + x₂)/2, (y₁ + y₂)/2)',
      },
      {
        id: 'slope',
        name: { en: 'Slope of a line', bn: 'রেখার ঢাল' },
        expr: 'm = (y₂ − y₁) / (x₂ − x₁)',
      },
      {
        id: 'slope-intercept',
        name: { en: 'Slope–intercept form', bn: 'ঢাল–ছেদ রূপ' },
        expr: 'y = mx + c',
      },
      {
        id: 'point-slope',
        name: { en: 'Point–slope form', bn: 'বিন্দু–ঢাল রূপ' },
        expr: 'y − y₁ = m (x − x₁)',
      },
      {
        id: 'two-point',
        name: { en: 'Two-point form', bn: 'দুই-বিন্দু রূপ' },
        expr: '(y − y₁)/(y₂ − y₁) = (x − x₁)/(x₂ − x₁)',
      },
      {
        id: 'section-formula',
        name: { en: 'Section formula', bn: 'অন্তর্বিভাগ সূত্র' },
        expr: 'P = ((m x₂ + n x₁)/(m + n), (m y₂ + n y₁)/(m + n))',
      },
      {
        id: 'triangle-area-coordinate',
        name: { en: 'Area of a triangle', bn: 'ত্রিভুজের ক্ষেত্রফল' },
        expr: 'A = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|',
      },
      {
        id: 'circle-equation',
        name: { en: 'Equation of a circle', bn: 'বৃত্তের সমীকরণ' },
        expr: '(x − h)² + (y − k)² = r²',
      },
      {
        id: 'parallel-perpendicular',
        name: { en: 'Parallel and perpendicular lines', bn: 'সমান্তরাল ও লম্ব রেখা' },
        expr: 'parallel: m₁ = m₂   ·   perpendicular: m₁m₂ = −1',
      },
    ],
  },
  {
    id: 'statistics',
    name: { en: 'Statistics & Probability', bn: 'পরিসংখ্যান ও সম্ভাবনা' },
    icon: 'σ',
    accent: 'slate',
    formulas: [
      {
        id: 'mean',
        name: { en: 'Mean', bn: 'গড়' },
        expr: 'x̄ = (Σ xᵢ) / n',
      },
      {
        id: 'median',
        name: { en: 'Median', bn: 'মধ্যমান' },
        expr: 'middle value of the ordered data',
      },
      {
        id: 'mode',
        name: { en: 'Mode', bn: 'বহুলক' },
        expr: 'the value that appears most often',
      },
      {
        id: 'variance',
        name: { en: 'Variance', bn: 'ভেরিয়েন্স' },
        expr: 'σ² = Σ(xᵢ − x̄)² / n',
      },
      {
        id: 'standard-deviation',
        name: { en: 'Standard deviation', bn: 'প্রমাণ বিচ্যুতি' },
        expr: 'σ = √[Σ(xᵢ − x̄)² / n]',
      },
      {
        id: 'probability',
        name: { en: 'Classical probability', bn: 'ধ্রুপদী সম্ভাবনা' },
        expr: 'P(A) = n(A) / n(S)',
      },
      {
        id: 'complement',
        name: { en: 'Complement rule', bn: 'সম্পূরক নিয়ম' },
        expr: 'P(A′) = 1 − P(A)',
      },
      {
        id: 'addition-rule',
        name: { en: 'Addition rule', bn: 'যোগ সূত্র' },
        expr: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)',
      },
      {
        id: 'permutation',
        name: { en: 'Permutation', bn: 'বিন্যাস' },
        expr: 'ⁿPᵣ = n! / (n − r)!',
      },
      {
        id: 'combination',
        name: { en: 'Combination', bn: 'সমাবেশ' },
        expr: 'ⁿCᵣ = n! / [r!(n − r)!]',
      },
      {
        id: 'binomial-probability',
        name: { en: 'Binomial probability', bn: 'দ্বিপদী সম্ভাবনা' },
        expr: 'P(X = k) = ⁿCₖ pᵏ (1 − p)ⁿ⁻ᵏ',
      },
      {
        id: 'normal-distribution',
        name: { en: 'Normal distribution', bn: 'স্বাভাবিক বিতরণ' },
        expr: 'f(x) = (1 / σ√(2π)) e^(−(x − μ)² / 2σ²)',
      },
    ],
  },
  {
    id: 'matrices',
    name: { en: 'Matrices', bn: 'ম্যাট্রিক্স' },
    icon: '⊞',
    accent: 'teal',
    formulas: [
      {
        id: 'determinant-2x2',
        name: { en: 'Determinant (2 × 2)', bn: 'নির্ণায়ক (২ × ২)' },
        expr: '|A| = ad − bc   for   A = [[a, b], [c, d]]',
      },
      {
        id: 'inverse-2x2',
        name: { en: 'Inverse (2 × 2)', bn: 'বিপরীত ম্যাট্রিক্স (২ × ২)' },
        expr: 'A⁻¹ = (1/|A|) [[d, −b], [−c, a]]',
      },
      {
        id: 'determinant-3x3',
        name: { en: 'Determinant (3 × 3)', bn: 'নির্ণায়ক (৩ × ৩)' },
        expr: '|A| = a(ei − fh) − b(di − fg) + c(dh − eg)',
      },
      {
        id: 'transpose',
        name: { en: 'Transpose rules', bn: 'ট্রান্সপোজ নিয়ম' },
        expr: '(AB)ᵀ = BᵀAᵀ,   (Aᵀ)ᵀ = A',
      },
      {
        id: 'inverse-product',
        name: { en: 'Inverse of a product', bn: 'গুণফলের বিপরীত' },
        expr: '(AB)⁻¹ = B⁻¹A⁻¹',
      },
      {
        id: 'cramers-rule',
        name: { en: "Cramer's rule", bn: 'ক্র্যামারের নিয়ম' },
        expr: 'x = |A₁| / |A|,  y = |A₂| / |A|',
      },
      {
        id: 'adjoint',
        name: { en: 'Adjoint form', bn: 'অ্যাডজয়েন্ট রূপ' },
        expr: 'A⁻¹ = adj(A) / |A|',
      },
      {
        id: 'identity-matrix',
        name: { en: 'Identity matrix', bn: 'একক ম্যাট্রিক্স' },
        expr: 'AI = IA = A,   (Iₙ)ᵢⱼ = 1 if i = j else 0',
      },
    ],
  },
  {
    id: 'number-theory',
    name: { en: 'Sequences & Number Theory', bn: 'ধারা ও সংখ্যাতত্ত্ব' },
    icon: 'Σ',
    accent: 'gold',
    formulas: [
      {
        id: 'sum-naturals',
        name: { en: 'Sum of first n naturals', bn: 'প্রথম n স্বাভাবিক সংখ্যার সমষ্টি' },
        expr: '1 + 2 + … + n = n(n + 1) / 2',
      },
      {
        id: 'sum-squares',
        name: { en: 'Sum of squares', bn: 'বর্গের সমষ্টি' },
        expr: '1² + 2² + … + n² = n(n + 1)(2n + 1) / 6',
      },
      {
        id: 'sum-cubes',
        name: { en: 'Sum of cubes', bn: 'ঘনফলের সমষ্টি' },
        expr: '1³ + 2³ + … + n³ = [n(n + 1)/2]²',
      },
      {
        id: 'ap-nth',
        name: { en: 'AP — n-th term', bn: 'সমান্তর প্রগতি — n-তম পদ' },
        expr: 'aₙ = a + (n − 1)d',
      },
      {
        id: 'ap-sum',
        name: { en: 'AP — sum', bn: 'সমান্তর প্রগতি — সমষ্টি' },
        expr: 'Sₙ = n/2 [2a + (n − 1)d] = n/2 (a + l)',
      },
      {
        id: 'gp-nth',
        name: { en: 'GP — n-th term', bn: 'গুণোত্তর প্রগতি — n-তম পদ' },
        expr: 'aₙ = a rⁿ⁻¹',
      },
      {
        id: 'gp-sum',
        name: { en: 'GP — sum', bn: 'গুণোত্তর প্রগতি — সমষ্টি' },
        expr: 'Sₙ = a(1 − rⁿ)/(1 − r),  r ≠ 1',
      },
      {
        id: 'gp-infinite',
        name: { en: 'GP — infinite sum', bn: 'গুণোত্তর প্রগতি — অসীম সমষ্টি' },
        expr: 'S∞ = a / (1 − r),   |r| < 1',
      },
      {
        id: 'gcd-lcm',
        name: { en: 'GCD and LCM', bn: 'গসাগু ও লসাগু' },
        expr: 'gcd(a, b) × lcm(a, b) = a × b',
      },
      {
        id: 'divisibility-3',
        name: { en: 'Divisibility by 3 and 9', bn: '৩ ও ৯ দ্বারা বিভাজ্যতা' },
        expr: '3 | n (or 9 | n) ⟺ digit sum divisible by 3 (or 9)',
      },
    ],
  },
];

export const allFormulas = formulaCategories.flatMap((category) =>
  category.formulas.map((formula) => ({ ...formula, category: category.id, categoryName: category.name })),
);

export function findFormulaCategory(id: string | undefined): FormulaCategory {
  return formulaCategories.find((category) => category.id === id) ?? formulaCategories[0];
}

export const totalFormulaCount = allFormulas.length;
