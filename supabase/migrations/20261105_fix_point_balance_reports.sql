-- ให้ยอดแต้มในหน้า admin คิดแบบเดียวกับ user_points_view (ยอดที่แอปลูกค้าและการแลกรางวัลใช้)
--   แต้มต่อแถว = product_score_option.score x coalesce(point_multiplier, 1)
--   เดิมนับเป็นจำนวนแถว จึงผิดกับแถวปรับยอด (ADJ-*, point_multiplier ติดลบ) และแถวที่มีตัวคูณแต้ม
--   ยอดคงเหลือไม่นับแต้มที่หมดอายุ
-- ทุกตัวคงชื่อ column และชนิดข้อมูลเดิม หน้าเว็บจึงไม่ต้องแก้

begin;

-- 1) user_info_view.total_score  (หน้า /admin/users)
--    เดิม sum(pso.score) ไม่คูณ point_multiplier
create or replace view public.user_info_view as
select u.user_id,
       u.full_name,
       u.gender,
       u.date_of_birth,
       u.phone_number,
       u.store_name,
       u.province,
       u.created_date,
       u.verified_at,
       u.role_id,
       u.agent_store_name,
       u.enabled_barcode_scan_at,
       u.point_multiplier,
       r.title as role_title,
       coalesce(sum(
         case
           when sb.expired_date > now() and sb.used_at is null
             then pso.score * coalesce(sb.point_multiplier::integer, 1)
           else 0
         end), 0::bigint) as total_score,
       coalesce(p.withoutscancount, 0) as scorewithoutscan
from users u
left join roles r on u.role_id = r.id
left join scanned_barcodes sb on sb.user_id = u.user_id
left join product_score_option pso on sb.product_score_option_id = pso.id
left join lateral (
  select count(*)::integer as withoutscancount
  from products_with_scanners s
  left join bills b on s.bill_no = b.bill_no
  left join users us on b.customer_fullname = us.store_name::text
  where s.full_name is null and us.full_name is not null and us.user_id = u.user_id
) p on true
group by u.user_id, r.title, p.withoutscancount;

-- 2) get_user_point_histories  (หน้า /admin/point-histories)
--    total_points     = แต้มที่ได้ในช่วงวันที่ (รวมแถวปรับยอดที่ติดลบ)
--    used_points      = แต้มที่ถูกใช้แลกรางวัล
--    available_points = แต้มที่ยังไม่ใช้และยังไม่หมดอายุ
--    หมายเหตุ: total - used จะไม่เท่ากับ available เมื่อมีแต้มหมดอายุ
create or replace function public.get_user_point_histories(start_date date, end_date date)
returns table(
  full_name text, store_name text, agent_store_name text, phone_number text, province text,
  total_points integer, used_points integer, available_points integer
)
language sql
stable
as $function$
  select
    u.full_name,
    u.store_name,
    u.agent_store_name,
    u.phone_number,
    u.province,
    coalesce(sum(pso.score * coalesce(sb.point_multiplier::integer, 1)), 0)::integer as total_points,
    coalesce(sum(pso.score * coalesce(sb.point_multiplier::integer, 1))
      filter (where sb.used_at is not null), 0)::integer as used_points,
    coalesce(sum(pso.score * coalesce(sb.point_multiplier::integer, 1))
      filter (where sb.used_at is null and sb.expired_date > now()), 0)::integer as available_points
  from scanned_barcodes as sb
  join product_score_option pso on pso.id = sb.product_score_option_id
  left join users as u on sb.user_id = u.user_id
  where sb.created_date >= start_date and sb.created_date <= end_date
  group by u.full_name, u.store_name, u.agent_store_name, u.phone_number, u.province;
$function$;

-- 3) get_user_point_accumelate_histories  (หน้า /admin/point-accumulate-histories)
--    คงสูตรงวดเดิม bf + ได้ในงวด - ใช้ในงวด แต่นับเป็นแต้ม
--    bf ไม่นับแต้มที่หมดอายุก่อนต้นงวด
--    available_points หักแต้มที่หมดอายุภายในงวดออกด้วย
--    หมายเหตุ: available อาจน้อยกว่า total - used เท่ากับแต้มที่หมดอายุในงวด
create or replace function public.get_user_point_accumelate_histories(start_date date, end_date date)
returns table(
  full_name text, store_name text, agent_store_name text, phone_number text, province text,
  bf_points bigint, accumulate_points bigint, used_points bigint, total_points bigint, available_points bigint
)
language sql
stable
as $function$
with p as (
  select start_date::timestamp as date_from,
         (end_date::timestamp + interval '1 day') as date_to_excl
),
pts as (
  select sb.user_id,
         sb.created_date,
         sb.used_at,
         sb.expired_date,
         (pso.score * coalesce(sb.point_multiplier::integer, 1))::bigint as points
  from scanned_barcodes sb
  join product_score_option pso on pso.id = sb.product_score_option_id
),
bf as (
  select pts.user_id, sum(pts.points)::bigint as bf_points
  from pts cross join p
  where pts.created_date < p.date_from
    and (pts.used_at is null or pts.used_at >= p.date_from)
    and (pts.used_at is not null or pts.expired_date >= p.date_from)
  group by pts.user_id
),
earned as (
  select pts.user_id, sum(pts.points)::bigint as earned_points
  from pts cross join p
  where pts.created_date >= p.date_from
    and pts.created_date <  p.date_to_excl
  group by pts.user_id
),
used as (
  select pts.user_id, sum(pts.points)::bigint as used_points
  from pts cross join p
  where pts.used_at is not null
    and pts.used_at >= p.date_from
    and pts.used_at <  p.date_to_excl
  group by pts.user_id
),
expired as (
  -- แต้มที่ยังไม่ใช้และหมดอายุภายในงวด หรือหมดอายุไปแล้ว ณ วันนี้ถ้างวดยังไม่จบ
  select pts.user_id, sum(pts.points)::bigint as expired_points
  from pts cross join p
  where pts.used_at is null
    and pts.expired_date >= p.date_from
    and pts.expired_date <  least(p.date_to_excl, now())
  group by pts.user_id
)
select
  u.full_name,
  u.store_name,
  u.agent_store_name,
  u.phone_number,
  u.province,
  coalesce(bf.bf_points, 0)         as bf_points,
  coalesce(earned.earned_points, 0) as accumulate_points,
  coalesce(used.used_points, 0)     as used_points,
  (coalesce(bf.bf_points, 0) + coalesce(earned.earned_points, 0)) as total_points,
  (coalesce(bf.bf_points, 0) + coalesce(earned.earned_points, 0)
     - coalesce(used.used_points, 0) - coalesce(expired.expired_points, 0)) as available_points
from users u
left join bf      on bf.user_id = u.user_id
left join earned  on earned.user_id = u.user_id
left join used    on used.user_id = u.user_id
left join expired on expired.user_id = u.user_id
where coalesce(bf.bf_points, 0) <> 0
   or coalesce(earned.earned_points, 0) <> 0
   or coalesce(used.used_points, 0) <> 0
order by u.full_name;
$function$;

-- ตรวจก่อน commit: ยอดของ ส.ยางยนต์ทั้ง 3 ที่ต้องเป็น -258 (หรือบวกสแกนใหม่)
select
  u.store_name,
  (select coalesce(sum(v.score), 0) from public.user_points_view v
    where v.user_id = u.user_id and v.used_at is null and v.expired_date >= now()) as balance_real,
  u.total_score as admin_users_page,
  (select h.available_points from public.get_user_point_histories('2020-01-01', '2099-12-31') h
    where h.store_name = u.store_name and h.full_name = u.full_name) as point_history_page,
  (select a.available_points from public.get_user_point_accumelate_histories('2020-01-01', '2099-12-31') a
    where a.store_name = u.store_name and a.full_name = u.full_name) as accumulate_page
from public.user_info_view u
where u.store_name ilike '%ส.ยางยนต์%';

commit;

-- ย้อนกลับ: รัน definition เดิมที่ได้จาก pg_get_viewdef / pg_get_functiondef (2026-11-05)
