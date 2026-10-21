import { useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { href, navigate } from '@/lib/router';
import { pick } from '@/lib/types';
import { chaptersFor } from '@/data/chapters';
import type { Chapter } from '@/lib/types';
import { setPendingPractice, setPendingProblem } from '@/lib/pending';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCalculator,
  IconChart,
  IconClose,
  IconTarget,
} from '@/components/icons';

const ACCENT = ['linear-gradient(140deg,#0b6f69,#24b3a8)', 'linear-gradient(140deg,#32327a,#5b5bd6)', 'linear-gradient(140deg,#8f6914,#e0b148)', 'linear-gradient(140deg,#8f2849,#d95c85)'];

export function SecondaryPage({ param, param2 }: { param?: string; param2?: string }) {
  const { t, lang } = useApp();
  const level: 9 | 10 = param === '10' ? 10 : 9;
  const chapters = chaptersFor(level);
  const openChapter = param2 ? chapters.find((chapter) => String(chapter.num) === param2) : undefined;

  useEffect(() => {
    if (!openChapter) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate(href('secondary', level));
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openChapter, level]);

  const solveSample = (chapter: Chapter) => {
    setPendingProblem(chapter.sample);
    navigate(href('solver'));
  };

  const practise = (chapter: Chapter) => {
    setPendingPractice(chapter.practice);
    navigate(href('practice'));
  };

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
              <p className="eyebrow">{lang === 'bn' ? 'পাঠ্যক্রম' : 'Curriculum'}</p>
              <h1 className={cn('mt-1.5 font-serif text-[32px] font-semibold sm:text-[40px]', lang === 'bn' && 'font-bn text-[28px]')}>
                {t('secondary.title')}
              </h1>
              <p className={cn('mt-2 max-w-xl text-pretty text-[14px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                {t('secondary.desc')}
              </p>
            </div>
            <div className="flex rounded-xl border border-line bg-surface p-1">
              {([9, 10] as const).map((value) => (
                <a
                  key={value}
                  href={href('secondary', value)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-colors',
                    level === value ? 'bg-ink text-canvas' : 'text-muted hover:text-ink',
                  )}
                >
                  {value === 9 ? t('secondary.class9') : t('secondary.class10')}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-8">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
          <span className="chip">
            <IconBook size={11} />
            {chapters.length} {t('secondary.chapters')}
          </span>
          <span className="chip">
            <IconChart size={11} />
            {chapters.reduce((sum, chapter) => sum + chapter.problems, 0)} {t('secondary.problems')}
          </span>
          <span className="chip">
            <IconTarget size={11} />
            {chapters.reduce((sum, chapter) => sum + chapter.videos, 0)} {t('secondary.videos')}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chapters.map((chapter, index) => (
            <a
              key={chapter.num}
              href={href('secondary', level, chapter.num)}
              className="card card-hover group flex flex-col overflow-hidden"
            >
              <div className="flex items-start gap-3 p-4 pb-0">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-serif text-[17px] font-semibold text-white shadow-sm"
                  style={{ background: ACCENT[index % ACCENT.length] }}
                >
                  {chapter.num}
                </span>
                <div className="min-w-0">
                  <h2 className={cn('font-serif text-[17px] font-semibold leading-snug', lang === 'bn' && 'font-bn text-[15.5px]')}>
                    {pick(chapter.title, lang)}
                  </h2>
                  <p className={cn('mt-0.5 truncate text-[11px] text-muted', lang === 'bn' && 'font-sans')}>
                    {lang === 'bn' ? chapter.title.en : chapter.title.bn}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className={cn('text-[12.5px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                  {pick(chapter.summary, lang)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {chapter.topics.slice(0, 3).map((topic) => (
                    <span key={topic.name.en} className={cn('chip', lang === 'bn' && 'font-bn')}>
                      {pick(topic.name, lang)}
                    </span>
                  ))}
                  {chapter.topics.length > 3 && <span className="chip">+{chapter.topics.length - 3}</span>}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line/70 pt-3 text-[11px] text-muted">
                  <span>
                    🎬 {chapter.videos} · ✏️ {chapter.problems}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    {t('secondary.open')}
                    <IconArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-muted">{t('secondary.added')}</p>
      </div>

      {openChapter && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(6,12,20,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={pick(openChapter.title, lang)}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) navigate(href('secondary', level));
          }}
        >
          <div className="animate-pop max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-serif text-[17px] font-semibold text-white"
                  style={{ background: ACCENT[(openChapter.num - 1) % ACCENT.length] }}
                >
                  {openChapter.num}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    {level === 9 ? t('secondary.class9') : t('secondary.class10')} · {t('secondary.chapters')} {openChapter.num}
                  </p>
                  <h2 className={cn('font-serif text-xl font-semibold', lang === 'bn' && 'font-bn text-lg')}>
                    {pick(openChapter.title, lang)}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(href('secondary', level))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:text-ink"
                aria-label={t('common.close')}
              >
                <IconClose size={15} />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <p className={cn('text-[13.5px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
                {pick(openChapter.summary, lang)}
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: IconBook, value: openChapter.topics.length, label: t('secondary.topics') },
                  { icon: IconChart, value: openChapter.videos, label: t('secondary.videos') },
                  { icon: IconTarget, value: openChapter.problems, label: t('secondary.problems') },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="rounded-xl border border-line bg-surface2/50 px-3 py-2.5">
                      <Icon size={14} className="text-brand" />
                      <p className="mt-1 font-serif text-lg font-semibold leading-none">{stat.value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('secondary.topics')}</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {openChapter.topics.map((topic) => (
                    <li
                      key={topic.name.en}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-line/70 bg-surface2/40 px-3 py-2 text-[12.5px] text-ink',
                        lang === 'bn' && 'font-bn',
                      )}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {pick(topic.name, lang)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-line bg-surface2/40 p-3.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{t('secondary.sample')}</p>
                <p className="math mt-1.5 overflow-x-auto text-[13.5px] text-ink">{openChapter.sample}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={() => solveSample(openChapter)} className="btn btn-primary flex-1">
                  <IconCalculator size={15} />
                  {t('secondary.solveThis')}
                </button>
                <button type="button" onClick={() => practise(openChapter)} className="btn btn-outline flex-1">
                  <IconTarget size={15} />
                  {t('secondary.practiceThis')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
