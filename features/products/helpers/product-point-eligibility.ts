// ใช้จาก server action เท่านั้น เพราะใช้ service key
import { supabaseAdminClient } from "@/lib/supabase";

export const NOT_COLLECTABLE_MESSAGE = "สินค้านี้ไม่ร่วมรายการสะสมแต้ม";

type ProductWithTypeFlag = {
  id: string;
  product_type: { can_collect_points: boolean | null } | null;
};

/**
 * หาสินค้าที่อยู่ในประเภทซึ่งปิดการสะสมแต้มไว้
 * ประเภทที่ไม่ได้ตั้งค่า (null) และสินค้าที่ไม่มีประเภท ถือว่าสะสมได้
 *
 * @param productIds - รหัสสินค้าที่จะตรวจ
 * @returns รหัสสินค้าที่สะสมแต้มไม่ได้
 */
export async function findNotCollectableProductIds(
  productIds: string[]
): Promise<string[]> {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (ids.length === 0) return [];

  const { data, error } = await supabaseAdminClient
    .from("products")
    .select("id, product_type:product_type_id (can_collect_points)")
    .in("id", ids)
    .returns<ProductWithTypeFlag[]>();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((product) => product.product_type?.can_collect_points === false)
    .map((product) => product.id);
}
