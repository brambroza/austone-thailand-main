import { z } from "zod";
import { UserSchema } from "./user.model";
import { CLAIMED_REWARD_HISTORY_STATUS } from "@/features/claimed-reward-history/types/claimed-reward-history.type";

export const RewardSchema = z.object({
  id: z.number(),
  title: z.string(),
  expired_at: z.coerce.date(),
  quantity: z.number(),
  required_score: z.number({ message: "แต้มที่ใช้แลกต้องเป็นตัวเลข" }),
  is_visible: z.boolean(),
  updated_at: z.date(),
  description: z.string().nullable(),
  created_at: z.string(),
  available_at:   z.string(),
  is_alert_enable: z.boolean(),
});

export const RewardCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.coerce.number().int(),
  required_score: z.coerce.number().int(),
  expired_at: z.coerce.date().nullable().optional(),   // ✅ รับ ISO string/Date ได้
  available_at: z.coerce.date().optional(),            // ✅
  is_visible: z.coerce.boolean().optional(),
  is_alert_enable: z.coerce.boolean().optional(),
});



export const ClaimedRewardHistorySchema = z.object({
  id: z.number(),
  reward_id: z.number(),
  quantity: z.number(),
  user_id: z.string(),
  created_at: z.string(),
  email: z.string().nullable(),
  shipping_address: z.string().nullable(),
  rewards: RewardSchema,
  users: UserSchema,
  status: z.nativeEnum(CLAIMED_REWARD_HISTORY_STATUS),
});

export const GetClaimedRewardHistoriesParamsSchema = z.object({
  month: z.number(),
  year: z.number(),
});

export const GetClaimedRewardHistoriesByUserIdParamsSchema = z
  .object({
    filter: z
      .object({
        from: z.string(),
        to: z.string(),
      })
      .optional(),
  })
  .merge(ClaimedRewardHistorySchema.pick({ user_id: true }));

export type GetClaimedRewardHistoriesByUserIdParams = z.infer<
  typeof GetClaimedRewardHistoriesByUserIdParamsSchema
>;

export type Reward = z.infer<typeof RewardSchema>;

export type ClaimedRewardHistory = z.infer<typeof ClaimedRewardHistorySchema>;

export type GetClaimedRewardHistoriesParams = z.infer<
  typeof GetClaimedRewardHistoriesParamsSchema
>;
