export type Page = 'home' | 'formulas' | 'solver' | 'practice' | 'secondary';

export interface Route {
  page: Page;
  /** first path segment, e.g. formula category or class level */
  param?: string;
  /** second path segment, e.g. chapter number */
  param2?: string;
}

const PAGES: Page[] = ['home', 'formulas', 'solver', 'practice', 'secondary'];

export function parseRoute(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (!clean) return { page: 'home' };
  const [first, second, third] = clean.split('/');
  const page = (PAGES as string[]).includes(first) ? (first as Page) : 'home';
  if (page === 'home') return { page };
  return { page, param: second || undefined, param2: third || undefined };
}

export function href(page: Page, ...rest: (string | number)[]): string {
  const parts = [page === 'home' ? '' : page, ...rest.map(String)].filter(Boolean);
  return `#/${parts.join('/')}`;
}

export function navigate(path: string): void {
  if (window.location.hash === path) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = path;
}
