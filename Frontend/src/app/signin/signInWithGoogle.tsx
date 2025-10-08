"use client";
import { useEffect } from "react";
import { useAuth } from "@/stores/useAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function GoogleSignInButton() {
  const {loginWithGoogle} = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);
  }, []);
  
  
  const handleGoogleLogin = () => {
    // @ts-ignore
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        const idToken = response.credential;
        try {
          await loginWithGoogle(idToken)
          router.replace(redirectUrl)
        } catch (err) {
          console.error(err);
          toast.error("Failed to Login In")
          
        }
      },
    });

    // @ts-ignore
    window.google.accounts.id.prompt();
  };

  return (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={20} />
            Sign in with Google
          </Button>
  );
};
