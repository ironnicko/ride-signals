"use client";

import { useEffect, useState } from "react";
import SignIn from "@/app/signin/page";
import api from "@/lib/axios";
import { Loader } from "lucide-react";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post("/authenticated");
        setIsAuthenticated(res.status === 200);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <Loader />;

  return isAuthenticated ? <>{children}</> : <SignIn />;
}
