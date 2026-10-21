import { useApp } from '@/lib/app-context';
import { href } from '@/lib/router';
import { pick } from '@/lib/types';
import { formulaCategories } from '@/data/formulas';
import { IconGitHub } from './icons';

export function Footer() {
  const { t, lang } = useApp();

  return (
    <footer className="mt-20 text-white/80" style={{ background: 'linear-gradient(165deg,#10233c,#0a1727)' }}>
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white"
              style={{ background: 'linear-gradient(140deg,#0f8b83,#24b3a8)' }}
            >
              <span className="font-serif text-[18px] leading-none">Σ</span>
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-white">MathUniverse</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                {lang === 'bn' ? 'শ্রেণী ১ → ১২' : 'Class 1 → 12'}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-white/60">{t('footer.tagline')}</p>
          <a
            href="https://github.com/sayanVKmajumdar/math-universe"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:border-white/35 hover:text-white"
          >
            <IconGitHub size={14} />
            GitHub
          </a>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            {t('footer.explore')}
          </h3>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            <li><a className="text-white/70 transition-colors hover:text-white" href={href('formulas')}>{t('nav.formulas')}</a></li>
            <li><a className="text-white/70 transition-colors hover:text-white" href={href('solver')}>{t('nav.solver')}</a></li>
            <li><a className="text-white/70 transition-colors hover:text-white" href={href('practice')}>{t('nav.practice')}</a></li>
            <li><a className="text-white/70 transition-colors hover:text-white" href={href('secondary', 9)}>{t('nav.secondary')}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            {lang === 'bn' ? 'বিষয়' : 'Topics'}
          </h3>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            {['algebra', 'calculus', 'geometry', 'trigonometry', 'statistics'].map((id) => {
              const category = formulaCategories.find((item) => item.id === id);
              return (
                <li key={id}>
                  <a className="text-white/70 transition-colors hover:text-white" href={href('formulas', id)}>
                    {category ? pick(category.name, lang) : id}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            {t('footer.about')}
          </h3>
          <p className="mt-4 text-[13px] leading-relaxed text-white/60">{t('footer.aboutText')}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MathUniverse. {t('footer.rights')}</p>
          <p>{t('footer.madeIn')} 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
