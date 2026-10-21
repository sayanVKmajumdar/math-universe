import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { Solution } from '@/lib/types';
import { pick } from '@/lib/types';
import { IconBulb, IconCheck, IconCopy } from './icons';
import { Plot } from './Plot';

export function SolutionCard({ solution }: { solution: Solution }) {
  const { lang, t } = useApp();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(solution.answer);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <article className="card animate-fade-up overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface2/40 px-4 py-2.5 sm:px-5">
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand">
          {pick(solution.topic, lang)}
        </span>
        <span className="math min-w-0 flex-1 truncate text-xs text-muted">{solution.input}</span>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:bg-surface2 hover:text-ink"
        >
          {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
          {copied ? t('common.copied') : t('solver.copyAnswer')}
        </button>
      </header>

      <div className="border-b border-line px-4 py-4 sm:px-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('solver.answer')}</p>
        <p className="math mt-1.5 break-words text-[22px] font-semibold leading-snug text-brand sm:text-2xl">
          {solution.answer}
        </p>
        {solution.answerNote && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{pick(solution.answerNote, lang)}</p>
        )}
      </div>

      <div className="px-4 py-4 sm:px-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('solver.steps')}</p>
        <ol className="mt-2">
          {solution.steps.map((step, index) => (
            <li
              key={index}
              className="flex gap-3 border-b border-line/60 py-3 last:border-0 last:pb-0"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-ink">{pick(step.title, lang)}</p>
                {step.detail && (
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{pick(step.detail, lang)}</p>
                )}
                {step.expr && (
                  <code className="math mt-1.5 inline-block max-w-full overflow-x-auto rounded-lg border border-line bg-surface2/70 px-2.5 py-1 text-[12.5px] text-ink">
                    {step.expr}
                  </code>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {solution.plot && (
        <div className="border-t border-line px-4 py-4 sm:px-5">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('solver.plot')}</p>
            {solution.plot.label2 && (
              <div className="flex items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 rounded-full bg-brand" />
                  {pick(solution.plot.label ?? { en: 'f(x)', bn: 'f(x)' }, lang)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 rounded-full bg-gold" />
                  {pick(solution.plot.label2, lang)}
                </span>
              </div>
            )}
          </div>
          <Plot plot={solution.plot} />
        </div>
      )}

      {solution.tip && (
        <div className="mx-4 mb-4 flex gap-2.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2.5 sm:mx-5">
          <IconBulb size={16} className="mt-0.5 shrink-0 text-gold" />
          <p className="text-[12.5px] leading-relaxed text-muted">
            <span className="font-semibold text-ink">{t('solver.tip')}: </span>
            {pick(solution.tip, lang)}
          </p>
        </div>
      )}
    </article>
  );
}
