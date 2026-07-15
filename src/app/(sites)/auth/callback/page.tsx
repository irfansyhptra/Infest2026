"use client";

import { LoadingAnimation } from "@/components/loadingAnimation";
import { supabase } from "@/libs/services/supabaseClient";
import { authService } from "@/libs/services/authService";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const CallbackAuth = () => {
  const router = useRouter();
  
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token") || "";

        if (!accessToken) {
          throw new Error("No access token found");
        }

        // Set session di Supabase
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          throw sessionError;
        }

        // Get current user dan pastikan profile ada
        const result = await authService.getCurrentUser();
        
        if (result.error || !result.user) {
          throw new Error("Failed to get user information after OAuth");
        }

        // Jika belum ada profile, buat menggunakan authService
        if (!result.profile && result.user) {
          const profileResult = await authService.ensureProfile(result.user);
          
          if (profileResult.error) {
            console.warn("Failed to create profile:", profileResult.error);
            // Tidak perlu error fatal, user tetap bisa masuk dengan profile kosong
            // Profile bisa dibuat/diupdate nanti di dashboard
          } else {
            console.log("Profile created successfully for OAuth user");
          }
        }

        router.replace("/dashboard?menu=kompetisi");
        
      } catch (err: any) {
        console.error("OAuth Error:", err);
        
        // Berikan error message yang lebih spesifik
        let errorParam = "oauth";
        if (err.message?.includes("access_token")) {
          errorParam = "oauth_token";
        } else if (err.message?.includes("session")) {
          errorParam = "oauth_session";
        } else if (err.message?.includes("profile")) {
          errorParam = "oauth_profile";
        }
        
        router.replace(`/auth/login?error=${errorParam}`);
      }
    };

    if (typeof window !== "undefined") {
      handleAuth();
    }
  }, [router]);

  return (
    <LoadingAnimation loadingText="Memproses login Google..." />
  );
};

export default CallbackAuth;

// "use client";

// import { LoadingAnimation } from "@/components/loadingAnimation";
// import { supabase } from "@/libs/services/supabaseClient";
// import { authService } from "@/libs/services/authService";
// import { useRouter } from "next/navigation";
// import React, { useEffect } from "react";

// const CallbackAuth = () => {
//   const router = useRouter();
//   useEffect(() => {
//     const handleAuth = async () => {
//       try {
//         const hash = window.location.hash.substring(1);
//         const params = new URLSearchParams(hash);
//         const accessToken = params.get("access_token");
//         const refreshToken = params.get("refresh_token") || "";

//         if (!accessToken) {
//           throw new Error("No access token found");
//         }

//         // Set session di Supabase
//         const { error: sessionError } = await supabase.auth.setSession({
//           access_token: accessToken,
//           refresh_token: refreshToken,
//         });

//         if (sessionError) {
//           throw sessionError;
//         }

//         // Get current user dan pastikan profile ada
//         const result = await authService.getCurrentUser();
        
//         if (result.error || !result.user) {
//           throw new Error("Failed to get user information after OAuth");
//         }

//         // Jika belum ada profile, buat menggunakan authService
//         if (!result.profile && result.user) {
//           const profileResult = await authService.ensureProfile(result.user);
          
//           if (profileResult.error) {
//             console.warn("Failed to create profile:", profileResult.error);
//             // Tidak perlu error fatal, user tetap bisa masuk
//           }
//         }

//         console.log("OAuth login berhasil");
//         router.replace("/dashboard");
        
//       } catch (err: any) {
//         console.error("OAuth Error:", err);
        
//         // Berikan error message yang lebih spesifik
//         let errorParam = "oauth";
//         if (err.message?.includes("access_token")) {
//           errorParam = "oauth_token";
//         } else if (err.message?.includes("session")) {
//           errorParam = "oauth_session";
//         }
        
//         router.replace(`/auth/login?error=${errorParam}`);
//       }
//     };

//     if (typeof window !== "undefined") {
//       handleAuth();
//     }
//   }, [router]);
//   return (
//     <LoadingAnimation loadingText="Redirecting" variant="standard"/>
//   );
// };

// export default CallbackAuth;
