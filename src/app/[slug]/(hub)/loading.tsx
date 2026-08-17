import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-start gap-4 sm:gap-6 mb-8">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-zinc-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-8 w-3/4 sm:w-1/2 bg-zinc-200 rounded-md animate-pulse" />
            <div className="h-4 w-1/2 sm:w-1/3 bg-zinc-200 rounded-md animate-pulse" />
            <div className="flex gap-3 pt-2">
              <div className="h-6 w-24 bg-zinc-200 rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-zinc-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-40 w-full bg-zinc-200 rounded-xl animate-pulse" />
          <div className="h-[400px] w-full bg-zinc-200 rounded-xl animate-pulse" />
        </div>
      </main>
      <MicroFooter />
    </div>
  );
}
