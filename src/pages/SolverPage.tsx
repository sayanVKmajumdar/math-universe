import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { subscribePendingProblem, takePendingProblem } from '@/lib/pending';
import { keypadKeys, solverExamples } from '@/data/solver-examples';
import { solve, type SolveResult } from '@/solver';
import { cn } from '@/lib/utils';
import { SolutionCard } from '@/components/SolutionCard';
import {
  IconArrowRight,
  IconBulb,
  IconCheck,
  IconSparkles,
  IconTarget,
  IconTrash,
} from '@/components/icons';

const HISTORY_KEY = 'mu.solver.history';

const COVERS = [
  { en: 'Linear & quadratic equations', bn: 'রৈখিক ও দ্বিঘাত সমীকরণ', glyph: 'x²' },
  { en: 'Systems of equations', bn: 'সমীকরণজোট', glyph: '{' },
  { en: 'Derivatives & integrals', bn: 'অন্তরকলজ ও সমাকলন', glyph: '∫' },
  { en: 'Limits', bn: 'সীমা', glyph: 'lim' },
  { en: 'Exact trigonometry', bn: 'সঠিক ত্রিকোণমিতি', glyph: 'θ' },
  { en: 'Statistics & averages', bn: 'পরিসংখ্যান ও গড়', glyph: 'σ' },
  { en: 'AP / GP series', bn: 'সমান্তর / গুণোত্তর ধারা', glyph: 'Σ' },
  { en: 'Area, volume & surface', bn: 'ক্ষেত্রফল, আয়তন ও পৃষ্ঠ', glyph: '△' },
  { en: 'Factors, LCM & GCD', bn: 'উৎপাদক, লসাগু ও গসাগু', glyph: '%' },
  { en: 'Matrices & determinants', bn: 'ম্যাট্রিক্স ও নির্ণায়ক', glyph: '⊞' },
];

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function SolverPage() {
  const { t, lang, recordSolve } = useApp();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SolveResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>(readHistory);
  const [initialPending] = useState<string | null>(() => takePendingProblem());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);

  const run = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setBusy(true);
    setResult(null);
    window.setTimeout(() => {
      const outcome = solve(value);
      setResult(outcome);
      if (outcome.ok) recordSolve();
      setHistory((previous) => [value, ...previous.filter((item) => item !== value)].slice(0, 6));
      setBusy(false);
      if (window.innerWidth < 1024) {
        window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      }
    }, 260);
  };

  // A problem handed over from search, a chapter or the home page before the
  // page mounted.
  useEffect(() => {
    if (!initialPending) return;
    setInput(initialPending);
    setBusy(true);
    const timeout = window.setTimeout(() => {
      const outcome = solve(initialPending);
      setResult(outcome);
      if (outcome.ok) recordSolve();
      setHistory((previous) => [initialPending, ...previous.filter((item) => item !== initialPending)].slice(0, 6));
      setBusy(false);
    }, 300);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPending]);

  // …and while the solver is already open, e.g. a result tapped in search.
  useEffect(
    () =>
      subscribePendingProblem((value) => {
        setInput(value);
        run(value);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const insert = (text: string) => {
    const element = textareaRef.current;
    if (!element) {
      setInput((value) => value + text);
      return;
    }
    const start = element.selectionStart ?? input.length;
    const end = element.selectionEnd ?? input.length;
    const next = input.slice(0, start) + text + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      element.focus();
      const cursor = start + text.length;
      element.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div>
      <section className="border-b border-line bg-surface2/40">
        <div className="container-x py-9 sm:py-11">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{lang === 'bn' ? 'গণনা' : 'Compute'}</p>
              <h1 className={cn('mt-1.5 font-serif text-[34px] font-semibold sm:text-[42px]', lang === 'bn' && 'font-bn text-[30px]')}>
                {t('solver.title')}
              </h1>
              <p className={cn('mt-2 max-w-2xl text-pretty text-[14px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                {t('solver.desc')}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/30 bg-brand/8 px-3 py-1.5 text-[11.5px] font-semibold text-brand">
              <IconCheck size={12} />
              {t('solver.offline')}
            </span>
          </div>
        </div>
      </section>

      <div className="container-x py-7">
        <div className="grid gap-5 lg:grid-cols-[1.62fr_1fr] lg:items-start">
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-surface2/40 px-4 py-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  {t('solver.yourProblem')}
                </p>
              </div>
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      run(input);
                    }
                  }}
                  rows={3}
                  spellCheck={false}
                  placeholder={t('solver.placeholder')}
                  aria-label={t('solver.yourProblem')}
                  className="math field min-h-[92px] resize-y bg-surface2/40 text-[14px] leading-relaxed placeholder:font-sans placeholder:text-[12.5px]"
                />

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {keypadKeys.map((key) => (
                    <button
                      key={key.label}
                      type="button"
                      onClick={() => insert(key.insert)}
                      className="grid h-7 min-w-7 place-items-center rounded-md border border-line bg-surface px-1.5 font-mono text-[11.5px] text-muted transition-colors hover:border-brand/40 hover:text-ink"
                    >
                      {key.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInput('');
                      setResult(null);
                    }}
                    className="btn btn-ghost h-9 px-2.5 text-[12.5px]"
                  >
                    {t('common.clear')}
                  </button>
                  <button
                    type="button"
                    onClick={() => run(input)}
                    disabled={busy || !input.trim()}
                    className="btn btn-primary h-10 px-5"
                  >
                    {busy ? <span className="spinner" /> : <IconSparkles size={15} />}
                    {busy ? t('solver.solving') : t('solver.solve')}
                  </button>
                </div>
              </div>
            </div>

            <div ref={resultRef} className="scroll-mt-24">
              {busy && (
                <div className="card flex items-center gap-3 px-4 py-5">
                  <span className="spinner text-brand" />
                  <div>
                    <p className="text-[13.5px] font-semibold">{t('solver.solving')}</p>
                    <p className="text-[12px] text-muted">{lang === 'bn' ? 'ধাপগুলো সাজানো হচ্ছে…' : 'Putting the steps together…'}</p>
                  </div>
                </div>
              )}

              {!busy && result?.ok && <SolutionCard solution={result.solution} />}

              {!busy && result && !result.ok && (
                <div className="card border-rose-500/25 p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
                      <IconBulb size={17} />
                    </span>
                    <div>
                      <h2 className="font-serif text-[18px] font-semibold">
                        {lang === 'bn' ? result.error.bn : result.error.en}
                      </h2>
                      {result.hint && (
                        <p className={cn('mt-1 text-[13px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                          {lang === 'bn' ? result.hint.bn : result.hint.en}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {solverExamples.slice(0, 4).map((example) => (
                      <button
                        key={example.expr}
                        type="button"
                        onClick={() => {
                          setInput(example.expr);
                          run(example.expr);
                        }}
                        className="chip transition-colors hover:border-brand/50 hover:text-ink"
                      >
                        {example.expr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!busy && !result && (
                <div className="card overflow-hidden">
                  <div className="hero-panel relative px-5 py-7 text-white">
                    <div className="hero-grid absolute inset-0 opacity-50" />
                    <div className="relative">
                      <p className="font-serif text-[52px] leading-none text-white/20">∫</p>
                      <p className="mt-1 text-[13.5px] font-medium text-white/85">{t('solver.empty')}</p>
                      <p className={cn('mt-1 text-[12px] leading-relaxed text-white/55', lang === 'bn' && 'font-bn')}>
                        {t('solver.localNote')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('solver.examples')}</p>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {solverExamples.slice(0, 8).map((example) => (
                        <button
                          key={example.expr}
                          type="button"
                          onClick={() => {
                            setInput(example.expr);
                            run(example.expr);
                          }}
                          className="group flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-left transition-colors hover:border-brand/50 hover:bg-surface2/60"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                              {example.label}
                            </span>
                            <span className="math block truncate text-[11.5px] text-ink">{example.expr}</span>
                          </span>
                          <IconArrowRight
                            size={12}
                            className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('solver.covers')}</p>
              <ul className="mt-2.5 grid gap-1.5">
                {COVERS.map((item) => (
                  <li key={item.en} className="flex items-center gap-2.5 text-[12.5px] text-muted">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line bg-surface2 font-mono text-[10px] text-ink">
                      {item.glyph}
                    </span>
                    <span className={cn(lang === 'bn' && 'font-bn')}>{lang === 'bn' ? item.bn : item.en}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  <IconTarget size={12} className="text-brand" />
                  {t('solver.history')}
                </p>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-rose-500"
                  >
                    <IconTrash size={11} />
                    {t('common.clear')}
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className={cn('mt-2 text-[12px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                  {t('solver.historyEmpty')}
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {history.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => {
                          setInput(item);
                          run(item);
                        }}
                        className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface2"
                      >
                        <span className="math min-w-0 flex-1 truncate text-[11.5px] text-muted group-hover:text-ink">
                          {item}
                        </span>
                        <IconArrowRight size={12} className="shrink-0 text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-gold/25 bg-gold/8 p-4">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                <IconBulb size={14} className="text-gold" />
                {lang === 'bn' ? 'টাইপ করার টিপস' : 'Typing tips'}
              </p>
              <ul className={cn('mt-2 space-y-1 text-[11.5px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                {(lang === 'bn'
                  ? ['সূচক লিখতে ^ ব্যবহার করুন — x^2', 'ডিগ্রি দিতে ° দিন — sin 30°', 'সীমার জন্য lim x→0', 'অন্তরকলনের জন্য d/dx(...)']
                  : ['Use ^ for powers — x^2', 'Add ° for degrees — sin 30°', 'Limits: lim x→0', 'Derivatives: d/dx(...)']
                ).map((line) => (
                  <li key={line} className="math text-[11px]">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
