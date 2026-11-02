import { supabaseAdminClient } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

interface StorageServiceSkeleton {
  uploadBase64Image(base64String: string, path: string): Promise<void>;
  uploadFile(file: File, path: string): Promise<void>;
}

class StorageServiceFactory {
  static createRewardBucketService() {
    return new StorageService(supabaseAdminClient, "rewards");
  }
}

class StorageService implements StorageServiceSkeleton {
  constructor(
    private readonly supabaseAdminClient: SupabaseClient,
    private readonly bucketName: string
  ) {
    if (!this.supabaseAdminClient)
      throw new Error("Supabase client is not initialized");

    if (!this.bucketName) throw new Error("Bucket name is not initialized");
  }

  async uploadBase64Image(base64String: string, path: string) {
    const { error } = await this.supabaseAdminClient.storage
      .from(this.bucketName)
      .upload(path, decode(base64String), {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`[ERROR] : ล้มเหลวระหว่างอัปโหลดไฟล์ -> ${error.message}`);
      throw new Error(error.message);
    }
  }

  async uploadFile(file: File, path: string) {
    const { error } = await this.supabaseAdminClient.storage
      .from(this.bucketName)
      .upload(path, file);

    if (error) {
      console.error(`[ERROR] : ล้มเหลวระหว่างอัปโหลดไฟล์ -> ${error.message}`);
      throw new Error(error.message);
    }
  }
}

export const rewardStorageService =
  StorageServiceFactory.createRewardBucketService();
