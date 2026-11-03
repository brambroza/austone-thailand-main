-- ตั้งค่าต่อประเภทสินค้าว่าลูกค้าสแกนสะสมแต้มได้หรือไม่
-- ค่าเริ่มต้น true เพื่อให้ประเภทเดิมทุกตัวทำงานเหมือนเดิม
alter table public.product_types
  add column if not exists can_collect_points boolean not null default true;

comment on column public.product_types.can_collect_points is
  'false = ลูกค้าสแกนสินค้าประเภทนี้เพื่อสะสมแต้มไม่ได้ (แต้มที่สะสมแล้วไม่ถูกแตะ)';

-- ตัวอย่าง: ปิดสะสมแต้มทุกประเภทที่ชื่อมี Lanvigator (รันแยกหลังตรวจรายการแล้ว)
-- select id, title from public.product_types where title ilike '%lanvigator%';
-- update public.product_types set can_collect_points = false where title ilike '%lanvigator%';
