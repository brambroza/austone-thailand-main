import { z } from "zod";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { ProductTypeSchema } from "@/features/products/types/product.type";
import { BILL_STATUS } from "../enums/bill.enum";
import { Product } from "@/models/product.model";
import { ProductWithProductType } from "@/models/product.model";
export const BillProductSchema = z.object({
  id: z.string({ required_error: "กรุณาระบุรหัสสินค้า" }),
  product_type: ProductTypeSchema,
  product_type_id: z.number().nullable(),
  bill_id: z.string().nullable(),
  method: z.nativeEnum(ADD_PRODUCT_METHOD, {
    required_error: "กรุณาระบุวิธีการเพิ่มสินค้า",
  }),
});

export const BillProductTypeConstraintSchema = z.object({
  id: z.number({ required_error: "กรุณาระบุรหัสประเภทสินค้า" }),
  created_at: z.string().datetime().optional(),
  product_type_id: z.number().nullable(),
  product_type: ProductTypeSchema,
  bill_id: z.number({ required_error: "กรุณาระบุรหัสบิล" }),
  amount: z.number({ required_error: "กรุณาระบุจำนวนสินค้า" }),
});

export const BillSchema = z.object({
  id: z.number({ required_error: "กรุณาระบุรหัสบิล" }),
  bill_no: z.string({ message: "กรุณากรอกเลขที่บิล" }).min(1, {
    message: "กรุณากรอกเลขที่บิล",
  }),
  customer_fullname: z.string({ message: "กรุณากรอกชื่อลูกค้า" }).min(1, {
    message: "กรุณากรอกชื่อลูกค้า",
  }),
  customer_email: z.string().optional().nullable(),
  created_at: z.string().datetime().optional(),
  document_date: z.string({ message: "กรุณากรอกวันที่บิล" }),
  updated_at: z.string().datetime().optional(),
  products: z.array(BillProductSchema).optional(),
  product_type_constraints: z
    .array(BillProductTypeConstraintSchema, {
      message: "กรุณาระบุประเภทสินค้า",
    })
    .optional(),
  status: z.nativeEnum(BILL_STATUS),
});

export type BillProduct = z.infer<typeof BillProductSchema>;

export type Bill = z.infer<typeof BillSchema>;

export type BillWithProduct = Bill & { products: Product[] };

export type BillWithProductAndProductTypeAndProductTypeConstraint = Bill & {
  productsWithProductTypes: ProductWithProductType[];
  productTypeConstraints: BillProductTypeConstraint[];
};

export type BillProductTypeConstraint = z.infer<
  typeof BillProductTypeConstraintSchema
>;
