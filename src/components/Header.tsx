import { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { href, type Page } from '@/lib/router';
import { cn } from '@/lib/utils';
import { IconClose, IconMenu, IconMoon, IconSearch, IconSun } from './icons';

const NAV: { page: Page; key: 'nav.home' | 'nav.formulas' | 'nav.solver' | 'nav.practice' | 'nav.secondary'; to: string }[] = [
  { page: 'home', key: 'nav.home', to: href('home') },
  { page: 'formulas', key: 'nav.formulas', to: href('formulas') },
  { page: 'solver', key: 'nav.solver', to: href('solver') },
  { page: 'practice', key: 'nav.practice', to: href('practice') },
  { page: 'secondary', key: 'nav.secondary', to: href('secondary', 9) },
];

export function Header({ current, onSearch }: { current: Page; onSearch: () => void }) {
  const { t, lang, toggleLang, theme, toggleTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [current]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70">
      <div className="glass">
        <div className="container-x flex h-16 items-center gap-3">
          <a href={href('home')} className="flex items-center gap-2.5" aria-label="MathUniverse home">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm"
              style={{ background: 'linear-gradient(140deg, #0f8b83, #24b3a8)' }}
            >
              <span className="font-serif text-[19px] leading-none">Σ</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[17px] font-semibold tracking-tight">MathUniverse</span>
              <span className="mt-1 hidden text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted sm:block">
                {lang === 'bn' ? 'শ্রেণী ১ → ১২' : 'Class 1 → 12'}
              </span>
            </span>
          </a>

          <nav className="ml-3 hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => {
              const active = current === item.page;
              return (
                <a
                  key={item.page}
                  href={item.to}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors',
                    active ? 'text-ink' : 'text-muted hover:text-ink',
                    active && 'bg-surface2',
                  )}
                >
                  {t(item.key)}
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onSearch}
              className="hidden h-9 items-center gap-2 rounded-full border border-line bg-surface pl-3 pr-1.5 text-xs text-muted transition-colors hover:border-brand/50 hover:text-ink sm:flex"
              aria-label={t('common.search')}
            >
              <IconSearch size={15} />
              <span className="pr-1">{t('common.searchShort')}</span>
              <kbd className="rounded-md border border-line bg-surface2 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onSearch}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink sm:hidden"
              aria-label={t('common.search')}
            >
              <IconSearch size={16} />
            </button>

            <button
              type="button"
              onClick={toggleLang}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-[11px] font-semibold text-muted transition-colors hover:text-ink sm:hidden"
              aria-label={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
              title={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
            >
              {lang === 'en' ? 'বাং' : 'EN'}
            </button>

            <button
              type="button"
              onClick={toggleLang}
              className="hidden h-9 items-center rounded-full border border-line bg-surface p-0.5 text-[11px] font-semibold sm:flex"
              aria-label={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
              title={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
            >
              <span
                className={cn(
                  'grid h-8 place-items-center rounded-full px-2.5 transition-colors',
                  lang === 'en' ? 'bg-ink text-canvas' : 'text-muted',
                )}
              >
                EN
              </span>
              <span
                className={cn(
                  'grid h-8 place-items-center rounded-full px-2.5 font-bn transition-colors',
                  lang === 'bn' ? 'bg-ink text-canvas' : 'text-muted',
                )}
              >
                বাং
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink lg:hidden"
              aria-label={menuOpen ? t('common.close') : t('nav.menu')}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconClose size={17} /> : <IconMenu size={17} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line/70 lg:hidden">
            <nav className="container-x grid grid-cols-2 gap-1.5 py-3" aria-label="Mobile">
              {NAV.map((item) => (
                <a
                  key={item.page}
                  href={item.to}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    current === item.page ? 'bg-surface2 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink',
                  )}
                >
                  {t(item.key)}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
