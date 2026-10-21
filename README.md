# 🎓 MathUniverse

> Complete mathematics from Class 1 to 12 — chapter notes, a searchable formula library, a step-by-step solver and unlimited practice. In English and বাংলা.

[![Live Demo](https://img.shields.io/badge/Live-Demo-teal?style=for-the-badge)](https://sayanvkmajumdar.github.io/math-universe)
[![Deploy](https://github.com/sayanVKmajumdar/math-universe/actions/workflows/deploy.yml/badge.svg)](https://github.com/sayanVKmajumdar/math-universe/actions/workflows/deploy.yml)

---

## What this is

A single-page mathematics companion for school students — rebuilt from the original single-file prototype into a typed, component-based application. It has **no backend, no accounts and no API keys**: every calculation happens in your browser, and your progress never leaves the device.

### Highlights

| | |
| --- | --- |
| 📋 **Formula library** | 95+ formulas across eight shelves — algebra, trigonometry, calculus, geometry, coordinate geometry, statistics & probability, matrices, sequences & number theory. Search across names (English *and* Bengali), expressions and descriptions; tap a card to copy. |
| 🧮 **Step-by-step solver** | A real computer-algebra engine written for this project: tokeniser → parser → evaluator, with symbolic differentiation, integration, limits and polynomial algebra. Every answer comes with numbered working. |
| ✏️ **Endless practice** | Six topics × three difficulty levels, generated fresh each time. Instant checking (fractions and decimals both accepted), a streak counter and a best-streak record. |
| 📚 **Class 9–10 chapters** | The West Bengal Board syllabus split into 16 chapters with topics, video/problem counts and a sample question that opens straight in the solver. |
| 🌐 **Bilingual** | Every label, description, chapter, formula name and practice hint exists in English and Bengali. One tap switches the whole interface. |
| 🌙 **Light & dark** | A warm paper palette and a deep navy palette, remembered between visits. |
| 📴 **Works offline** | No network calls at runtime; the build is a single self-contained HTML file. |

---

## The solver

Type a problem in the input box — or arrive from a chapter, the search dialog, or the home page.

| Input | Answer |
| --- | --- |
| `2x² − 5x + 3 = 0` | `x = 3/2 or x = 1` — with discriminant, surd form and factorisation |
| `2x + 3y = 12, x − y = 1` | `x = 3, y = 2` — elimination steps |
| `d/dx(x³ sin x)` | product rule, then a simplified derivative |
| `∫(3x² + 2x)dx` | `x³ + x² + C` |
| `lim x→0 sin(x)/x` | `1` — via L'Hôpital |
| `sin 30°` | `1/2` — exact value with quadrant reasoning |
| `area of circle r = 7` | `49π ≈ 153.938` |
| `mean of 4, 8, 6, 10` | `x̄ = 7` |
| `AP: 3, 7, 11 10th term` | `aₙ = 39` |
| `gcd(24, 36)`, `lcm(4, 6)` | `12` |
| `det [[2,3],[1,4]]` | `5` |
| `10C3`, `5!` | `120` |
| `2 + 3 × 4² − 8 ÷ 2` | `46` — BODMAS, step by step |

**Supported:** linear and quadratic equations, higher-degree equations with integer roots, two-variable linear systems, simplification and expansion, exact rational arithmetic, derivatives (product/quotient/chain rules), indefinite integrals, limits (direct substitution, cancellation, L'Hôpital, limits at infinity), exact trigonometry, statistics, AP/GP, percentages, mensuration, prime factorisation, GCD/LCM, factorials, permutations/combinations, determinants and inverses.

**Typing tips**

- Powers: `x^2` or `x²`
- Degrees: `sin 30°`
- Limits: `lim x→0 sin(x)/x`
- Derivatives: `d/dx(...)`, `derivative of ...`
- Integrals: `∫(...)dx`, or `integrate ... dx`
- Fractions are exact: `1/3 + 1/6 = 1/2`

---

## Tech stack

- **React 19** + **TypeScript 5.9** (strict)
- **Vite 7** with `vite-plugin-singlefile` — the production build is one portable `index.html`
- **Tailwind CSS 4** with design tokens in `src/index.css`
- Zero runtime dependencies beyond React, `clsx` and `tailwind-merge`

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/index.html (fully self-contained)
npm run preview
npm run typecheck  # tsc --noEmit
```

Node 20 or newer is recommended.

---

## Project layout

```
src/
├── data/          bilingual content: categories, formulas, chapters, practice generators
├── solver/        the math engine
│   ├── ast.ts         tokeniser, parser, evaluator, polynomials, diff/integrate
│   ├── rational.ts    exact fraction arithmetic
│   ├── handlers*.ts   one module per problem family
│   └── index.ts       dispatch + public solve() API
├── pages/         Home, Formulas, Solver, Practice, Secondary
├── components/    Header, Footer, SearchDialog, SolutionCard, Plot, FormulaCard…
├── lib/           app context, hash router, i18n, search index, helpers
└── index.css      design tokens, component classes, dark theme
```

### Editing content

| What | Where |
| --- | --- |
| Formulas | `src/data/formulas.ts` |
| Chapters and sample questions | `src/data/chapters.ts` |
| Practice question generators | `src/data/practice.ts` |
| Levels / category cards | `src/data/categories.ts` |
| Interface strings (EN + BN) | `src/lib/i18n.ts` |
| Colours and typography | `src/index.css` |

Adding a formula is one object: `{ id, name: { en, bn }, expr, desc?: { en, bn } }`.

---

## Deployment

The repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push to `main`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow type-checks, builds and publishes `dist/`.

Because the build is a single file with relative asset paths, it also works from any static host — or even opened directly from disk.

---

## A note on privacy

There is no analytics, no tracking, no remote calls. Solver history, theme, language and practice streaks live in `localStorage` and can be cleared from the practice page.

The previous single-file version of MathUniverse remains available in the repository's git history.

---

## License

Educational project — free to use and adapt for learning.
