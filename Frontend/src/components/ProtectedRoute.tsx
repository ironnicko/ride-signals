"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post("/authenticated");
        if (res.status === 200){
          setIsAuthenticated(true);
        } 
      } catch (err) {
        setIsAuthenticated(false);
        router.push("/signin")
      }
    };

    checkAuth();
  }, []);

  if (!isAuthenticated) return <Loader className="animate-spin"/>;


  return <>{children}</>;
}
