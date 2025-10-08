"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { Loader } from "lucide-react";

export default function GoogleRedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const response = JSON.parse(atob(searchParams.get("response")));
    const redirect = searchParams.get("redirect") || "/dashboard";
    if (!response) {
      router.replace("/signin");
      return;
    }
    try {
      loginWithGoogle(response)
      router.replace(redirect);
    } catch (err) {
      console.error(err);
      router.replace("/signin");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) return <Loader className="animate-spin w-10 h-10 m-auto" />;

  return null;
}
