-- ย้อนกลับ 20261105_fix_point_balance_reports.sql เป็น definition เดิม (ดึงจาก Supabase เมื่อ 2026-11-05)
begin;

create or replace view public.user_info_view as
 SELECT u.user_id, u.full_name, u.gender, u.date_of_birth, u.phone_number, u.store_name, u.province,
    u.created_date, u.verified_at, u.role_id, u.agent_store_name, u.enabled_barcode_scan_at, u.point_multiplier,
    r.title AS role_title,
    COALESCE(sum(
        CASE
            WHEN sb.expired_date > now() AND sb.used_at IS NULL THEN pso.score
            ELSE 0
        END), 0::bigint) AS total_score,
    COALESCE(p.withoutscancount, 0) AS scorewithoutscan
   FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN scanned_barcodes sb ON sb.user_id = u.user_id
     LEFT JOIN product_score_option pso ON sb.product_score_option_id = pso.id
     LEFT JOIN LATERAL ( SELECT count(*)::integer AS withoutscancount
           FROM products_with_scanners s
             LEFT JOIN bills b ON s.bill_no = b.bill_no
             LEFT JOIN users us ON b.customer_fullname = us.store_name::text
          WHERE s.full_name IS NULL AND us.full_name IS NOT NULL AND us.user_id = u.user_id) p ON true
  GROUP BY u.user_id, r.title, p.withoutscancount;

CREATE OR REPLACE FUNCTION public.get_user_point_histories(start_date date, end_date date)
 RETURNS TABLE(full_name text, store_name text, agent_store_name text, phone_number text, province text, total_points integer, used_points integer, available_points integer)
 LANGUAGE sql
AS $function$
    SELECT u.full_name, u.store_name, u.agent_store_name, u.phone_number, u.province,
        COUNT(sb.id) AS total_points,
        COUNT(CASE WHEN sb.used_at IS NOT NULL THEN 1 END) AS used_points,
        COUNT(sb.id) - COUNT(CASE WHEN sb.used_at IS NOT NULL THEN 1 END) AS available_points
    FROM scanned_barcodes AS sb
    LEFT JOIN users AS u ON sb.user_id = u.user_id
    WHERE sb.created_date >= start_date AND sb.created_date <= end_date
    GROUP BY u.full_name, u.store_name, u.agent_store_name, u.phone_number, u.province;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_point_accumelate_histories(start_date date, end_date date)
 RETURNS TABLE(full_name text, store_name text, agent_store_name text, phone_number text, province text, bf_points bigint, accumulate_points bigint, used_points bigint, total_points bigint, available_points bigint)
 LANGUAGE sql
 STABLE
AS $function$
WITH p AS (
  SELECT start_date::timestamp AS date_from, (end_date::timestamp + interval '1 day') AS date_to_excl
),
bf AS (
  SELECT sb.user_id, COUNT(*)::bigint AS bf_points
  FROM scanned_barcodes sb CROSS JOIN p
  WHERE sb.created_date < p.date_from AND (sb.used_at IS NULL OR sb.used_at >= p.date_from)
  GROUP BY sb.user_id
),
earned AS (
  SELECT sb.user_id, COUNT(*)::bigint AS earned_points
  FROM scanned_barcodes sb CROSS JOIN p
  WHERE sb.created_date >= p.date_from AND sb.created_date < p.date_to_excl
  GROUP BY sb.user_id
),
used AS (
  SELECT sb.user_id, COUNT(*)::bigint AS used_points
  FROM scanned_barcodes sb CROSS JOIN p
  WHERE sb.used_at IS NOT NULL AND sb.used_at >= p.date_from AND sb.used_at < p.date_to_excl
  GROUP BY sb.user_id
)
SELECT u.full_name, u.store_name, u.agent_store_name, u.phone_number, u.province,
  COALESCE(bf.bf_points, 0) AS bf_points,
  COALESCE(earned.earned_points, 0) AS accumulate_points,
  COALESCE(used.used_points, 0) AS used_points,
  (COALESCE(bf.bf_points,0) + COALESCE(earned.earned_points,0)) AS total_points,
  (COALESCE(bf.bf_points,0) + COALESCE(earned.earned_points,0) - COALESCE(used.used_points,0)) AS available_points
FROM users u
LEFT JOIN bf ON bf.user_id = u.user_id
LEFT JOIN earned ON earned.user_id = u.user_id
LEFT JOIN used ON used.user_id = u.user_id
WHERE COALESCE(bf.bf_points,0) + COALESCE(earned.earned_points,0) + COALESCE(used.used_points,0) > 0
ORDER BY u.full_name;
$function$;

commit;
