"use client";

import { LoadingAnimation } from "@/components/loadingAnimation";
import { supabase } from "@/libs/services/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
        }

        if (!session) {
          // User belum login, redirect ke halaman login          
          router.replace("/auth/login");
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {      
      if (!session) {
        setUser(null);
        router.replace("/auth/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return <LoadingAnimation loadingText="Redirecting"/>;
  }

  if (!user) {
    // Jika user belum login, redirect ke halaman login
    return <LoadingAnimation loadingText="Redirecting" />;
  }

  return <>{children}</>;
};

export default ProtectedLayout;