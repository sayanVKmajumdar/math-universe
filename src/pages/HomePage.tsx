import { useMemo, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { href, navigate } from '@/lib/router';
import { setPendingProblem } from '@/lib/pending';
import { pick, type Accent } from '@/lib/types';
import { categories } from '@/data/categories';
import { allFormulas, formulaCategories, totalFormulaCount } from '@/data/formulas';
import { chapterCount } from '@/data/chapters';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/SectionHeading';
import { FormulaCard } from '@/components/FormulaCard';
import {
  IconArrowRight,
  IconBook,
  IconBulb,
  IconCalculator,
  IconChart,
  IconCheck,
  IconCopy,
  IconLayers,
  IconSearch,
  IconShuffle,
  IconSparkles,
  IconTarget,
} from '@/components/icons';

const ACCENT_GRADIENT: Record<Accent, string> = {
  teal: 'linear-gradient(140deg,#0b6f69,#24b3a8)',
  indigo: 'linear-gradient(140deg,#32327a,#5b5bd6)',
  gold: 'linear-gradient(140deg,#8f6914,#e0b148)',
  rose: 'linear-gradient(140deg,#8f2849,#d95c85)',
  emerald: 'linear-gradient(140deg,#20654a,#54a97c)',
  slate: 'linear-gradient(140deg,#2f3b4c,#6b7b91)',
};

const FEATURES = [
  {
    icon: IconBook,
    titleKey: 'home.feature.notes.title',
    descKey: 'home.feature.notes.desc',
    to: href('secondary', 9),
    accent: 'text-indigo-500 bg-indigo-500/10',
  },
  {
    icon: IconLayers,
    titleKey: 'home.feature.formulas.title',
    descKey: 'home.feature.formulas.desc',
    to: href('formulas'),
    accent: 'text-brand bg-brand/10',
  },
  {
    icon: IconCalculator,
    titleKey: 'home.feature.solver.title',
    descKey: 'home.feature.solver.desc',
    to: href('solver'),
    accent: 'text-gold bg-gold/10',
  },
  {
    icon: IconTarget,
    titleKey: 'home.feature.practice.title',
    descKey: 'home.feature.practice.desc',
    to: href('practice'),
    accent: 'text-rose-500 bg-rose-500/10',
  },
] as const;

export function HomePage() {
  const { t, lang } = useApp();
  const [query, setQuery] = useState('');
  const [spotlight, setSpotlight] = useState(() => Math.floor(Math.random() * allFormulas.length));
  const [copied, setCopied] = useState(false);

  const formula = allFormulas[spotlight % allFormulas.length];
  const category = useMemo(
    () => formulaCategories.find((item) => item.id === formula.category) ?? formulaCategories[0],
    [formula.category],
  );

  const startSolve = () => {
    if (!query.trim()) {
      navigate(href('solver'));
      return;
    }
    setPendingProblem(query.trim());
    navigate(href('solver'));
  };

  const copySpotlight = async () => {
    try {
      await navigator.clipboard.writeText(formula.expr);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="hero-panel absolute inset-0" />
        <div className="hero-grid absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { glyph: '∑', style: { top: '14%', left: '5%', fontSize: '78px' } },
            { glyph: '∫', style: { top: '58%', left: '9%', fontSize: '64px', animationDelay: '2.4s' } },
            { glyph: 'π', style: { top: '12%', right: '44%', fontSize: '52px', animationDelay: '4s' } },
            { glyph: '√', style: { bottom: '12%', right: '6%', fontSize: '70px', animationDelay: '1.2s' } },
            { glyph: 'θ', style: { top: '42%', right: '2%', fontSize: '58px', animationDelay: '3.2s' } },
            { glyph: '∞', style: { bottom: '6%', left: '42%', fontSize: '60px', animationDelay: '5s' } },
          ].map((item, index) => (
            <span key={index} className="float-glyph" style={item.style}>
              {item.glyph}
            </span>
          ))}
        </div>

        <div className="container-x relative py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11.5px] font-medium text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {t('home.badge')}
              </span>

              <h1
                className={cn(
                  'mt-5 text-balance font-serif text-[42px] font-semibold leading-[1.04] tracking-tight text-white sm:text-[56px] lg:text-[62px]',
                  lang === 'bn' && 'font-bn leading-[1.25]',
                )}
              >
                {t('home.heroTitle1')}
                <span className="block text-gold italic">{t('home.heroTitle2')}</span>
              </h1>

              <p
                className={cn(
                  'mt-4 max-w-xl text-pretty text-[14.5px] leading-relaxed text-white/70 sm:text-[15.5px]',
                  lang === 'bn' && 'font-bn',
                )}
              >
                {t('home.heroSub')}
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  startSolve();
                }}
                className="mt-7 flex max-w-xl items-center gap-1.5 rounded-2xl border border-white/15 bg-white/95 p-1.5 shadow-2xl shadow-black/25 backdrop-blur"
              >
                <span className="pl-2.5 text-[#5c6b81]">
                  <IconSearch size={17} />
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('home.heroSearch')}
                  aria-label={t('home.heroSearch')}
                  className="math h-10 min-w-0 flex-1 bg-transparent text-[13.5px] text-[#16233a] outline-none placeholder:font-sans placeholder:text-[#7a879b] sm:text-sm"
                />
                <button
                  type="submit"
                  className="btn btn-gold h-10 gap-1.5 rounded-xl px-4 text-[13px]"
                >
                  <IconSparkles size={15} />
                  {t('home.solve')}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px]">
                <span className="text-white/45">{lang === 'bn' ? 'জনপ্রিয়:' : 'Popular:'}</span>
                {['algebra', 'calculus', 'geometry', 'trigonometry'].map((id) => {
                  const item = formulaCategories.find((category) => category.id === id);
                  if (!item) return null;
                  return (
                    <a
                      key={id}
                      href={href('formulas', id)}
                      className="rounded-full border border-white/15 px-2.5 py-1 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                    >
                      {pick(item.name, lang)}
                    </a>
                  );
                })}
              </div>

              <dl className="mt-9 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {[
                  { value: `${totalFormulaCount}`, label: t('home.stat.formulas') },
                  { value: `${chapterCount}`, label: t('home.stat.chapters') },
                  { value: '6', label: t('home.stat.practice') },
                  { value: '2', label: t('home.stat.languages') },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-serif text-2xl font-semibold text-white">{stat.value}</dt>
                    <dd className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-white/45">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* preview card */}
            <div className="relative mx-auto hidden w-full max-w-md lg:block">
              <div className="absolute -inset-8 rounded-[2.5rem] bg-white/5 blur-3xl" />
              <div className="animate-fade-up relative rotate-[1.2deg] rounded-2xl border border-white/15 bg-[#fffdf8] p-4 text-[#16233a] shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between gap-2 border-b border-[#e6dfd2] pb-2.5">
                  <span className="rounded-full bg-[#0f8b83]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b6f69]">
                    {pick({ en: 'Quadratic equation', bn: 'দ্বিঘাত সমীকরণ' }, lang)}
                  </span>
                  <span className="math text-[11px] text-[#7a879b]">2x² − 5x + 3 = 0</span>
                </div>
                <div className="py-3.5">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#8a95a8]">
                    {t('solver.answer')}
                  </p>
                  <p className="math mt-1 text-[21px] font-semibold text-[#0b6f69]">x = 1 or x = 3/2</p>
                </div>
                <div className="space-y-2 border-t border-[#e6dfd2] pt-3">
                  {[
                    { n: 1, text: 'D = (−5)² − 4(2)(3) = 1' },
                    { n: 2, text: 'x = (5 ± √1) / 4' },
                    { n: 3, text: 'x = 6/4 or x = 4/4' },
                  ].map((step) => (
                    <div key={step.n} className="flex items-center gap-2.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0f8b83]/12 text-[9.5px] font-bold text-[#0b6f69]">
                        {step.n}
                      </span>
                      <span className="math truncate text-[11.5px] text-[#45536a]">{step.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg border border-[#e6dfd2] bg-[#f7f4ed] px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#45536a]">
                    <IconCheck size={12} className="text-[#0f8b83]" />
                    {t('solver.offline')}
                  </span>
                  <span className="math text-[10px] text-[#8a95a8]">MathUniverse</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 rotate-[-3deg] rounded-xl border border-white/20 bg-[#10233c]/90 px-3 py-2 text-[11px] text-white/85 shadow-xl backdrop-blur">
                <IconBulb size={13} className="mr-1 inline text-gold" />
                {lang === 'bn' ? 'প্রতিটি ধাপ ব্যাখ্যা করা' : 'Every step explained'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- categories ---------------------------- */}
      <section id="categories" className="container-x py-14 sm:py-16">
        <SectionHeading
          eyebrow={lang === 'bn' ? 'স্তর' : 'Levels'}
          title={t('home.categories.title')}
          description={t('home.categories.desc')}
          action={
            <a href={href('formulas')} className="btn btn-outline">
              {t('common.viewAll')}
              <IconArrowRight size={15} />
            </a>
          }
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <a
              key={item.id}
              href={item.to}
              className="card card-hover group overflow-hidden"
            >
              <div className="relative h-[104px] overflow-hidden px-4 py-3.5 text-white" style={{ background: ACCENT_GRADIENT[item.accent] }}>
                <span className="pointer-events-none absolute -right-2 -top-4 font-serif text-[86px] leading-none text-white/15">
                  {item.emoji}
                </span>
                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]">
                  {pick(item.level, lang)}
                </span>
                <p className={cn('mt-2.5 font-serif text-[19px] font-semibold leading-tight', lang === 'bn' && 'font-bn text-[17px]')}>
                  {pick(item.title, lang)}
                </p>
              </div>
              <div className="p-4">
                <p className={cn('text-[12.5px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                  {pick(item.desc, lang)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.topics.slice(0, 3).map((topic) => (
                    <span key={topic.en} className={cn('chip', lang === 'bn' && 'font-bn')}>
                      {pick(topic, lang)}
                    </span>
                  ))}
                </div>
                <span className="mt-3.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-brand">
                  {t('home.categories.start')}
                  <IconArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ----------------------------- features ----------------------------- */}
      <section className="border-y border-line bg-surface2/40">
        <div className="container-x py-14 sm:py-16">
          <SectionHeading
            eyebrow={lang === 'bn' ? 'সরঞ্জাম' : 'Toolkit'}
            title={t('home.features.title')}
            description={t('home.features.desc')}
            align="center"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <a key={feature.titleKey} href={feature.to} className="card card-hover group p-5">
                  <span className={cn('grid h-10 w-10 place-items-center rounded-xl', feature.accent)}>
                    <Icon size={19} />
                  </span>
                  <h3 className={cn('mt-3.5 font-sans text-[14.5px] font-semibold', lang === 'bn' && 'font-bn')}>
                    {t(feature.titleKey)}
                  </h3>
                  <p className={cn('mt-1 text-[12.5px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                    {t(feature.descKey)}
                  </p>
                  <span className="mt-3 flex items-center gap-1 text-[11.5px] font-semibold text-brand">
                    {t('common.tryIt')}
                    <IconArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------- spotlight ---------------------------- */}
      <section className="container-x py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={lang === 'bn' ? 'আজকের সূত্র' : 'Daily formula'}
              title={t('home.spotlight.title')}
              description={t('home.spotlight.desc')}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSpotlight((value) => (value + 1 + Math.floor(Math.random() * 7)) % allFormulas.length)}
                className="btn btn-outline"
              >
                <IconShuffle size={14} />
                {t('home.spotlight.random')}
              </button>
              <a href={href('formulas', formula.category)} className="btn btn-ghost">
                {pick(category.name, lang)}
                <IconArrowRight size={14} />
              </a>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: IconChart, value: `${totalFormulaCount}+`, label: t('home.stat.formulas') },
                { icon: IconBook, value: `${chapterCount}`, label: t('home.stat.chapters') },
                { icon: IconTarget, value: '6', label: lang === 'bn' ? 'অনুশীলন বিষয়' : 'practice topics' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="card p-3.5">
                    <Icon size={15} className="text-brand" />
                    <p className="mt-2 font-serif text-xl font-semibold">{stat.value}</p>
                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[1.6rem] bg-brand/5 blur-xl" />
            <div className="card relative overflow-hidden p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{pick(category.name, lang)}</p>
                  <h3 className={cn('mt-1.5 text-xl font-semibold', lang === 'bn' && 'font-bn')}>
                    {pick(formula.name, lang)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={copySpotlight}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-ink"
                  aria-label={t('common.copy')}
                >
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </button>
              </div>
              <p className="math mt-4 rounded-xl border border-line bg-surface2/60 px-4 py-5 text-center text-[19px] leading-relaxed text-ink sm:text-[22px]">
                {formula.expr}
              </p>
              {formula.desc && (
                <p className={cn('mt-3 text-[13px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                  {pick(formula.desc, lang)}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="chip">
                  <IconSparkles size={11} />
                  {lang === 'bn' ? 'সূত্র #' : 'Formula #'}
                  {(spotlight % allFormulas.length) + 1}
                </span>
                <a href={href('formulas', formula.category)} className="text-[11.5px] font-semibold text-brand hover:underline">
                  {t('common.learnMore')} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- browse grid ---------------------------- */}
      <section className="container-x pb-16">
        <SectionHeading
          eyebrow={lang === 'bn' ? 'লাইব্রেরি' : 'Library'}
          title={lang === 'bn' ? 'বিষয় অনুযায়ী সূত্র' : 'Formulas by topic'}
          description={
            lang === 'bn'
              ? 'সবকিছু এক জায়গায় — যেকোনো কার্ডে ট্যাপ করে কপি করুন।'
              : 'Everything in one place — tap any card to copy it.'
          }
          action={
            <a href={href('formulas')} className="btn btn-outline">
              {t('common.viewAll')}
              <IconArrowRight size={15} />
            </a>
          }
        />
        <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {allFormulas
            .filter((_, index) => [0, 3, 8, 19, 29, 43, 58, 71, 84].includes(index))
            .slice(0, 6)
            .map((item) => {
              const accent = formulaCategories.find((entry) => entry.id === item.category)?.accent ?? 'teal';
              return (
                <FormulaCard
                  key={`${item.category}-${item.id}`}
                  formula={item}
                  accent={accent}
                  categoryName={pick(item.categoryName, lang)}
                />
              );
            })}
        </div>
      </section>

      {/* -------------------------------- CTA ------------------------------- */}
      <section className="container-x pb-4">
        <div className="hero-panel relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="eyebrow text-gold">{lang === 'bn' ? 'সমাধানকারী' : 'Solver'}</p>
              <h2 className={cn('mt-2 font-serif text-[27px] font-semibold text-white sm:text-[32px]', lang === 'bn' && 'font-bn')}>
                {t('home.cta.title')}
              </h2>
              <p className={cn('mt-2 text-[13.5px] leading-relaxed text-white/70', lang === 'bn' && 'font-bn')}>
                {t('home.cta.desc')}
              </p>
            </div>
            <a href={href('solver')} className="btn btn-gold shrink-0 rounded-xl px-5 py-3">
              <IconCalculator size={16} />
              {t('home.cta.btn')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
