import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface DriverData {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  assigned_truck_id: string | null;
  status: string;
  license_type: string | null;
  license_number: string | null;
  license_expiry: string | null;
  notes: string | null;
  emergency_contact: unknown;
}

interface AuthState {
  user: User | null;
  driver: DriverData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshDriver: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  driver: null,
  loading: true,
  error: null,
  signIn: async () => ({ success: false, error: "Context not initialized" }),
  signOut: async () => {},
  refreshDriver: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriver = useCallback(async (currentUser: User) => {
    if (!currentUser.email) {
      setError("No se pudo obtener el email del usuario");
      await supabase.auth.signOut();
      return;
    }

    try {
      const driverResult = await supabase
        .from("drivers")
        .select("*")
        .eq("email", currentUser.email)
        .eq("status", "Active")
        .limit(1)
        .maybeSingle();

      if (driverResult.error) {
        console.error("[Auth] fetchDriver error:", driverResult.error);
        setError("Error al buscar conductor: " + driverResult.error.message);
        await supabase.auth.signOut();
        return;
      }

      if (!driverResult.data) {
        console.error("[Auth] No driver found for email:", currentUser.email);
        setError("No existe un conductor asociado a este usuario");
        setDriver(null);
        await supabase.auth.signOut();
        return;
      }

      setDriver(driverResult.data as DriverData);
      setError(null);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Error desconocido";
      console.error("[Auth] fetchDriver exception:", e);
      setError("Error al buscar conductor: " + errMsg);
      await supabase.auth.signOut();
    }
  }, []);

  const refreshDriver = useCallback(async () => {
    if (user) {
      await fetchDriver(user);
    }
  }, [user, fetchDriver]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then((result) => {
      if (!mounted) return;
      const currentUser = result?.data?.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchDriver(currentUser).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchDriver(currentUser).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setDriver(null);
        setError(null);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchDriver]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);

    try {
      const authResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authResult.error) {
        const msg =
          authResult.error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos"
            : authResult.error.message;
        console.error("[Auth] signIn authError:", authResult.error);
        return { success: false, error: msg };
      }

      if (!authResult.data?.user?.email) {
        console.error("[Auth] signIn no user email:", authResult.data);
        return { success: false, error: "No se pudo obtener el email del usuario" };
      }

      console.log("[Auth] signIn success, user email:", authResult.data.user.email);

      return { success: true };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Error desconocido";
      console.error("[Auth] signIn exception:", e);
      return { success: false, error: errMsg };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDriver(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, driver, loading, error, signIn, signOut, refreshDriver }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}