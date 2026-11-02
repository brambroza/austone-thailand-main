import { z } from "zod";
import { UserSchema } from "./user.model";

export const ScannedBarcodeSchema = z.object({
  id: z.number(),
  product_id: z.string(),
  user_id: z.string(),
  created_date: z.string(),
  expired_date: z.date(),
  product_score_option_id: z.number(),
  used_at: z.date().nullable(),
});

export const ScannedBarcodeWithUserSchema = ScannedBarcodeSchema.extend({
  users: UserSchema,
});

export const GetScannedBarcodeHistoriesByUserIdParamsSchema = z
  .object({
    filter: z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .optional(),
  })
  .merge(UserSchema.pick({ user_id: true }));

export type ScannedBarcode = z.infer<typeof ScannedBarcodeSchema>;

export type ScannedBarcodeWithUser = z.infer<
  typeof ScannedBarcodeWithUserSchema
>;

export type GetScannedBarcodeHistoriesByUserIdParams = z.infer<
  typeof GetScannedBarcodeHistoriesByUserIdParamsSchema
>;
