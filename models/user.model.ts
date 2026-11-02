import { z } from "zod";

export type LineUser = {
  sub: string;
  email: string;
  picture: string;
  name: string;
  id? : string;
};

export const UserSchema = z.object({
  user_id: z.string().min(1, { message: "กรุณากรอก user id" }),
  full_name: z.string().min(1, { message: "กรุณากรอกชื่อ-นามสกุล" }),
  gender: z.string().min(1, { message: "กรุณากรอกเพศ" }),
  date_of_birth: z
    .date({
      required_error: "กรุณากรอกวันเกิด",
    })
    .nullable(),
  phone_number: z
    .string()
    .length(10, { message: "หมายเลขโทรศัพท์ต้องมี 10 หลัก" }),
  store_name: z.string().min(1, { message: "กรุณากรอกชื่อร้าน" }),
  province: z.string().min(1, { message: "กรุณากรอกจังหวัด" }),
  created_date: z.string().datetime(),
  verified_at: z.string().datetime().nullable(),
  agent_store_name: z.string().nullable(),
  role_id: z.string().nullable(),
  enabled_barcode_scan_at: z.string().nullable(),
  point_multiplier: z.number().nullable().default(1),
});

export const UserInfoViewSchema = UserSchema.extend({
  role_title: z.string(),
  total_score: z.number().nullable(),
  scorewithoutscan : z.number().nullable(), 
});

export type User = z.infer<typeof UserSchema>;

export type UserInfoView = z.infer<typeof UserInfoViewSchema>;

export type UserGenderProportion = {
  male: number;
  female: number;
};

export type WithUser<T> = T & {
  users: User;
};
