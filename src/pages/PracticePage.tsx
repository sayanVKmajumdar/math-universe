import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { generateQuestion, practiceLevels, practiceTopics } from '@/data/practice';
import { takePendingPractice } from '@/lib/pending';
import { answersMatch } from '@/solver';
import type { PracticeTopic, Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBulb,
  IconCheck,
  IconClose,
  IconFlame,
  IconTarget,
  IconTrash,
} from '@/components/icons';

const LEVELS = [1, 2, 3] as const;

export function PracticePage() {
  const { t, lang, recordAnswer, progress, resetProgress } = useApp();

  const [topic, setTopic] = useState<PracticeTopic>(() => {
    const pending = takePendingPractice();
    return (practiceTopics.some((entry) => entry.id === pending) ? pending : 'arithmetic') as PracticeTopic;
  });
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(topic, 1));
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [session, setSession] = useState({ attempted: 0, correct: 0 });

  const pickTopic = (next: PracticeTopic) => {
    setTopic(next);
    setQuestion(generateQuestion(next, level));
    setAnswer('');
    setStatus('idle');
    setShowHint(false);
  };

  const pickLevel = (next: 1 | 2 | 3) => {
    setLevel(next);
    setQuestion(generateQuestion(topic, next));
    setAnswer('');
    setStatus('idle');
    setShowHint(false);
  };

  const nextQuestion = () => {
    setQuestion(generateQuestion(topic, level));
    setAnswer('');
    setStatus('idle');
    setShowHint(false);
  };

  const check = () => {
    if (status !== 'idle' || !answer.trim()) return;
    const correct = answersMatch(question.answer, answer);
    setStatus(correct ? 'correct' : 'wrong');
    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);
    setSession((previous) => ({
      attempted: previous.attempted + 1,
      correct: previous.correct + (correct ? 1 : 0),
    }));
    recordAnswer(correct, nextStreak);
  };

  const levelLabel = practiceLevels.find((entry) => entry.value === level);
  const promptIsMath = question.prompt.length < 46 && !/[a-z]{4,}\s+[a-z]{3,}/i.test(question.prompt);

  return (
    <div>
      <section className="border-b border-line bg-surface2/40">
        <div className="container-x py-9 sm:py-11">
          <p className="eyebrow">{lang === 'bn' ? 'অনুশীলন' : 'Practice'}</p>
          <h1 className={cn('mt-1.5 font-serif text-[34px] font-semibold sm:text-[42px]', lang === 'bn' && 'font-bn text-[30px]')}>
            {t('practice.title')}
          </h1>
          <p className={cn('mt-2 max-w-2xl text-pretty text-[14px] leading-relaxed text-muted', lang === 'bn' && 'font-bn')}>
            {t('practice.desc')}
          </p>
        </div>
      </section>

      <div className="container-x py-8">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  {t('practice.topic')}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {practiceTopics.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => pickTopic(entry.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                      topic === entry.id
                        ? 'border-brand bg-brand on-brand'
                        : 'border-line bg-surface text-muted hover:border-brand/40 hover:text-ink',
                      lang === 'bn' && 'font-bn',
                    )}
                  >
                    <span className="text-[11px] opacity-70">{entry.icon}</span>
                    {lang === 'bn' ? entry.bn : entry.en}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  {t('practice.difficulty')}
                </span>
                <div className="flex gap-1.5">
                  {LEVELS.map((value) => {
                    const label = practiceLevels.find((entry) => entry.value === value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => pickLevel(value)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors',
                          level === value ? 'bg-ink text-canvas' : 'bg-surface2 text-muted hover:text-ink',
                        )}
                      >
                        {lang === 'bn' ? label?.bn : label?.en}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-line bg-surface2/40 px-4 py-2.5">
                <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand">
                  {lang === 'bn' ? question.topic.bn : question.topic.en}
                </span>
                <span className="text-[11px] text-muted">
                  {levelLabel ? (lang === 'bn' ? levelLabel.bn : levelLabel.en) : ''} · {t('practice.score')}{' '}
                  {session.correct}/{session.attempted}
                </span>
              </div>

              <div className="px-4 py-7 sm:px-6">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  {lang === 'bn' ? 'প্রশ্ন' : 'Question'}
                </p>
                <p
                  className={cn(
                    'mt-2 text-balance text-[20px] leading-snug text-ink sm:text-[23px]',
                    promptIsMath ? 'math font-medium' : 'font-serif',
                    lang === 'bn' && !promptIsMath && 'font-bn',
                  )}
                >
                  {question.prompt}
                </p>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    check();
                  }}
                  className="mt-5 flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder={t('practice.placeholder')}
                    disabled={status !== 'idle'}
                    className={cn(
                      'field h-11 font-mono text-[15px]',
                      status === 'correct' && 'border-emerald-500 bg-emerald-500/5',
                      status === 'wrong' && 'border-rose-500 bg-rose-500/5',
                    )}
                    aria-label={t('practice.placeholder')}
                    autoComplete="off"
                  />
                  {status === 'idle' ? (
                    <button type="submit" disabled={!answer.trim()} className="btn btn-primary h-11 shrink-0 px-5">
                      <IconCheck size={15} />
                      {t('practice.check')}
                    </button>
                  ) : (
                    <button type="button" onClick={nextQuestion} className="btn btn-primary h-11 shrink-0 px-5">
                      {t('practice.next')}
                      <IconArrowRight size={15} />
                    </button>
                  )}
                </form>

                {status !== 'idle' && (
                  <div
                    className={cn(
                      'animate-pop mt-3 rounded-xl border px-3.5 py-3 text-[13px]',
                      status === 'correct'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                    )}
                  >
                    <p className="flex items-center gap-1.5 font-semibold">
                      {status === 'correct' ? <IconCheck size={14} /> : <IconClose size={14} />}
                      {status === 'correct' ? t('practice.correct') : t('practice.wrong')}
                      {status === 'wrong' && (
                        <span className="ml-1 font-normal opacity-80">
                          {t('practice.answerWas')}: <span className="math font-semibold">{question.answer}</span>
                        </span>
                      )}
                    </p>
                    <p className={cn('mt-1 leading-relaxed opacity-90', lang === 'bn' && 'font-bn')}>
                      {lang === 'bn' ? question.explanation.bn : question.explanation.en}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHint((value) => !value)}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    <IconBulb size={13} className="text-gold" />
                    {showHint ? t('practice.hint') : t('practice.showHint')}
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={nextQuestion} className="btn btn-ghost h-8 px-2.5 text-[12px]">
                      {t('practice.skip')}
                    </button>
                    <button type="button" onClick={nextQuestion} className="btn btn-outline h-8 px-3 text-[12px]">
                      {t('practice.next')}
                      <IconArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {showHint && (
                  <p className={cn('animate-pop mt-2 rounded-lg border border-gold/25 bg-gold/8 px-3 py-2 text-[12.5px] text-muted', lang === 'bn' && 'font-bn')}>
                    {lang === 'bn' ? question.hint.bn : question.hint.en}
                  </p>
                )}
              </div>
            </div>

            <p className={cn('text-center text-[11.5px] text-muted', lang === 'bn' && 'font-bn')}>
              {t('practice.localNote')}
            </p>
          </div>

          <aside className="space-y-4">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-surface2/40 px-4 py-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  {lang === 'bn' ? 'আজকের হিসাব' : 'This session'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-line">
                <div className="bg-surface px-4 py-4">
                  <p className="text-[10.5px] uppercase tracking-wider text-muted">{t('practice.score')}</p>
                  <p className="mt-1 font-serif text-[26px] font-semibold leading-none">
                    {session.correct}
                    <span className="text-[15px] font-normal text-muted"> / {session.attempted}</span>
                  </p>
                </div>
                <div className="bg-surface px-4 py-4">
                  <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-muted">
                    <IconFlame size={12} className="text-gold" />
                    {t('practice.streak')}
                  </p>
                  <p className="mt-1 font-serif text-[26px] font-semibold leading-none">{streak}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <IconTarget size={13} className="text-brand" />
                  {t('practice.best')}: {progress.bestStreak}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetProgress();
                    setSession({ attempted: 0, correct: 0 });
                    setStreak(0);
                    setStatus('idle');
                    setAnswer('');
                  }}
                  className="flex items-center gap-1 text-muted transition-colors hover:text-rose-500"
                >
                  <IconTrash size={12} />
                  {t('practice.reset')}
                </button>
              </div>
            </div>

            <div className="card p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                {lang === 'bn' ? 'কীভাবে এগোবেন' : 'How to get better'}
              </p>
              <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-muted">
                {(lang === 'bn'
                  ? [
                      'প্রথমে সহজ স্তরে ১০টি প্রশ্ন করুন — আত্মবিশ্বাস তৈরি হবে।',
                      'ভুল হলে ব্যাখ্যাটি পড়ুন, তারপর একই বিষয়ে আরেকটি প্রশ্ন করুন।',
                      'প্রতিদিন ১০ মিনিট অনুশীলন করলেই বড় পার্থক্য হয়।',
                    ]
                  : [
                      'Start on Easy and do ten questions to build rhythm.',
                      'When you miss one, read the explanation, then try the same topic again.',
                      'Ten focused minutes a day beats one long cramming session.',
                    ]
                ).map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
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
