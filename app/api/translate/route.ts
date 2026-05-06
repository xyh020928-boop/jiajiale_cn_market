import { translateToKorean } from "@/lib/translate";

export async function POST(request: Request) {
  try {
    const { text, target } = await request.json();

    if (!text || typeof text !== "string") {
      return Response.json({ error: "请提供要翻译的文本" }, { status: 400 });
    }

    if (target === "ko") {
      const translated = await translateToKorean(text);
      return Response.json({ translated });
    }

    return Response.json(
      { error: "不支持的目标语言，仅支持 ko" },
      { status: 400 }
    );
  } catch (error) {
    console.error("翻译出错:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "翻译失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}
