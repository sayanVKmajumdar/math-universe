import { useMemo, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { href } from '@/lib/router';
import { pick, type Accent } from '@/lib/types';
import { formulaCategories } from '@/data/formulas';
import { cn } from '@/lib/utils';
import { FormulaCard } from '@/components/FormulaCard';
import { IconArrowLeft, IconClose, IconSearch } from '@/components/icons';

export function FormulasPage({ param }: { param?: string }) {
  const { t, lang } = useApp();
  const [query, setQuery] = useState('');

  const activeId = formulaCategories.some((category) => category.id === param) ? param : undefined;
  const activeCategory = formulaCategories.find((category) => category.id === activeId);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term) {
      return formulaCategories.flatMap((category) =>
        category.formulas
          .filter((formula) => {
            const haystack = [
              formula.name.en,
              formula.name.bn,
              formula.expr,
              formula.desc?.en ?? '',
              formula.desc?.bn ?? '',
              category.name.en,
              category.name.bn,
            ]
              .join(' ')
              .toLowerCase();
            return haystack.includes(term);
          })
          .map((formula) => ({ formula, category })),
      );
    }
    if (activeCategory) {
      return activeCategory.formulas.map((formula) => ({ formula, category: activeCategory }));
    }
    return formulaCategories.flatMap((category) =>
      category.formulas.map((formula) => ({ formula, category })),
    );
  }, [activeCategory, query]);

  const grouped = !query.trim() && !activeCategory;
  const count = results.length;

  return (
    <div>
      <section className="border-b border-line bg-surface2/40">
        <div className="container-x py-9 sm:py-11">
          <a
            href={href('home')}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
          >
            <IconArrowLeft size={13} />
            {t('common.backHome')}
          </a>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{lang === 'bn' ? 'রেফারেন্স' : 'Reference'}</p>
              <h1 className={cn('mt-1.5 text-balance font-serif text-[34px] font-semibold sm:text-[42px]', lang === 'bn' && 'font-bn text-[30px]')}>
                {t('formulas.title')}
              </h1>
              <p className={cn('mt-2 max-w-xl text-pretty text-[14px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                {t('formulas.desc')}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('formulas.search')}
                aria-label={t('formulas.search')}
                className="field h-10 pl-9 pr-9 text-[13px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
                  aria-label={t('common.clear')}
                >
                  <IconClose size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container-x">
          <div className="no-scrollbar -mb-px flex gap-1 overflow-x-auto pb-0">
            <a
              href={href('formulas')}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-[12.5px] font-medium transition-colors',
                !activeCategory && !query
                  ? 'border-brand text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t('common.all')}
            </a>
            {formulaCategories.map((category) => (
              <a
                key={category.id}
                href={href('formulas', category.id)}
                onClick={() => setQuery('')}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-[12.5px] font-medium transition-colors',
                  activeCategory?.id === category.id
                    ? 'border-brand text-ink'
                    : 'border-transparent text-muted hover:text-ink',
                )}
              >
                <span className="math text-[11px] text-muted">{category.icon}</span>
                {pick(category.name, lang)}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x py-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted">
            {count} {t('formulas.count')}
            {query.trim() && ` · “${query.trim()}”`}
          </p>
          {activeCategory && (
            <p className={cn('hidden text-[12.5px] font-medium text-ink sm:block', lang === 'bn' && 'font-bn')}>
              {pick(activeCategory.name, lang)}
            </p>
          )}
        </div>

        {count === 0 && (
          <div className="card mt-4 px-6 py-14 text-center">
            <p className="font-serif text-lg">{t('formulas.empty')}</p>
            <button type="button" onClick={() => setQuery('')} className="btn btn-outline mt-4">
              {t('common.clear')}
            </button>
          </div>
        )}

        {grouped ? (
          <div className="mt-6 space-y-10">
            {formulaCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface2 font-serif text-[13px] text-muted">
                    {category.icon}
                  </span>
                  <h2 className={cn('font-serif text-[19px] font-semibold', lang === 'bn' && 'font-bn text-[17px]')}>
                    {pick(category.name, lang)}
                  </h2>
                  <span className="text-[11px] text-muted">({category.formulas.length})</span>
                  <a
                    href={href('formulas', category.id)}
                    className="ml-auto text-[11.5px] font-semibold text-brand hover:underline"
                  >
                    {t('common.viewAll')} →
                  </a>
                </div>
                <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {category.formulas.map((formula) => (
                    <FormulaCard
                      key={formula.id}
                      formula={formula}
                      accent={category.accent as Accent}
                      categoryName={pick(category.name, lang)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ formula, category }) => (
              <FormulaCard
                key={`${category.id}-${formula.id}`}
                formula={formula}
                accent={category.accent as Accent}
                categoryName={pick(category.name, lang)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
