"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

export default function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const [busyButton, setBusyButton] = useState(false);

  // Redirect after login; default to /dashboard
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const handleGoogleLogin = () => {
    setBusyButton(true);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback`; // your Go backend callback
    const googleOAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid email profile` +
      `&prompt=select_account` +
      `&state=${encodeURIComponent(redirectUrl)}`;

    window.location.href = googleOAuthUrl;
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center cursor-pointer justify-center gap-2"
      onClick={handleGoogleLogin}
      disabled={busyButton}
    >
      <FcGoogle size={20} />
      Sign in with Google
    </Button>
  );
}
