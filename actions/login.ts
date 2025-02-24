"use server";

import { z } from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid credentials",
      success: undefined,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // Get user to check role before signing in
    const user = await getUserByEmail(email);
    if (!user) {
      return { error: "Invalid credentials", success: undefined };
    }
    // Determine redirect path based on role
    const redirectTo =
      user.userRole === "ADMIN"
        ? "/restaurants"
        : user.userRole === "STAFF" && user.restaurants[0]
        ? `/restaurants/${user.restaurants[0].id}`
        : "/home";

    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });

    return { success: "Logged in successfully!", error: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials", success: undefined };
        default:
          return { error: "Something went wrong", success: undefined };
      }
    }
    throw error;
  }
};
