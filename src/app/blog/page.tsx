import { PAGE_CONTAINER , PAGE_TITLE } from '@/lib/utils';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { blogPosts } from '@/lib/blog-data';
import { blogMetadata } from '@/lib/blog-metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata = {
  title: 'Insights & Advice',
  description: 'Practical career guides, resume strategies, and actionable insights for modern professionals.',
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: 'Articles & Insights',
    description: 'Practical career guides, resume strategies, and actionable insights for modern professionals.',
    url: `${siteUrl}/blog`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: 'CVin.Bio Articles & Insights' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles & Insights',
    description: 'Practical career guides, resume strategies, and actionable insights for modern professionals.',
    images: [`${siteUrl}/opengraph-image`],
    creator: '@cvinbio',
  },
};

export default function BlogPage() {
  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        <div className="flex flex-col mb-16">
          <h1 className={PAGE_TITLE}>Articles & Insights</h1>
          <p className="text-xl text-zinc-600 transition-colors">Actionable career advice, resume strategies, and insights to help you land your next big role.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/${post.slug}`} className="group relative flex flex-col bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all h-full overflow-hidden">
              <div className="w-full aspect-[1200/630] flex relative border-b border-zinc-100 overflow-hidden transition-colors rounded-t-xl group-hover:opacity-90">
                {/* Simulated OpenGraph Left Text Frame (Zero Server Computation) */}
                <div className="flex flex-col justify-between w-[55%] h-full p-4 sm:p-5 bg-white z-10 shrink-0 border-r border-zinc-100">
                  <div className="text-sm sm:text-lg lg:text-xl font-extrabold tracking-tight text-zinc-900 leading-[1.15] break-words">
                    {blogMetadata.find(m => m.slug === post.slug)?.imageText || post.title}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold tracking-tight text-zinc-900">
                    CVin.Bio
                  </div>
                </div>
                {/* Native Unsplash Pull - 100x Faster */}
                <div className="w-[45%] h-full relative bg-zinc-100 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={blogMetadata.find(m => m.slug === post.slug)?.featuredImage} alt={post.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.1] transition-transform duration-700 ease-out" />
                </div>
              </div>
                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <div className="text-[11px] font-semibold text-zinc-400 mb-2 transition-colors uppercase tracking-wider">{post.date}</div>
                  <h2 className="text-sm font-bold text-zinc-900 mb-2 leading-relaxed group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 transition-colors hidden sm:block">{post.excerpt}</p>
                </div>
            </Link>
          ))}
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
