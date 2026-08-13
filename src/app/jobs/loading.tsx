import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

export default function Loading() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#fafafa] flex flex-col">
      <Header />
      <main className="max-w-5xl mx-auto w-full px-5 sm:px-8 py-6">
        <div className="flex flex-col mb-10">
          <div className="h-10 w-48 bg-zinc-200 rounded-md animate-pulse mb-3" />
          <div className="h-6 w-full max-w-md bg-zinc-200 rounded-md animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="h-10 flex-1 bg-zinc-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-zinc-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white border border-zinc-200 rounded-lg">
              <div className="h-5 w-5 rounded bg-zinc-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <MicroFooter />
    </div>
  );
}
