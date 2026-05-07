-- 请在 Supabase SQL Editor 中运行
-- 给 news 表添加价格字段

alter table public.news
add column price_krw integer;

comment on column public.news.price_krw is '韩元价格（₩），为空则不显示';
