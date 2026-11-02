"use server";
import { supabaseAnonClient } from "@/lib/anon-supabase";
import { UserPointAccumulateHistory, UserPointHistory } from "../types/user-point-history.type";

export async function getUserPointHistories(
  startDate: string, // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
): Promise<UserPointHistory[]> {
  const { data, error } = await supabaseAnonClient.rpc(
    "get_user_point_histories",
    {
      start_date: startDate,
      end_date: endDate,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}



export async function getUserPointAccumelateHistories(
  startDate: string, // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
): Promise<UserPointAccumulateHistory[]> {
  const { data, error } = await supabaseAnonClient.rpc(
    "get_user_point_accumelate_histories",
    {
      start_date: startDate,
      end_date: endDate,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
