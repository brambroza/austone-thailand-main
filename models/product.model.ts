import { z } from "zod";
import { ADD_PRODUCT_METHOD } from "./enums/product.enum";
import { BillSchema } from "@/features/bills/types/bill.type";

export const ProductSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  method: z.nativeEnum(ADD_PRODUCT_METHOD),
  updated_at: z.string(),
  product_type_id: z.number().nullable(),
  updated_by_user_id: z.string().nullable(),
  bill_id: z.string().nullable(),
});

export const ProductWithScannerSchema = ProductSchema.extend({
  full_name: z.string(),
  bill_no: BillSchema.shape.bill_no.nullable(),
});

export const ProductWithProductTypeSchema = ProductSchema.extend({
  product_type: z.object({
    id: z.number(),
    title: z.string(),
  }),
});

export type Product = z.infer<typeof ProductSchema>;

export type ProductWithProductType = z.infer<
  typeof ProductWithProductTypeSchema
>;

export type ProductWithScanner = z.infer<typeof ProductWithScannerSchema>;
