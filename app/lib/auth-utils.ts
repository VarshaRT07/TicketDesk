import { redirect } from "react-router";
import { supabaseServer } from "./supabaseClient";

export async function requireAuth(request: Request) {
  // Try to get the session from the Authorization header or cookies
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    throw redirect("/login");
  }

  try {
    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(token);

    if (error || !user) {
      throw redirect("/login");
    }

    return user;
  } catch (error) {
    console.error("Auth verification failed:", error);
    throw redirect("/login");
  }
}

export async function redirectIfAuthenticated(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error,
      } = await supabaseServer.auth.getUser(token);

      if (user && !error) {
        throw redirect("/");
      }
    } catch (error) {
      // If there's an error, continue to the login/signup page
      console.log("Auth check failed, continuing to auth page");
    }
  }

  return null;
}
