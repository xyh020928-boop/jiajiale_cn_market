import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateNews } from "../../actions";
import type { NewsRow } from "@/lib/supabase/types";
import Link from "next/link";

type Props = {
  params: { id: string };
};

export default async function EditNewsPage({ params }: Props) {
  const { id } = params;
  const supabase = createClient();

  // 检查登录
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // 获取要编辑的条目
  const { data: itemData, error } = await supabase
    .from("news")
    .select("id,created_at,updated_at,title_zh,title_ko,content_zh,content_ko,images,published,created_by")
    .eq("id", id)
    .single();

  if (error || !itemData) {
    notFound();
    return;
  }

  const item = itemData as NewsRow;

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">编辑到货通知</h1>
          <p className="text-sm text-muted-foreground">
            修改后保存即可更新
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">
            ← 返回草稿箱
          </Button>
        </Link>
      </div>

      <form action={updateNews} className="space-y-6">
        {/* 隐藏 ID */}
        <input type="hidden" name="id" value={item.id} />

        {/* 中文信息 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            中文信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                name="title_zh"
                defaultValue={item.title_zh}
                required
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content_zh"
                defaultValue={item.content_zh}
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 韩文信息 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            韩文信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                제목 (标题)
              </label>
              <input
                name="title_ko"
                defaultValue={item.title_ko}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                내용 (内容)
              </label>
              <textarea
                name="content_ko"
                defaultValue={item.content_ko}
                rows={4}
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 价格 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            价格（选填）
          </h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              韩元价格 ₩
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-400">
                ₩
              </span>
              <input
                name="price_krw"
                type="number"
                min="0"
                defaultValue={item.price_krw ?? ""}
                placeholder="12000"
                className="h-12 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 发布选项 */}
        <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
          <input
            id="publish"
            name="publish"
            type="checkbox"
            defaultChecked={item.published}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="publish"
            className="text-sm font-medium text-foreground"
          >
            发布后立即对顾客可见
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            保存修改
          </button>
          <Link href="/admin" className="flex-1">
            <Button
              type="button"
              variant="outline"
              size="xl"
              className="w-full"
            >
              取消
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
