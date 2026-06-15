import Link from 'next/link';
import { FileQuestion, UploadCloud, Edit, BookOpen } from 'lucide-react';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-primary/10 transition-colors duration-200">
      <Header />
      
      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex flex-col justify-center items-center">
        
        <div className="mb-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-6 transition-colors">
            <FileQuestion className="w-8 h-8 text-zinc-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-4">
            This link is a blank slate.
          </h1>
          <p className="text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto transition-colors mt-4">
            The exact profile you were searching for couldn't be found. Don't leave empty-handed though. Watch our AI turn your own PDF CV into a stunning website in under 10 seconds.
          </p>
        </div>

        <div className="w-full max-w-[500px] space-y-4">
          
          <Link href="/" className="group flex w-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition-all hover:bg-zinc-100 hover:border-zinc-400">
            <UploadCloud className="mr-3 h-6 w-6 text-zinc-500 group-hover:text-zinc-700 transition-colors" />
            <span className="text-sm font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors">
              Upload your CV to start
            </span>
          </Link>

          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">or</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <Link href="/editor" className="flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 text-center transition-all hover:bg-zinc-50 shadow-sm hover:shadow">
            <Edit className="mr-2 h-4 w-4 text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-700">Enter details manually</span>
          </Link>

          <Link href="/blog" className="flex w-full items-center justify-center rounded-lg border border-transparent bg-zinc-900 p-4 text-center transition-all hover:bg-zinc-800 shadow-sm hover:shadow mt-2">
            <BookOpen className="mr-2 h-4 w-4 text-zinc-50" />
            <span className="text-sm font-semibold text-zinc-50">Read our guides & articles</span>
          </Link>
          
        </div>
        
      </main>

      <MicroFooter />
    </div>
  );
}
