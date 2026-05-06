"use client";

import { useState } from "react";
import { deleteNews } from "@/app/admin/actions";

export function DeleteButton({ newsId }: { newsId: string }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("确定删除这条到货通知吗？")) {
      return;
    }
    setPending(true);
    await deleteNews(newsId);
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "删除中..." : "删除"}
      </button>
    </form>
  );
}
