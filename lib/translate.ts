const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * 调用 DeepSeek API 将中文文本翻译成韩文
 */
export async function translateToKorean(text: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的中韩翻译。将用户提供的中文文本翻译成自然流畅的韩文。" +
            "只输出翻译结果，不要加解释、不要加引号、不要加额外说明。" +
            "如果是商品名称，保持品牌名的正确韩文写法。",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`翻译 API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const translated = data.choices?.[0]?.message?.content?.trim();

  if (!translated) {
    throw new Error("翻译结果为空");
  }

  return translated;
}
