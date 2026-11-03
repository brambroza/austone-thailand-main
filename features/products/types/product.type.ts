import { z } from "zod";

export const ProductTypeSchema = z.object({
  id: z.number({ required_error: "กรุณาระบุรหัสประเภทสินค้า" }),
  title: z
    .string({ required_error: "กรุณาระบุชื่อประเภทสินค้า" })
    .min(1, { message: "ชื่อประเภทสินค้าไม่สามารถเป็นค่าว่างได้" }),
  // false = สแกนสะสมแต้มไม่ได้ ไม่มีค่าถือว่าสะสมได้
  can_collect_points: z.boolean().optional(),
});

export type ProductType = z.infer<typeof ProductTypeSchema>;
 

// helper: validate ISO date string
const IsoDateString = z
  .string({ required_error: "กรุณาระบุวันที่" })
  .refine((v) => !Number.isNaN(Date.parse(v)), "รูปแบบวันที่ไม่ถูกต้อง");

export const ProductTypePromotionSchema = z
  .object({
    id: z.string({ required_error: "กรุณาระบุรหัสโปรโมชั่น" }).min(1),
    product_type_id: z.number({ required_error: "กรุณาเลือกประเภทสินค้า" }).int().positive(),
    startdate: IsoDateString,
    enddate: IsoDateString,
    point: z.number().int().min(0).max(32767).default(1),
    updated_by_user_id: z.string().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    const s = Date.parse(val.startdate);
    const e = Date.parse(val.enddate);
    if (!(e > s)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "วันสิ้นสุดต้องมากกว่าวันเริ่มต้น",
        path: ["enddate"],
      });
    }
  });

export type ProductTypePromotion = z.infer<typeof ProductTypePromotionSchema>;