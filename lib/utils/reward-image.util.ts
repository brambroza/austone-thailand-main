const REWARD_IMAGE_BUCKET = "rewards";

/**
 * สร้าง public URL ของรูปรางวัลจาก id โดยไม่ต้องเรียก server
 *
 * @param rewardId - รหัสรางวัล
 * @param cacheBuster - ระบุเมื่อต้องการรูปล่าสุดเสมอ เช่น หน้า admin หลังอัปโหลดรูปใหม่
 *                      ฝั่งลูกค้าไม่ควรระบุ เพื่อให้ browser cache รูปได้
 * @returns URL ของรูปใน Supabase Storage
 */
export function getRewardImageUrl(
  rewardId: number,
  cacheBuster?: string | number
): string {
  const baseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${REWARD_IMAGE_BUCKET}/${rewardId}.png`;

  return cacheBuster === undefined ? baseUrl : `${baseUrl}?v=${cacheBuster}`;
}
