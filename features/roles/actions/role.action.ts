"use server";

import { ServerActionResponse } from "@/models/api.model";
import { Role } from "../types/role.type";
import { supabaseAdminClient } from "@/lib/supabase";

export async function getAllRoles(): Promise<ServerActionResponse<Role[]>> {
  try {
    const { data: roles, error } = await supabaseAdminClient
      .from("roles")
      .select("*");

    if (error) throw new Error(error.message);

    return { data: roles as Role[], isError: false, error: "" };
  } catch (error: any) {
    return { data: [], isError: true, error: error.message };
  }
}
