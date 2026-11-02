import { z } from "zod";

export const UserScoreSchema = z.object({
  user_id: z.string(),
  score: z.number(),
  expired_date: z.date(),
});

export type UserScore = z.infer<typeof UserScoreSchema>;

export interface ScoreHistory {
  id: string;
  user_id: string;
  product_id: string;
  score: number;
  created_at: string;
}
