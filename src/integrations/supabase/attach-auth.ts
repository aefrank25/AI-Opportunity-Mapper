import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

/**
 * Client-side middleware that attaches the current Supabase access token
 * to outgoing server-function requests so `requireSupabaseAuth` can validate them.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      sendContext: {},
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
