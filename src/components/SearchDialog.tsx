import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { href } from '@/lib/router';
import { buildIndex, quickSearches, searchIndex, type SearchHit } from '@/lib/search';
import type { DictKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { IconArrowRight, IconClose, IconSearch, IconSparkles } from './icons';

const TYPE_LABEL: Record<SearchHit['type'], DictKey> = {
  formula: 'search.group.formulas',
  chapter: 'search.group.chapters',
  page: 'search.group.pages',
  level: 'search.group.categories',
};

const TYPE_MARK: Record<SearchHit['type'], string> = {
  formula: 'ƒx',
  chapter: '§',
  page: '↗',
  level: '◈',
};

export function SearchDialog({
  open,
  onClose,
  onSolve,
}: {
  open: boolean;
  onClose: () => void;
  onSolve: (query: string) => void;
}) {
  const { lang, t } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const index = useMemo(() => buildIndex(lang), [lang]);
  const hits = useMemo(() => searchIndex(index, query), [index, query]);

  const solveCandidate =
    query.trim().length > 1 &&
    (/[=+*/^√∫]/.test(query) || /d\/d|\blim\b|∫/i.test(query) || /^[\s\d.+\-*/^()x²³πθ]+$/i.test(query.trim()));
  const rows: ({ kind: 'hit'; hit: SearchHit } | { kind: 'solve' })[] = [
    ...(solveCandidate ? [{ kind: 'solve' as const }] : []),
    ...hits.map((hit) => ({ kind: 'hit' as const, hit })),
  ];

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setCursor(0);
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor((value) => Math.min(value + 1, Math.max(rows.length - 1, 0)));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor((value) => Math.max(value - 1, 0));
      } else if (event.key === 'Enter') {
        const row = rows[cursor];
        if (!row) return;
        event.preventDefault();
        if (row.kind === 'solve') {
          onSolve(query.trim());
        } else {
          window.location.hash = row.hit.to;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, rows, cursor, query, onSolve, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const activate = (hit: SearchHit) => {
    window.location.hash = hit.to;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(6,12,20,0.55)] p-4 pt-[8vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('search.title')}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="animate-pop w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <IconSearch size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className="h-8 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
            aria-label={t('search.title')}
          />
          <kbd className="hidden shrink-0 rounded-md border border-line bg-surface2 px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:block">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface2 hover:text-ink"
            aria-label={t('common.close')}
          >
            <IconClose size={15} />
          </button>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-2">
          {!query.trim() && (
            <div className="p-2">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                {lang === 'bn' ? 'দ্রুত অনুসন্ধান' : 'Quick searches'}
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                {quickSearches.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => setQuery(item.query)}
                    className="chip transition-colors hover:border-brand/50 hover:text-ink"
                  >
                    <IconSearch size={12} />
                    {lang === 'bn' ? item.bn : item.en}
                  </button>
                ))}
              </div>
              <p className="mt-5 px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                {lang === 'bn' ? 'যেখানে যেতে পারেন' : 'Jump to'}
              </p>
              <div className="grid gap-1 sm:grid-cols-2">
                {[
                  { label: t('nav.formulas'), to: href('formulas') },
                  { label: t('nav.solver'), to: href('solver') },
                  { label: t('nav.practice'), to: href('practice') },
                  { label: t('nav.secondary'), to: href('secondary', 9) },
                ].map((item) => (
                  <a
                    key={item.to}
                    href={item.to}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface2 hover:text-ink"
                  >
                    {item.label}
                    <IconArrowRight size={14} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {query.trim() && rows.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-ink">{t('common.noResults')}</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted">{t('search.empty')}</p>
            </div>
          )}

          {rows.map((row, index) => {
            const active = index === cursor;
            if (row.kind === 'solve') {
              return (
                <button
                  key="solve"
                  type="button"
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => {
                    onSolve(query.trim());
                    onClose();
                  }}
                  className={cn(
                    'mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-brand/10' : 'hover:bg-surface2',
                  )}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                    <IconSparkles size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      {lang === 'bn' ? 'এটি সমাধান করুন' : 'Solve this'}
                    </span>
                    <span className="math block truncate text-xs text-muted">{query}</span>
                  </span>
                  <IconArrowRight size={15} className="shrink-0 text-muted" />
                </button>
              );
            }
            const hit = row.hit;
            return (
              <button
                key={hit.id + index}
                type="button"
                onMouseEnter={() => setCursor(index)}
                onClick={() => activate(hit)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  active ? 'bg-surface2' : 'hover:bg-surface2',
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface2 font-serif text-[13px] text-muted">
                  {TYPE_MARK[hit.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{hit.title}</span>
                  {hit.subtitle && (
                    <span className={cn('block truncate text-xs text-muted', hit.type === 'formula' && 'math')}>
                      {hit.subtitle}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted/70">
                  {t(TYPE_LABEL[hit.type])}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface2/50 px-4 py-2 text-[11px] text-muted">
          <span>{t('search.hint')}</span>
          <span>
            {query.trim() ? `${hits.length} ${t('common.results')}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
