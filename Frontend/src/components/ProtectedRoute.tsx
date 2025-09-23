"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import api from "@/lib/axios";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const router = useRouter();
  const { accessToken } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {status} = await api.post("/authenticated")
        if (status != 200){
          router.replace("/signin");
        }
      } catch(err){
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [accessToken, router]);


  return <>{children}</>;
}
