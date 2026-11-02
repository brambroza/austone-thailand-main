import { getProductScoreOptionById } from "@/actions/queries/product-score-option.action";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ProductScoreOptionIdSchema = z.coerce.number().int().positive();

/** คืนตัวเลือกคะแนนสินค้าตาม id */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const parsedId = ProductScoreOptionIdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const actionResult = await getProductScoreOptionById({ id: parsedId.data });

  if (!actionResult?.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(actionResult.data);
}
