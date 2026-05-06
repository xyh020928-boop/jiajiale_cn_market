-- ============================================
-- 家家乐超市 (가가락마트) 数据库 Schema
-- 在 Supabase SQL Editor 中运行此文件
-- ============================================

-- 1. 扩展：自动更新 updated_at
create extension if not exists "moddatetime" with schema "extensions";

-- 2. 到货通知表
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title_zh text not null,          -- 中文标题
  title_ko text not null,          -- 韩文标题
  content_zh text not null,        -- 中文内容
  content_ko text not null,        -- 韩文内容
  images text[] not null default '{}',  -- Supabase Storage URL 数组
  published boolean not null default false,
  created_by uuid not null references auth.users(id) default auth.uid()
);

-- 3. 自动 updated_at 触发器
create trigger on_news_updated before update on public.news
  for each row execute function extensions.moddatetime(updated_at);

-- 4. 行级安全 (RLS)
alter table public.news enable row level security;

-- 任何人都可以查看已发布的到货通知
create policy "Anyone can view published news"
  on public.news for select
  using (published = true);

-- 管理员（已登录用户）可以查看所有到货通知（含未发布）
create policy "Admin can view all news"
  on public.news for select
  using (auth.role() = 'authenticated');

-- 管理员可以发布新到货通知
create policy "Admin can insert news"
  on public.news for insert
  with check (auth.role() = 'authenticated');

-- 管理员可以更新
create policy "Admin can update news"
  on public.news for update
  using (auth.role() = 'authenticated');

-- 管理员可以删除
create policy "Admin can delete news"
  on public.news for delete
  using (auth.role() = 'authenticated');

-- 5. Storage：商品图片存储桶
insert into storage.buckets (id, name, public, avif_autodetection)
values ('news-images', 'news-images', true, false)
on conflict (id) do nothing;

-- 任何人都可以查看图片
create policy "Anyone can view news images"
  on storage.objects for select
  using (bucket_id = 'news-images');

-- 管理员可以上传图片
create policy "Admin can upload news images"
  on storage.objects for insert
  with check (
    bucket_id = 'news-images'
    and auth.role() = 'authenticated'
  );

-- 管理员可以删除图片
create policy "Admin can delete news images"
  on storage.objects for delete
  using (
    bucket_id = 'news-images'
    and auth.role() = 'authenticated'
  );

-- 6. 索引：按发布时间降序
create index idx_news_published_created
  on public.news (published, created_at desc);
