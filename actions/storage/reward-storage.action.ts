"use server";

import { authSafeActionClient, safeActionClient } from "@/lib/safe-action";
import { rewardStorageService } from "@/services/storage.service";
import { z } from "zod";
import { preventUnauthorizedUser } from "../util.action";

const UploadRewardImageSchema = z.object({
  base64: z.string(),
  path: z.string(),
});

export const uploadRewardImage = safeActionClient
  .schema(UploadRewardImageSchema)
  .action(async ({ parsedInput: { base64, path }  }) => {
    try {
      /* await preventUnauthorizedUser(lineUser);
 */
      await rewardStorageService.uploadBase64Image(base64, path);
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการอัพโหลดรูปภาพรางวัล -> ${error.message}`);
      throw new Error(`ล้มเหลวระหว่างการอัพโหลดรูปภาพรางวัล`);
    }
  });

export const getRewardImageById = safeActionClient
  .schema(
    z.object({
      id: z.number(),
    })
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      return rewardStorageService.getImageUrlById(id);
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการดึงรูปภาพรางวัล -> ${error.message}`);
      throw new Error(`ล้มเหลวระหว่างการดึงรูปภาพรางวัล`);
    }
  });
