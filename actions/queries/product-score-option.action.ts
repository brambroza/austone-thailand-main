"use server";

import { safeActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/lib/supabase";
import {
  ProductScoreOption,
  ProductScoreOptionSchema,
} from "@/models/product-score-option.model";

const TABLE_NAME = "product_score_option";

export const getProductScoreOptionById = safeActionClient
  .schema(ProductScoreOptionSchema.partial().pick({ id: true }))
  .action(async ({ parsedInput: { id } }) => {
    const { data: productScoreOption, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .returns<ProductScoreOption>()
      .single();

    if (error) throw new Error(error.message);

    return productScoreOption;
  });
