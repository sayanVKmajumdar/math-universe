import { useEffect, useState } from 'react';
import { AppProvider } from '@/lib/app-context';
import { href, navigate, parseRoute, type Route } from '@/lib/router';
import { setPendingProblem } from '@/lib/pending';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchDialog } from '@/components/SearchDialog';
import { HomePage } from '@/pages/HomePage';
import { FormulasPage } from '@/pages/FormulasPage';
import { SolverPage } from '@/pages/SolverPage';
import { PracticePage } from '@/pages/PracticePage';
import { SecondaryPage } from '@/pages/SecondaryPage';

function Shell() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/');
    }
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const solveFromSearch = (query: string) => {
    setPendingProblem(query);
    navigate(href('solver'));
  };

  let page = <HomePage />;
  if (route.page === 'formulas') page = <FormulasPage param={route.param} />;
  else if (route.page === 'solver') page = <SolverPage />;
  else if (route.page === 'practice') page = <PracticePage />;
  else if (route.page === 'secondary') page = <SecondaryPage param={route.param} param2={route.param2} />;

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header current={route.page} onSearch={() => setSearchOpen(true)} />
      <main id="main" className="flex-1">
        {page}
      </main>
      <Footer />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onSolve={solveFromSearch} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
