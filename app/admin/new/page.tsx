"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { X, ImagePlus, Sparkles, Loader2 } from "lucide-react";

export default function NewNewsPage() {
  const [titleZh, setTitleZh] = useState("");
  const [titleKo, setTitleKo] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [contentKo, setContentKo] = useState("");
  const [priceKrw, setPriceKrw] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const newFiles = [...files, ...selected].slice(0, 9);
    setFiles(newFiles);

    const newPreviews: string[] = [];
    newFiles.forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
    });
    setPreviews(newPreviews);
  }

  function removeFile(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  /** 调用翻译 API */
  async function translate(field: "title" | "content") {
    const text = field === "title" ? titleZh.trim() : contentZh.trim();
    if (!text) {
      setError(`请先填写中文${field === "title" ? "标题" : "内容"}`);
      return;
    }

    setTranslating(true);
    setError(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: "ko" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "翻译失败");
      }

      if (field === "title") {
        setTitleKo(data.translated);
      } else {
        setContentKo(data.translated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻译失败");
    } finally {
      setTranslating(false);
    }
  }

  /** 一键翻译全部 */
  async function translateAll() {
    if (!titleZh.trim()) {
      setError("请先填写中文标题");
      return;
    }

    setTranslating(true);
    setError(null);

    try {
      const promises: Promise<Response>[] = [];

      if (titleZh.trim()) {
        promises.push(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: titleZh.trim(), target: "ko" }),
          })
        );
      }

      if (contentZh.trim()) {
        promises.push(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: contentZh.trim(), target: "ko" }),
          })
        );
      }

      const responses = await Promise.all(promises);
      let idx = 0;

      if (titleZh.trim()) {
        const data = await responses[idx++].json();
        if (data.translated) setTitleKo(data.translated);
      }

      if (contentZh.trim()) {
        const data = await responses[idx++].json();
        if (data.translated) setContentKo(data.translated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻译失败");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titleZh.trim()) {
      setError("请输入中文标题");
      return;
    }
    if (!contentZh.trim()) {
      setError("请输入中文内容");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      // 上传图片到 Supabase Storage
      const imageUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("上传图片失败:", uploadError.message);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("news-images")
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }

      // 直接发布（published = true）
      const krw = priceKrw ? parseInt(priceKrw, 10) : null;
      const { error: insertError } = await supabase.from("news").insert({
        title_zh: titleZh.trim(),
        title_ko: titleKo.trim() || titleZh.trim(),
        content_zh: contentZh.trim(),
        content_ko: contentKo.trim() || contentZh.trim(),
        images: imageUrls,
        price_krw: krw,
        published: true,
        created_by: session.user.id,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-xl font-bold text-foreground">发布到货通知</h1>
        <p className="text-sm text-muted-foreground">
          填写中文信息后，点「AI 翻译」自动生成韩文
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 中文信息 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            ① 中文信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                placeholder="例如：新到青岛啤酒"
                required
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={contentZh}
                onChange={(e) => setContentZh(e.target.value)}
                placeholder="详细描述到货的商品..."
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 韩文信息 — AI 翻译 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              ② 韩文信息（AI 翻译）
            </h2>
            <button
              type="button"
              onClick={translateAll}
              disabled={translating || !titleZh.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {translating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {translating ? "翻译中..." : "一键翻译"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  제목 (标题)
                </label>
                <button
                  type="button"
                  onClick={() => translate("title")}
                  disabled={translating || !titleZh.trim()}
                  className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  翻译标题
                </button>
              </div>
              <input
                value={titleKo}
                onChange={(e) => setTitleKo(e.target.value)}
                placeholder="AI 自动翻译..."
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  내용 (内容)
                </label>
                <button
                  type="button"
                  onClick={() => translate("content")}
                  disabled={translating || !contentZh.trim()}
                  className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  翻译内容
                </button>
              </div>
              <textarea
                value={contentKo}
                onChange={(e) => setContentKo(e.target.value)}
                placeholder="AI 自动翻译..."
                rows={4}
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              翻译结果可以手动修改，不满意可以重新翻译
            </p>
          </div>
        </div>

        {/* 价格 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            ③ 价格（选填）
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
                type="number"
                min="0"
                value={priceKrw}
                onChange={(e) => setPriceKrw(e.target.value)}
                placeholder="12000"
                className="h-12 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {priceKrw && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                约 ¥{Math.round(Number(priceKrw) * 0.0052)}
              </p>
            )}
          </div>
        </div>

        {/* 图片上传 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            ④ 商品图片
          </h2>

          {previews.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`预览 ${i + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-gray-400 hover:bg-gray-100"
          >
            <ImagePlus className="h-6 w-6" />
            <span>点击选择图片（最多 9 张）</span>
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex gap-3">
          <Button
            type="submit"
            size="xl"
            className="flex-1"
            disabled={loading || translating}
          >
            {loading ? "发布中..." : "立即发布"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xl"
            onClick={() => router.push("/admin")}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
