-- Crawler hit recorder (Applebot/Googlebot/Bing/AI verification).
create table if not exists public.crawler_hits (
  id bigint generated always as identity primary key,
  crawler text not null,
  path text not null,
  created_at timestamptz not null default now()
);
create index if not exists crawler_hits_created_idx on public.crawler_hits (created_at desc);
create index if not exists crawler_hits_crawler_idx on public.crawler_hits (crawler);
alter table public.crawler_hits enable row level security;
