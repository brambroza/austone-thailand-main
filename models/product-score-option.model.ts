import { z } from "zod";

export const ProductScoreOptionSchema = z.object({
  id: z.number(),
  title: z.string().min(1, { message: "ต้องมีคำนามอย่างน้อย 1 ตัวอักษร" }),
  score: z.number({ message: "คะแนนต้องเป็นตัวเลข" }).min(1, {
    message: "คะแนนต้องมากกว่า 0",
  }),
  is_default: z.boolean(),
});

export type ProductScoreOption = z.infer<typeof ProductScoreOptionSchema>;

export type WithProductScoreOption<T> = T & {
  product_score_option: ProductScoreOption;
};
