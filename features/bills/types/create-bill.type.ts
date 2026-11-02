import { Product } from "@/models/product.model";
import { z } from "zod";
import { EditBillFormStoreState } from "../stores/useEditBillFormStore";
import { BillSchema } from "./bill.type";

export const CreateBillSchema = BillSchema.extend({
  total_amount: z.number(),
  total_items: z.number(),
  status: z.enum(["DRAFT", "COMPLETED", "CANCELLED"]),
});

export type BillStatus = "DRAFT" | "COMPLETED" | "CANCELLED";

export type CreateBillProduct = Omit<
  Product,
  "created_at" | "updated_at" | "updated_by_user_id"
> & {
  product_type: string;
};

export type FormField = keyof Pick<
  EditBillFormStoreState,
  "bill_no" | "customer_fullname" | "customer_email" | "document_date" | "status"
>;
