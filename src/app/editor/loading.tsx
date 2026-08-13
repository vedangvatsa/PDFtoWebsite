import Header from '@/components/header';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="h-10 w-48 bg-zinc-200 rounded-md animate-pulse" />
          <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-6">
            <div className="h-24 w-24 bg-zinc-200 rounded-full animate-pulse mx-auto" />
            <div className="space-y-4">
              <div className="h-10 w-full bg-zinc-200 rounded-md animate-pulse" />
              <div className="h-10 w-full bg-zinc-200 rounded-md animate-pulse" />
              <div className="h-24 w-full bg-zinc-200 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
             <div className="h-8 w-1/3 bg-zinc-200 rounded-md animate-pulse mb-4" />
             <div className="h-16 w-full bg-zinc-200 rounded-md animate-pulse" />
             <div className="h-16 w-full bg-zinc-200 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="hidden lg:block w-full lg:w-1/2">
          <div className="h-[800px] w-full bg-zinc-200 rounded-xl animate-pulse" />
        </div>
      </main>
    </div>
  );
}
