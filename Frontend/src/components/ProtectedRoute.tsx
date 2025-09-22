"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (!useAuth.getState().isAuthenticated) {
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [accessToken, router]);

  if (!isAuthenticated) return null; 

  return <>{children}</>;
}
