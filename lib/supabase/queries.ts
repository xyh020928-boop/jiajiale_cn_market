/**
 * Supabase 查询结果的显式类型断言工具。
 *
 * 用法：
 *   supabase.from("news").select(...) satisfies Query<NewsRow[]>
 *
 * 或直接用 as ：
 *   supabase.from("news").select(...) as Promise<QueryResult<NewsRow[]>>
 */

export type QueryResult<T> = {
  data: T;
  error: Error | null;
};

export type SingleQueryResult<T> = {
  data: T;
  error: Error | null;
};
