"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titleZh, setTitleZh] = useState("");
  const [titleKo, setTitleKo] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [contentKo, setContentKo] = useState("");
  const [priceKrw, setPriceKrw] = useState("");
  const [published, setPublished] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // 新上传的临时文件（还未传到 Storage）
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      // 检查登录
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/admin/login");
        return;
      }

      // 获取数据
      const { data, error: fetchErr } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !data) {
        setError("未找到该到货通知");
        setLoading(false);
        return;
      }

      setTitleZh(data.title_zh ?? "");
      setTitleKo(data.title_ko ?? "");
      setContentZh(data.content_zh ?? "");
      setContentKo(data.content_ko ?? "");
      setPriceKrw(data.price_krw ? String(data.price_krw) : "");
      setPublished(data.published ?? false);
      setExistingImages(data.images ?? []);
      setLoading(false);
    })();
  }, []);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const total = existingImages.length + pendingFiles.length + selected.length;
    if (total > 9) {
      setError(`最多 9 张图片，当前已有 ${existingImages.length + pendingFiles.length} 张`);
      return;
    }
    setPendingFiles((prev) => [...prev, ...selected].slice(0, 9));
    selected.forEach((f) => {
      pendingPreviews.push(URL.createObjectURL(f));
    });
    setPendingPreviews([...pendingPreviews]);
  }

  function removeExisting(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
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

    setSaving(true);

    try {
      // 1. 上传新图片
      const newUrls: string[] = [];
      for (const file of pendingFiles) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("news-images")
          .upload(fileName, file);
        if (upErr) {
          console.error("上传图片失败:", upErr.message);
          continue;
        }
        const { data: urlData } = supabase.storage
          .from("news-images")
          .getPublicUrl(fileName);
        newUrls.push(urlData.publicUrl);
      }

      // 2. 合并图片 URL（旧 + 新）
      const allImages = [...existingImages, ...newUrls];

      // 3. 更新数据库
      const krw = priceKrw ? parseInt(priceKrw, 10) : null;
      const { error: upErr } = await supabase
        .from("news")
        .update({
          title_zh: titleZh.trim(),
          title_ko: titleKo.trim() || titleZh.trim(),
          content_zh: contentZh.trim(),
          content_ko: contentKo.trim() || contentZh.trim(),
          price_krw: krw,
          images: allImages,
          published,
        })
        .eq("id", id);

      if (upErr) throw new Error(upErr.message);

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        加载中...
      </div>
    );
  }

  if (error && !titleZh) {
    // 仅当数据没加载到时显示错误
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Link
          href="/admin"
          className="rounded-lg bg-[#C8102E] px-6 py-2 text-sm text-white"
        >
          返回后台
        </Link>
      </div>
    );
  }

  const totalImages = existingImages.length + pendingFiles.length;

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">编辑到货通知</h1>
          <p className="text-xs text-gray-400">修改后保存即可更新</p>
        </div>
        <Link href="/admin" className="text-sm text-[#C8102E] underline">
          ← 返回
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 中文信息 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">中文信息</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={contentZh}
                onChange={(e) => setContentZh(e.target.value)}
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
              />
            </div>
          </div>
        </div>

        {/* 韩文信息 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">韩文信息</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                제목 (标题)
              </label>
              <input
                value={titleKo}
                onChange={(e) => setTitleKo(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                내용 (内容)
              </label>
              <textarea
                value={contentKo}
                onChange={(e) => setContentKo(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
              />
            </div>
          </div>
        </div>

        {/* 价格 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">价格（选填）</h2>
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
              className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-4 text-base outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
            />
          </div>
          {priceKrw && (
            <p className="mt-1.5 text-xs text-gray-400">
              约 ¥{Math.round(Number(priceKrw) * 0.0052)}
            </p>
          )}
        </div>

        {/* 图片管理 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">
            商品图片（{totalImages}/9）
          </h2>

          {/* 已有图片 */}
          {existingImages.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {existingImages.map((url, i) => (
                <div key={i} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`图片 ${i + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 新上传预览 */}
          {pendingPreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {pendingPreviews.map((src, i) => (
                <div key={`p${i}`} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`新图片 ${i + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 上传按钮 */}
          {totalImages < 9 && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-400 transition-colors hover:border-gray-400 hover:bg-gray-100"
              >
                📷 上传新图片
              </button>
              <p className="mt-2 text-xs text-gray-400">
                支持拍照或从相册选择，最多 9 张
              </p>
            </>
          )}
        </div>

        {/* 发布选项 */}
        <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
          <input
            id="publish"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-[#C8102E] focus:ring-[#C8102E]"
          />
          <label htmlFor="publish" className="text-sm font-medium">
            发布后立即对顾客可见
          </label>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-14 flex-1 items-center justify-center rounded-xl bg-[#C8102E] px-6 text-base font-medium text-white transition-colors hover:bg-[#A00D24] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存修改"}
          </button>
          <Link
            href="/admin"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-xl border bg-white px-6 text-base font-medium text-gray-500"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
