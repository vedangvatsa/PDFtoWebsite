import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { PAGE_CONTAINER } from '@/lib/utils';

/**
 * Shared page shell — wraps every content page with Header, main container, and Footer.
 * Use this instead of manually importing Header/MicroFooter in every page.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        {children}
      </main>
      <MicroFooter />
    </div>
  );
}
