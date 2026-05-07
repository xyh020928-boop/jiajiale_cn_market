/** 韩元→人民币汇率 */
const KRW_TO_CNY = 0.0052;

/**
 * 格式化双货币价格
 * 返回 { krw: "₩12,000", cny: "¥62" }，若价格为空则返回 null
 */
export function formatPrice(krw: number | null | undefined) {
  if (krw == null) return null;

  const cny = Math.round(krw * KRW_TO_CNY);

  return {
    krw: `₩${krw.toLocaleString()}`,
    cny: `¥${cny}`,
  };
}
