-- ยกเลิกแต้มย้อนหลังของสินค้า Lanvigator แบบ manual (รันใน Supabase SQL Editor ทีละขั้น)
-- ประเภทสินค้า Lanvigator ณ 2026-11-03: 39, 40, 42, 47, 48, 49
--
-- วิธีที่ใช้: ทำให้แต้มที่ยังไม่ถูกใช้ "หมดอายุทันที" แทนการลบแถว
--   - ยอดแต้มคงเหลือลดลง เพราะ view นับเฉพาะแถวที่ยังไม่หมดอายุและยังไม่ถูกใช้
--   - ประวัติการสแกนยังอยู่ และย้อนกลับได้จากตาราง backup
--   - แต้มที่ถูกใช้แลกรางวัลไปแล้ว (used_at ไม่ว่าง) ไม่ถูกแตะ
--   - ไม่ใช้ used_at เพราะ refundUserScoreNew จะเลือกแถวที่มี used_at ไปคืนแต้มได้

-- ขั้นที่ 1: ดูผลกระทบรายคนก่อน (อ่านอย่างเดียว)
select
  sb.user_id,
  u.full_name,
  count(*)               as lanvigator_rows,
  sum(s.actual_score)    as points_to_cancel
from public.scanned_barcodes sb
join public.products p on p.id = sb.product_id
join public.scanned_barcodes_with_score s on s.id = sb.id
left join public.user_info_view u on u.user_id = sb.user_id
where p.product_type_id in (39, 40, 42, 47, 48, 49)
  and sb.used_at is null
  and sb.expired_date >= current_date
  -- ถ้าจะยกเลิกเฉพาะที่สแกนหลังวันที่กำหนด ให้เปิดบรรทัดนี้
  -- and sb.created_date >= '2026-11-01'
group by sb.user_id, u.full_name
order by points_to_cancel desc;

-- ขั้นที่ 2: เก็บ backup แล้วทำให้หมดอายุ (รันทั้งก้อน)
begin;

create table public.backup_cancel_lanvigator_20261103 as
select sb.*
from public.scanned_barcodes sb
join public.products p on p.id = sb.product_id
where p.product_type_id in (39, 40, 42, 47, 48, 49)
  and sb.used_at is null
  and sb.expired_date >= current_date
  -- ต้องใส่เงื่อนไขวันที่ให้ตรงกับขั้นที่ 1 ถ้าใช้
  -- and sb.created_date >= '2026-11-01'
;

update public.scanned_barcodes sb
set expired_date = current_date - 1  -- expired_date เป็นชนิด date
from public.backup_cancel_lanvigator_20261103 b
where sb.id = b.id;

-- จำนวนแถวที่ update ต้องเท่ากับจำนวนแถวใน backup ถ้าไม่เท่าให้ rollback;
select count(*) as backup_rows from public.backup_cancel_lanvigator_20261103;

commit;

-- ย้อนกลับ (ถ้าต้องการคืนแต้ม)
-- update public.scanned_barcodes sb
-- set expired_date = b.expired_date
-- from public.backup_cancel_lanvigator_20261103 b
-- where sb.id = b.id;

-- ============================================================
-- ส่วนที่ 2: ดึงแต้มที่ถูกใช้แลกรางวัลไปแล้วคืน (ยอมให้ติดลบ)
-- ============================================================
-- แถวที่ used_at ไม่ว่างไม่อยู่ในยอดคงเหลือแล้ว แก้แถวเดิมจึงไม่มีผล
-- วิธีที่ใช้: เพิ่ม "แถวปรับยอด" 1 แถวต่อคน ที่มี point_multiplier ติดลบ
--   actual_score = score (1) x point_multiplier จึงหักออกจากยอดรวมตรงๆ
--   expired_date = 2099-12-31 ให้ไม่หมดอายุ และอยู่ท้ายสุดตอนระบบหักแต้มแลกรางวัล
--   ยอดติดลบ = แลกรางวัลไม่ได้ จนกว่าจะสแกนสะสมใหม่จนเป็นบวก
--   product_id ขึ้นต้นด้วย ADJ- ใช้หาและลบทิ้งเมื่อต้องการย้อนกลับ

-- ขั้นที่ 2.0: ตรวจว่า view คิดแต้มด้วย point_multiplier จริง (อ่านอย่างเดียว)
-- ต้องเห็น point_multiplier ใน user_points_view และ scanned_barcodes_with_score
select pg_get_viewdef('public.user_points_view', true);
select pg_get_viewdef('public.scanned_barcodes_with_score', true);

-- ขั้นที่ 2.1: ดูยอดที่จะหักรายคน (อ่านอย่างเดียว)
select
  sb.user_id,
  u.full_name,
  u.store_name,
  count(*)              as used_rows,
  sum(s.actual_score)   as used_points_to_claw_back,
  u.total_score         as balance_now,
  u.total_score - sum(s.actual_score) as balance_after
from public.scanned_barcodes sb
join public.products p on p.id = sb.product_id
join public.scanned_barcodes_with_score s on s.id = sb.id
left join public.user_info_view u on u.user_id = sb.user_id
where p.product_type_id in (39, 40, 42, 47, 48, 49)
  and sb.used_at is not null
  -- and sb.created_date >= '2026-11-01'
group by sb.user_id, u.full_name, u.store_name, u.total_score
order by used_points_to_claw_back desc;

-- ขั้นที่ 2.2: เพิ่มแถวปรับยอด (รันทั้งก้อน)
begin;

create table public.backup_clawback_lanvigator_20261105 as
select
  sb.user_id,
  sum(s.actual_score)::int as clawback_points
from public.scanned_barcodes sb
join public.products p on p.id = sb.product_id
join public.scanned_barcodes_with_score s on s.id = sb.id
where p.product_type_id in (39, 40, 42, 47, 48, 49)
  and sb.used_at is not null
  -- and sb.created_date >= '2026-11-01'
group by sb.user_id
having sum(s.actual_score) > 0;

-- point_multiplier เป็น smallint ต้องไม่เกิน 32767 ต่อแถว ถ้าแถวนี้คืนผล ให้ rollback แล้วแจ้ง dev
select * from public.backup_clawback_lanvigator_20261105 where clawback_points > 32767;

insert into public.scanned_barcodes
  (product_id, user_id, product_score_option_id, point_multiplier, expired_date, created_date, used_at)
select
  'ADJ-LANVIGATOR-20261105-' || b.user_id,
  b.user_id,
  1,                                   -- score = 1
  (-b.clawback_points)::smallint,
  date '2099-12-31',
  (now() at time zone 'Asia/Bangkok'),
  null
from public.backup_clawback_lanvigator_20261105 b;

-- ตรวจ: ยอดแถวปรับยอดต้องเท่ากับยอดใน backup (ค่าติดลบ)
select sum(s.actual_score) as inserted_total,
       (select -sum(clawback_points) from public.backup_clawback_lanvigator_20261105) as expected_total
from public.scanned_barcodes sb
join public.scanned_barcodes_with_score s on s.id = sb.id
where sb.product_id like 'ADJ-LANVIGATOR-20261105-%';

commit;

-- ย้อนกลับส่วนที่ 2 (คืนยอดเดิม)
-- delete from public.scanned_barcodes where product_id like 'ADJ-LANVIGATOR-20261105-%';

-- ============================================================
-- ส่วนที่ 3 (2026-11-05): แก้แถวปรับยอดที่ถูก insert ซ้ำ
-- ============================================================
-- ส่วนที่ 2 ถูกรันซ้ำ แถว ADJ-LANVIGATOR-2026110523-* หักซ้ำกับ ADJ-LANVIGATOR-20261105-* ของ 7 คน
-- ลบชุดซ้ำออก ให้เหลือคนละ 1 แถว (ค่าเดิมอยู่ใน backup_clawback_lanvigator_202611023)

-- ตรวจก่อน: ต้องได้ 7 แถว และทุก user_id ต้องมีแถว ADJ-LANVIGATOR-20261105-* อยู่แล้ว
select d.id, d.user_id, d.point_multiplier,
       exists (
         select 1 from public.scanned_barcodes k
         where k.product_id = 'ADJ-LANVIGATOR-20261105-' || d.user_id
       ) as has_original
from public.scanned_barcodes d
where d.product_id like 'ADJ-LANVIGATOR-2026110523-%';

begin;

delete from public.scanned_barcodes d
where d.product_id like 'ADJ-LANVIGATOR-2026110523-%'
  and exists (
    select 1 from public.scanned_barcodes k
    where k.product_id = 'ADJ-LANVIGATOR-20261105-' || d.user_id
  );

-- ต้องเหลือแถวปรับยอดคนละ 1 แถว รวม 8 แถว ยอด -5873
select count(*) as adj_rows, sum(point_multiplier) as adj_total,
       count(distinct user_id) as users
from public.scanned_barcodes
where product_id like 'ADJ-LANVIGATOR-%';

commit;
