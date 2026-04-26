import Link from "next/link";

export default function MicroFooter() {
  return (
    <footer className="w-full py-6 mt-auto" role="contentinfo">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-center space-x-4 text-xs text-muted-foreground/60" aria-label="Footer navigation">
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
        <span>&middot;</span>
        <Link href="/blog" className="hover:text-muted-foreground transition-colors">Insights</Link>
        <span>&middot;</span>
        <Link href="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
        <span>&middot;</span>
        <Link href="/ai-discovery" className="hover:text-muted-foreground transition-colors">AI Discovery</Link>
      </nav>
    </footer>
  );
}
