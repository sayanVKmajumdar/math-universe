import type { PracticeTopic, Question } from '@/lib/types';

const int = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const uid = () => `q-${Math.random().toString(36).slice(2, 10)}`;
const bi = (en: string, bn: string) => ({ en, bn });
const round2 = (value: number) => Number(value.toFixed(2));
const clean = (value: number) => String(round2(value));

export const practiceTopics: { id: PracticeTopic; en: string; bn: string; icon: string }[] = [
  { id: 'arithmetic', en: 'Arithmetic', bn: 'পাটিগণিত', icon: '＋' },
  { id: 'algebra', en: 'Algebra', bn: 'বীজগণিত', icon: 'x' },
  { id: 'percentage', en: 'Percentage', bn: 'শতকরা', icon: '%' },
  { id: 'geometry', en: 'Mensuration', bn: 'পরিমিতি', icon: '△' },
  { id: 'trigonometry', en: 'Trigonometry', bn: 'ত্রিকোণমিতি', icon: 'θ' },
  { id: 'statistics', en: 'Statistics', bn: 'পরিসংখ্যান', icon: 'σ' },
];

export const practiceLevels = [
  { value: 1 as const, en: 'Easy', bn: 'সহজ' },
  { value: 2 as const, en: 'Medium', bn: 'মাঝারি' },
  { value: 3 as const, en: 'Hard', bn: 'কঠিন' },
];

function arithmetic(level: 1 | 2 | 3): Question {
  if (level === 1) {
    const a = int(12, 49);
    const b = int(3, 19);
    return {
      id: uid(),
      topic: bi('Arithmetic', 'পাটিগণিত'),
      prompt: `${a} × ${b}`,
      answer: String(a * b),
      difficulty: level,
      hint: bi(`Split ${b} into tens and ones and add the two products.`, `${b}-কে দশক ও এককে ভাগ করে দুটি গুণফল যোগ করো।`),
      explanation: bi(`${a} × ${b} = ${a * b}`, `${a} × ${b} = ${a * b}`),
    };
  }
  if (level === 2) {
    const a = int(6, 15);
    const b = int(4, 12);
    const c = int(5, 40);
    return {
      id: uid(),
      topic: bi('Arithmetic', 'পাটিগণিত'),
      prompt: `${a}² + ${b} × ${c}`,
      answer: String(a * a + b * c),
      difficulty: level,
      hint: bi('Powers first, then multiplication, then addition.', 'আগে ঘাত, তারপর গুণ, শেষে যোগ।'),
      explanation: bi(`${a * a} + ${b * c} = ${a * a + b * c}`, `${a * a} + ${b * c} = ${a * a + b * c}`),
    };
  }
  const numerator = int(1, 5);
  const denominator = int(numerator + 1, 9);
  const other = int(2, 6);
  const lcm = (denominator * other) / gcd(denominator, other);
  const total = (numerator * (lcm / denominator) + lcm / other) / lcm;
  return {
    id: uid(),
    topic: bi('Fractions', 'ভগ্নাংশ'),
    prompt: `${numerator}/${denominator} + 1/${other}`,
    answer: simplifyFraction(numerator * (lcm / denominator) + lcm / other, lcm),
    difficulty: level,
    hint: bi('Take the LCM of the denominators first.', 'প্রথমে হরের লসাগু নাও।'),
    explanation: bi(
      `LCM = ${lcm}, so the sum is ${total}.`,
      `লসাগু = ${lcm}, তাই যোগফল ${total}।`,
    ),
  };
}

function algebra(level: 1 | 2 | 3): Question {
  if (level === 1) {
    const x = int(2, 15);
    const a = int(3, 20);
    return {
      id: uid(),
      topic: bi('Linear equations', 'রৈখিক সমীকরণ'),
      prompt: `x + ${a} = ${x + a}`,
      answer: String(x),
      difficulty: level,
      hint: bi('Subtract the same number from both sides.', 'উভয় পক্ষ থেকে একই সংখ্যা বিয়োগ করো।'),
      explanation: bi(`x = ${x + a} − ${a} = ${x}`, `x = ${x + a} − ${a} = ${x}`),
    };
  }
  if (level === 2) {
    const x = int(2, 12);
    const a = int(2, 9);
    const b = int(1, 20);
    return {
      id: uid(),
      topic: bi('Linear equations', 'রৈখিক সমীকরণ'),
      prompt: `${a}x + ${b} = ${a * x + b}`,
      answer: String(x),
      difficulty: level,
      hint: bi(`Subtract ${b}, then divide by ${a}.`, `${b} বিয়োগ করো, তারপর ${a} দিয়ে ভাগ করো।`),
      explanation: bi(
        `${a}x = ${a * x}, so x = ${x}`,
        `${a}x = ${a * x}, তাই x = ${x}`,
      ),
    };
  }
  const root1 = int(1, 6);
  const root2 = int(root1 + 1, 9);
  const b = -(root1 + root2);
  const c = root1 * root2;
  return {
    id: uid(),
    topic: bi('Quadratic equations', 'দ্বিঘাত সমীকরণ'),
    prompt: `x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + ${c} = 0   (larger root)`,
    answer: String(root2),
    difficulty: level,
    hint: bi('Look for two numbers that multiply to c and add to −b.', 'দুটি সংখ্যা খোঁজো যাদের গুণফল c আর যোগফল −b।'),
    explanation: bi(
      `(x − ${root1})(x − ${root2}) = 0, so the larger root is ${root2}.`,
      `(x − ${root1})(x − ${root2}) = 0, তাই বড় বীজ ${root2}।`,
    ),
  };
}

function percentage(level: 1 | 2 | 3): Question {
  if (level === 1) {
    const percent = [10, 20, 25, 50][int(0, 3)];
    const base = int(4, 40) * 10;
    return {
      id: uid(),
      topic: bi('Percentage', 'শতকরা'),
      prompt: `${percent}% of ${base}`,
      answer: String((percent / 100) * base),
      difficulty: level,
      hint: bi(`${percent}% means ${percent}/100.`, `${percent}% মানে ${percent}/100।`),
      explanation: bi(
        `${percent}/100 × ${base} = ${(percent / 100) * base}`,
        `${percent}/100 × ${base} = ${(percent / 100) * base}`,
      ),
    };
  }
  if (level === 2) {
    const price = int(3, 20) * 50;
    const discount = [10, 15, 20, 25][int(0, 3)];
    return {
      id: uid(),
      topic: bi('Discount', 'ছাড়'),
      prompt: `A book costs ₹${price}. After a ${discount}% discount, what is the price?`,
      answer: clean(price * (1 - discount / 100)),
      difficulty: level,
      hint: bi('Pay (100 − discount)% of the marked price.', 'চিহ্নিত মূল্যের (১০০ − ছাড়)% দাও।'),
      explanation: bi(
        `${price} × ${1 - discount / 100} = ${clean(price * (1 - discount / 100))}`,
        `${price} × ${1 - discount / 100} = ${clean(price * (1 - discount / 100))}`,
      ),
    };
  }
  const finalPrice = int(4, 20) * 50;
  const discount = [20, 25, 40][int(0, 2)];
  const original = finalPrice / (1 - discount / 100);
  return {
    id: uid(),
    topic: bi('Reverse percentage', 'বিপরীত শতকরা'),
    prompt: `After a ${discount}% discount a shirt costs ₹${finalPrice}. What was the original price?`,
    answer: clean(original),
    difficulty: level,
    hint: bi('The final price is (100 − discount)% of the original.', 'চূড়ান্ত মূল্য মূল দামের (১০০ − ছাড়)%।'),
    explanation: bi(
      `Original = ${finalPrice} / ${1 - discount / 100} = ${clean(original)}`,
      `মূল দাম = ${finalPrice} / ${1 - discount / 100} = ${clean(original)}`,
    ),
  };
}

function geometry(level: 1 | 2 | 3): Question {
  if (level === 1) {
    const l = int(4, 15);
    const b = int(3, 12);
    return {
      id: uid(),
      topic: bi('Area', 'ক্ষেত্রফল'),
      prompt: `Area of a rectangle with length ${l} cm and breadth ${b} cm`,
      answer: String(l * b),
      difficulty: level,
      hint: bi('A = length × breadth', 'A = দৈর্ঘ্য × প্রস্থ'),
      explanation: bi(`${l} × ${b} = ${l * b} cm²`, `${l} × ${b} = ${l * b} বর্গসেমি`),
    };
  }
  if (level === 2) {
    const r = int(2, 10);
    return {
      id: uid(),
      topic: bi('Circle', 'বৃত্ত'),
      prompt: `Area of a circle with radius ${r} cm  (use π ≈ 3.14)`,
      answer: clean(3.14 * r * r),
      difficulty: level,
      hint: bi('A = πr²', 'A = πr²'),
      explanation: bi(
        `3.14 × ${r}² = ${clean(3.14 * r * r)} cm²`,
        `3.14 × ${r}² = ${clean(3.14 * r * r)} বর্গসেমি`,
      ),
    };
  }
  const r = int(2, 7);
  const h = int(5, 15);
  return {
    id: uid(),
    topic: bi('Volume', 'আয়তন'),
    prompt: `Volume of a cylinder with radius ${r} cm and height ${h} cm  (use π ≈ 3.14)`,
    answer: clean(3.14 * r * r * h),
    difficulty: level,
    hint: bi('V = πr²h', 'V = πr²h'),
    explanation: bi(
      `3.14 × ${r}² × ${h} = ${clean(3.14 * r * r * h)} cm³`,
      `3.14 × ${r}² × ${h} = ${clean(3.14 * r * r * h)} ঘনসেমি`,
    ),
  };
}

const TRIG_VALUES: { angle: number; sin: string; cos: string; tan: string }[] = [
  { angle: 0, sin: '0', cos: '1', tan: '0' },
  { angle: 30, sin: '1/2', cos: '√3/2', tan: '√3/3' },
  { angle: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
  { angle: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
  { angle: 90, sin: '1', cos: '0', tan: 'undefined' },
];

function trigonometry(level: 1 | 2 | 3): Question {
  const entry = TRIG_VALUES[int(level === 3 ? 1 : 0, level === 1 ? 3 : 4)];
  const fn = (['sin', 'cos', 'tan'] as const)[int(0, 2)];
  const answer = entry[fn];
  if (answer === 'undefined') return trigonometry(1);
  return {
    id: uid(),
    topic: bi('Trigonometry', 'ত্রিকোণমিতি'),
    prompt: `${fn} ${entry.angle}°`,
    answer,
    difficulty: level,
    hint: bi('Recall the exact-value table for standard angles.', 'প্রমিত কোণের সঠিক মানের সারণি মনে করো।'),
    explanation: bi(
      `${fn} ${entry.angle}° = ${answer}`,
      `${fn} ${entry.angle}° = ${answer}`,
    ),
  };
}

function statistics(level: 1 | 2 | 3): Question {
  const count = level === 1 ? 4 : level === 2 ? 5 : 6;
  const values = Array.from({ length: count }, () => int(2, 24));
  const sum = values.reduce((a, b) => a + b, 0);
  const sorted = [...values].sort((a, b) => a - b);
  const median =
    count % 2 === 1 ? sorted[(count - 1) / 2] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;

  if (level === 3) {
    return {
      id: uid(),
      topic: bi('Median', 'মধ্যমান'),
      prompt: `Median of ${values.join(', ')}`,
      answer: clean(median),
      difficulty: level,
      hint: bi('Sort the values first, then take the middle one.', 'আগে সাজাও, তারপর মাঝের মান নাও।'),
      explanation: bi(
        `Sorted: ${sorted.join(', ')} → median ${clean(median)}`,
        `সাজিয়ে: ${sorted.join(', ')} → মধ্যমান ${clean(median)}`,
      ),
    };
  }

  return {
    id: uid(),
    topic: bi('Mean', 'গড়'),
    prompt: `Mean of ${values.join(', ')}`,
    answer: clean(sum / count),
    difficulty: level,
    hint: bi('Add all the values, then divide by how many there are.', 'সব মান যোগ করো, তারপর সংখ্যা দিয়ে ভাগ করো।'),
    explanation: bi(
      `(${values.join(' + ')}) / ${count} = ${clean(sum / count)}`,
      `(${values.join(' + ')}) / ${count} = ${clean(sum / count)}`,
    ),
  };
}

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

function simplifyFraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}

export function generateQuestion(topic: PracticeTopic, level: 1 | 2 | 3): Question {
  switch (topic) {
    case 'arithmetic':
      return arithmetic(level);
    case 'algebra':
      return algebra(level);
    case 'percentage':
      return percentage(level);
    case 'geometry':
      return geometry(level);
    case 'trigonometry':
      return trigonometry(level);
    case 'statistics':
      return statistics(level);
    default:
      return arithmetic(level);
  }
}
