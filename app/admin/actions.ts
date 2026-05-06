"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function togglePublish(id: string, current: boolean) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("未登录");
  }

  const { error } = await supabase
    .from("news")
    .update({ published: !current })
    .eq("id", id);

  if (error) {
    throw new Error(`更新失败: ${error.message}`);
  }

  revalidatePath("/admin");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** 编辑草稿 / 更新已发布内容 */
export async function updateNews(formData: FormData) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("未登录");
  }

  const id = formData.get("id") as string;
  const titleZh = formData.get("title_zh") as string;
  const titleKo = formData.get("title_ko") as string;
  const contentZh = formData.get("content_zh") as string;
  const contentKo = formData.get("content_ko") as string;
  const publish = formData.get("publish") === "on";

  if (!id || !titleZh || !contentZh) {
    throw new Error("请填写必要信息");
  }

  const { error } = await supabase
    .from("news")
    .update({
      title_zh: titleZh.trim(),
      title_ko: titleKo.trim() || titleZh.trim(),
      content_zh: contentZh.trim(),
      content_ko: contentKo.trim() || contentZh.trim(),
      published: publish,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`更新失败: ${error.message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteNews(id: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("未登录");
  }

  // 先删除关联的存储图片
  const { data: item } = await supabase
    .from("news")
    .select("images")
    .eq("id", id)
    .single();

  if (item?.images?.length) {
    const paths = item.images.map((url: string) => {
      const parts = url.split("/news-images/");
      return parts[1] || "";
    }).filter(Boolean);

    if (paths.length > 0) {
      await supabase.storage.from("news-images").remove(paths);
    }
  }

  // 删除数据库记录
  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    throw new Error(`删除失败: ${error.message}`);
  }

  revalidatePath("/admin");
}
