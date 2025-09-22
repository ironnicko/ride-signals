"use client";
import { useEffect } from "react";
import { useAuth } from "@/stores/useAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

export default function GoogleSignInButton() {
  const {loginWithGoogle} = useAuth();
  const router = useRouter();
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
          router.push("/dashboard")
        } catch (err) {
          console.error(err);
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
