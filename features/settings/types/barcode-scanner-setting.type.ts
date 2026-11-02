import { z } from "zod";

export const BarcodeScannerSettingSchema = z.object({
  id: z.number(),
  updated_at: z.string(),
  updated_by_user_id: z.string(),
  is_enabled: z.boolean(),
  message: z.string(),
});

export type BarcodeScannerSetting = z.infer<typeof BarcodeScannerSettingSchema>;
