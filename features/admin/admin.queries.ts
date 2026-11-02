import { supabaseAnonClient } from "@/lib/anon-supabase";
import { supabaseAdminClient } from "@/lib/supabase";
import {
  chunkItems,
  escapeLikePattern,
  toOrIlikeValue,
} from "@/lib/utils/pagination.util";
import { ProductWithScanner } from "@/models/product.model";

/**
 * ไฟล์นี้ตั้งใจไม่ใช้ "use server" เพื่อไม่ให้ query เหล่านี้ถูกเรียกตรงจาก browser
 * ต้องเรียกผ่าน route ที่ตรวจสิทธิ์แล้วเท่านั้น
 */

const BILL_ID_CHUNK_SIZE = 200;

const MAX_ROWS_PER_REQUEST = 1000;

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export type ProductsPage = PageResult<ProductWithScanner>;

export interface BillsQuery {
  page: number;
  pageSize: number;
  search: string;
  status?: string;
  sortField: "document_date" | "created_at";
  sortDirection: "asc" | "desc";
}

/**
 * ดึงสินค้าทีละหน้า ตารางนี้มีหนึ่งแถวต่อบาร์โค้ดจึงไม่ควรโหลดทั้งหมดมาที่ browser
 *
 * @param page - หน้าที่ต้องการ เริ่มจาก 1
 * @param pageSize - จำนวนแถวต่อหน้า
 * @param search - คำค้นจากรหัสสินค้า
 * @returns แถวของหน้านั้นและจำนวนทั้งหมดที่ตรงเงื่อนไข
 */
export async function fetchProductsPage(
  page: number,
  pageSize: number,
  search: string
): Promise<ProductsPage> {
  const from = (page - 1) * pageSize;

  let query = supabaseAdminClient
    .from("products_with_scanners")
    .select("*", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, from + pageSize - 1);

  if (search) query = query.ilike("id", `%${escapeLikePattern(search)}%`);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return { rows: data ?? [], total: count ?? 0 };
}

/**
 * ดึงบิลทีละหน้า พร้อมข้อมูลเท่าที่ตารางใช้
 * อ่านแถวลูกเฉพาะบิลในหน้านั้น เพราะมีบิลหลายพันใบและสินค้าหลายแสนแถว
 *
 * @param query - หน้า คำค้น ตัวกรองสถานะ และการเรียงลำดับ
 * @returns บิลของหน้านั้นและจำนวนทั้งหมดที่ตรงเงื่อนไข
 */
export async function fetchBillsPage({
  page,
  pageSize,
  search,
  status,
  sortField,
  sortDirection,
}: BillsQuery) {
  const from = (page - 1) * pageSize;

  let query = supabaseAdminClient
    .from("bills")
    .select("*", { count: "exact" })
    .order(sortField, {
      ascending: sortDirection === "asc",
      nullsFirst: false,
    })
    .order("id", { ascending: true })
    .range(from, from + pageSize - 1);

  if (status) query = query.eq("status", status);

  if (search) {
    const value = toOrIlikeValue(search);

    query = query.or(
      `bill_no.ilike.${value},customer_fullname.ilike.${value},customer_email.ilike.${value}`
    );
  }

  const { data: bills, error, count } = await query;

  if (error) throw new Error(error.message);

  const billIdChunks = chunkItems(
    (bills ?? []).map((bill) => bill.id),
    BILL_ID_CHUNK_SIZE
  );

  const [products, constraints] = await Promise.all([
    Promise.all(
      billIdChunks.map((billIds) =>
        readBillChildren("products", "id, bill_id", billIds)
      )
    ),
    Promise.all(
      billIdChunks.map((billIds) =>
        readBillChildren("bill_product_type_constraints", "bill_id, amount", billIds)
      )
    ),
  ]);

  const productsByBillId = groupByBillId(products.flat());
  const constraintsByBillId = groupByBillId(constraints.flat());

  return {
    rows: (bills ?? []).map((bill) => ({
      ...bill,
      products: productsByBillId.get(String(bill.id)) ?? [],
      productTypeConstraints: constraintsByBillId.get(String(bill.id)) ?? [],
    })),
    total: count ?? 0,
  };
}

/** อ่านแถวลูกของบิลหนึ่งชุด โดยแบ่งชุดเพื่อไม่ให้ URL ของ query ยาวเกินไป */
async function readBillChildren(table: string, columns: string, billIds: unknown[]) {
  const { data, error } = await supabaseAdminClient
    .from(table)
    .select(columns)
    .in("bill_id", billIds)
    .returns<{ bill_id: unknown; amount?: number }[]>();

  if (error) throw new Error(error.message);

  return data ?? [];
}

/** จัดกลุ่มแถวตาม bill_id เพื่อไม่ต้องวน filter ทุกแถวต่อหนึ่งบิล */
function groupByBillId<T extends { bill_id: unknown }>(rows: T[]) {
  const groups = new Map<string, T[]>();

  rows.forEach((row) => {
    const key = String(row.bill_id);
    const group = groups.get(key);

    if (group) group.push(row);
    else groups.set(key, [row]);
  });

  return groups;
}

/**
 * ดึงประวัติการแลกของรางวัล
 * อ่านทีละชุดเพราะ Supabase คืนได้สูงสุดครั้งละ 1,000 แถว และประวัติมีเกินจำนวนนี้แล้ว
 *
 * @param period - เดือน (1-12) และปีที่ต้องการ ถ้าไม่ระบุจะดึงทั้งหมด
 * @returns ประวัติเรียงจากใหม่ไปเก่า
 */
export async function fetchClaimedRewardHistories(period?: {
  month: number;
  year: number;
}) {
  const histories: unknown[] = [];

  for (let from = 0; ; from += MAX_ROWS_PER_REQUEST) {
    let query = supabaseAdminClient
      .from("claimed_reward_histories")
      .select(
        "id, reward_id, quantity, user_id, created_at, email, shipping_address, status, rewards(title, required_score), users(full_name, store_name, agent_store_name)"
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + MAX_ROWS_PER_REQUEST - 1);

    if (period) {
      query = query
        .gte("created_at", new Date(period.year, period.month - 1, 1).toISOString())
        .lt("created_at", new Date(period.year, period.month, 1).toISOString());
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    histories.push(...(data ?? []));

    if ((data ?? []).length < MAX_ROWS_PER_REQUEST) return histories;
  }
}

/** ดึงของรางวัลทั้งหมด เรียงจากใหม่ไปเก่า */
export async function fetchRewards() {
  const { data, error } = await supabaseAdminClient
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

/** ดึงประเภทสินค้าทั้งหมด */
export async function fetchProductTypes() {
  const { data, error } = await supabaseAdminClient
    .from("product_types")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

/** ดึงโปรโมชันของประเภทสินค้าทั้งหมด */
export async function fetchProductTypePromotions() {
  const { data, error } = await supabaseAdminClient
    .from("product_types_promotions")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

/**
 * ดึงรายงานคะแนนของผู้ใช้ตามช่วงวันที่
 *
 * @param functionName - ชื่อ database function ของรายงาน
 * @param startDate - วันเริ่มต้นรูปแบบ YYYY-MM-DD
 * @param endDate - วันสิ้นสุดรูปแบบ YYYY-MM-DD
 * @returns แถวของรายงาน
 */
export async function fetchPointReport(
  functionName: "get_user_point_histories" | "get_user_point_accumelate_histories",
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabaseAnonClient.rpc(functionName, {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) throw new Error(error.message);

  return data ?? [];
}
