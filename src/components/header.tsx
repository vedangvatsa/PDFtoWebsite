
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "./icons";
import { Button } from "./ui/button";
import { useUser } from "@/auth";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";
import posthog from 'posthog-js';
import { GLOBAL_EVENTS } from '@/lib/posthog-events';


export default function Header({ children }: { children?: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    
    const handleSignOut = async () => {
        const supabase = createClient();
        try {
            await supabase.auth.signOut();
            posthog.capture(GLOBAL_EVENTS.USER_LOGOUT);
            posthog.reset();
            router.push('/blog');
        } catch (error: any) {
            console.error("Error signing out: ", error);
            alert(error?.message || 'Failed to sign out. Please try again.');
        }
    }

  const navBtn =
    'h-8 px-1.5 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0';

return (
    <header className="sticky top-0 z-50 w-full overflow-x-hidden" role="banner">
      <nav className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-2 px-3 sm:px-8 min-w-0" aria-label="Main navigation">
        <Link href="/" className="flex items-center shrink-0" aria-label="CVin.Bio home">
          <Icons.logo className="h-6 w-6" />
        </Link>
        {children ? (
          <div className="hidden sm:flex flex-1 justify-center min-w-0 overflow-hidden">
            {children}
          </div>
        ) : null}
        <div className="flex justify-end items-center gap-0 sm:gap-1 min-w-0 overflow-hidden">
          {pathname !== '/jobs' && (
            <Button variant="ghost" size="sm" asChild className={navBtn}>
              <Link href="/jobs">Jobs</Link>
            </Button>
          )}
          {pathname !== '/fellowships' && (
            <Button variant="ghost" size="sm" asChild className={`${navBtn} ${user ? 'max-[400px]:hidden' : ''}`}>
              <Link href="/fellowships">Fellowships</Link>
            </Button>
          )}
          {pathname !== '/news' && (
            <Button variant="ghost" size="sm" asChild className={`${navBtn} ${user ? 'max-[360px]:hidden' : ''}`}>
              <Link href="/news">News</Link>
            </Button>
          )}
          {!isUserLoading && user && (
            <>
              {pathname !== '/editor' && (
                <Button variant="ghost" size="sm" asChild className={navBtn}>
                  <Link href="/editor">Editor</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className={navBtn}>
                Logout
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
