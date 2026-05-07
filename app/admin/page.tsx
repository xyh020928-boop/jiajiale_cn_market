"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { togglePublish, logout } from "./actions";
import { DeleteButton } from "@/components/admin/delete-button";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. 检查登录
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/admin/login");
        return;
      }
      setSession(sessionData.session);

      // 2. 获取数据
      try {
        const { data } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) setItems(data);
      } catch {
        // 查询失败就显示空列表
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">管理后台</h1>
          <p className="text-xs text-gray-400">{session?.user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C8102E] px-4 text-sm font-medium text-white"
          >
            ＋ 发布到货
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg border px-3 text-sm text-gray-500"
            >
              退出
            </button>
          </form>
        </div>
      </div>

      {/* 列表 */}
      {items.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p>还没有到货通知</p>
          <Link
            href="/admin/new"
            className="mt-4 inline-block rounded-lg bg-[#C8102E] px-6 py-2 text-sm text-white"
          >
            发布到货
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
              {/* 标题 */}
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-gray-800">
                    {item.title_zh}
                  </h2>
                  <p className="truncate text-xs text-gray-400">{item.title_ko}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    item.published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.published ? "已发布" : "未发布"}
                </span>
              </div>

              {/* 日期 */}
              <p className="mb-3 text-xs text-gray-400">
                {new Date(item.created_at).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* 按钮 */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/edit/${item.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                >
                  ✏️ 编辑
                </Link>

                <form action={togglePublish.bind(null, item.id, item.published)}>
                  <button
                    type="submit"
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      item.published
                        ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {item.published ? "下架" : "发布"}
                  </button>
                </form>

                <DeleteButton newsId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
