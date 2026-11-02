import { supabaseAnonClient } from "@/lib/anon-supabase";
import { translateAuthErrorMessage } from "../utils/auth-service.util";
import { ServiceResponse } from "@/models/api.model";
import { User } from "@supabase/supabase-js";
import { signOutLineUser } from "@/actions/auth.action";
import { initUser } from "@/actions/queries/users.action";

export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<ServiceResponse<User>> {
  const { data, error } = await supabaseAnonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (data.session?.access_token) {
    document.cookie = `supabase_access_token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
  return {
    data: data?.user,
    error: error ? translateAuthErrorMessage(error.message) : null,
  };
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string
): Promise<ServiceResponse<User>> {
  const {
    data: { user },
    error,
  } = await supabaseAnonClient.auth.signUp({
    email,
    password,
  });

  if (!user) {
    console.error(`[ERROR] : ไม่สามารถสร้างผู้ใช้งานได้ -> ${error?.message}`);
    return {
      data: null,
      error: "ไม่สามารถสร้างผู้ใช้งานได้",
    };
  }

  await initUser(user.id);

  return {
    data: user,
    error: error ? translateAuthErrorMessage(error.message) : null,
  };
}

export async function sendPasswordResetEmail(
  email: string,
  redirectTo: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabaseAnonClient.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return {
    data: null,
    error: error ? translateAuthErrorMessage(error.message) : null,
  };
}

export async function updatePassword(
  password: string
): Promise<ServiceResponse<User>> {
  const { data, error } = await supabaseAnonClient.auth.updateUser({ password });

  return {
    data: data.user,
    error: error ? translateAuthErrorMessage(error.message) : null,
  };
}

export async function getSupabaseCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAnonClient.auth.getUser();

    if (error) throw new Error(error.message);

    return user;
  } catch (error: any) {
    return null;
  }
}

export async function signOut() {
  await signOutLineUser();

  document.cookie = "supabase_access_token=; path=/; max-age=0";

  await supabaseAnonClient.auth.signOut();
}
