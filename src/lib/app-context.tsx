import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translate, type DictKey } from './i18n';
import type { Lang } from './types';

type Theme = 'light' | 'dark';

export interface Progress {
  solved: number;
  attempted: number;
  correct: number;
  bestStreak: number;
}

const DEFAULT_PROGRESS: Progress = { solved: 0, attempted: 0, correct: 0, bestStreak: 0 };

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: DictKey) => string;
  progress: Progress;
  recordSolve: () => void;
  recordAnswer: (correct: boolean, streak: number) => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LANG_KEY = 'mu.lang';
const THEME_KEY = 'mu.theme';
const PROGRESS_KEY = 'mu.progress';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) — the app still works */
  }
}

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'bn') return stored;
  } catch {
    /* ignore */
  }
  return 'en';
}

function initialTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  return stored === 'dark' ? 'dark' : 'light';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [progress, setProgress] = useState<Progress>(() => readStored(PROGRESS_KEY, DEFAULT_PROGRESS));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStored(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    writeStored(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    writeStored(PROGRESS_KEY, progress);
  }, [progress]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((prev) => (prev === 'en' ? 'bn' : 'en')), []);
  const toggleTheme = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  const recordSolve = useCallback(() => {
    setProgress((prev) => ({ ...prev, solved: prev.solved + 1 }));
  }, []);

  const recordAnswer = useCallback((correct: boolean, streak: number) => {
    setProgress((prev) => ({
      ...prev,
      attempted: prev.attempted + 1,
      correct: prev.correct + (correct ? 1 : 0),
      bestStreak: Math.max(prev.bestStreak, streak),
    }));
  }, []);

  const resetProgress = useCallback(() => setProgress(DEFAULT_PROGRESS), []);

  const t = useCallback((key: DictKey) => translate(key, lang), [lang]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      theme,
      toggleTheme,
      t,
      progress,
      recordSolve,
      recordAnswer,
      resetProgress,
    }),
    [lang, setLang, toggleLang, theme, toggleTheme, t, progress, recordSolve, recordAnswer, resetProgress],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
