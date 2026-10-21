import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import type { Accent, Formula } from '@/lib/types';
import { IconCheck, IconCopy } from './icons';

const ACCENT_BG: Record<Accent, string> = {
  teal: 'bg-brand',
  indigo: 'bg-indigo-500',
  gold: 'bg-gold',
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
  slate: 'bg-slate-500',
};

export function FormulaCard({
  formula,
  accent,
  categoryName,
}: {
  formula: Formula;
  accent: Accent;
  categoryName: string;
}) {
  const { lang, t } = useApp();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formula.expr);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const primary = lang === 'bn' ? formula.name.bn : formula.name.en;
  const secondary = lang === 'bn' ? formula.name.en : formula.name.bn;
  const description = formula.desc ? (lang === 'bn' ? formula.desc.bn : formula.desc.en) : null;

  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden p-4">
      <span className={cn('absolute inset-x-0 top-0 h-0.5 opacity-70', ACCENT_BG[accent])} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-sans text-[13.5px] font-semibold leading-snug text-ink">{primary}</h3>
          <p className={cn('truncate text-[11px] text-muted', lang === 'bn' && 'font-sans')}>{secondary}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={t('common.copy')}
          className={cn(
            'grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface text-muted transition-all',
            copied ? 'border-brand/40 text-brand' : 'text-muted hover:text-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
          )}
        >
          {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
        </button>
      </div>

      <p className="math mt-3 rounded-lg border border-line/70 bg-surface2/50 px-3 py-2.5 text-[13.5px] leading-relaxed text-ink">
        {formula.expr}
      </p>

      {description && <p className="mt-2 text-[11.5px] leading-relaxed text-muted">{description}</p>}

      <span className="mt-auto pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted/60">
        {categoryName}
      </span>
    </article>
  );
}
