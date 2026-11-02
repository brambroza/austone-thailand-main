import { User } from "@/models/user.model";

export type UserPointHistory = Pick<
  User,
  | "full_name"
  | "store_name"
  | "agent_store_name"
  | "phone_number"
  | "province"
  | "user_id"
> & {
  total_points: number;
  used_points: number;
  available_points: number;
};



export type UserPointAccumulateHistory = Pick<
  User,
  | "full_name"
  | "store_name"
  | "agent_store_name"
  | "phone_number"
  | "province"
  | "user_id"
> & {
  bf_points: number;
  accumulate_points: number;
  total_points: number;
  used_points: number;
  available_points: number;
};
