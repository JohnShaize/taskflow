"use client";

import { useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Provider } from "react-redux";
import { createClient } from "@/lib/supabase";
import { store } from "@/store";
import { clearUser, setLoading, setUser } from "@/store/slices/authSlice";

function mapSupabaseUser(user: SupabaseUser) {
  return {
    id: user.id,
    email: user.email ?? "",
    full_name:
      (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name) ||
      null,
    avatar_url:
      (typeof user.user_metadata?.avatar_url === "string" &&
        user.user_metadata.avatar_url) ||
      null,
    created_at: user.created_at,
  };
}

function AuthBootstrapper() {
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function hydrateUser() {
      store.dispatch(setLoading(true));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (user) {
        store.dispatch(setUser(mapSupabaseUser(user)));
      } else {
        store.dispatch(clearUser());
      }
    }

    void hydrateUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;

      if (sessionUser) {
        store.dispatch(setUser(mapSupabaseUser(sessionUser)));
      } else {
        store.dispatch(clearUser());
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrapper />
      {children}
    </Provider>
  );
}
