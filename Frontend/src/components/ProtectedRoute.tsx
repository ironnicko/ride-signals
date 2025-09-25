"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import api from "@/lib/axios";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth.getState();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {status} = await api.post("/authenticated")
        if (status != 200)
          router.replace("/signin");
        
      } catch(err){
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [isAuthenticated, router]);


  return isAuthenticated ? <>{children}</> : null;
}
