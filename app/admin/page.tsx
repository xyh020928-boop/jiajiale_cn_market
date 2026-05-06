import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Pencil } from "lucide-react";
import { togglePublish, logout } from "./actions";
import { DeleteButton } from "@/components/admin/delete-button";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = createClient();

  // 检查登录状态
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  // 获取所有到货通知
  const { data: newsList } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  const items = newsList ?? [];

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">管理后台</h1>
          <p className="text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              发布到货
            </Button>
          </Link>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <LogOut className="h-5 w-5" />
              退出
            </Button>
          </form>
        </div>
      </div>

      {/* 列表 */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">还没有到货通知</p>
          <Link href="/admin/new" className="mt-4">
            <Button>发布到货</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              {/* 标题行 */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {item.title_zh}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.title_ko}
                  </p>
                </div>
                <Badge variant={item.published ? "success" : "secondary"}>
                  {item.published ? "已发布" : "未发布"}
                </Badge>
              </div>

              {/* 日期 */}
              <div className="mb-3 text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2">
                {/* 编辑按钮（每个条目都有） */}
                <Link
                  href={`/admin/edit/${item.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  编辑
                </Link>

                {/* 发布/下架按钮 */}
                {item.published ? (
                  <form
                    action={togglePublish.bind(
                      null,
                      item.id,
                      item.published
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                    >
                      下架
                    </button>
                  </form>
                ) : (
                  <form
                    action={togglePublish.bind(
                      null,
                      item.id,
                      item.published
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50"
                    >
                      发布
                    </button>
                  </form>
                )}

                <DeleteButton newsId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
