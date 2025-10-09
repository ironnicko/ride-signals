"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Loader } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSocket } from "@/stores/useSocket";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { connect, isConnected } = useSocket.getState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post("/authenticated");
        if (res.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);

        const currentUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
        router.push(`/signin?redirect=${encodeURIComponent(currentUrl)}`);
      }
    };

    checkAuth();
  }, [pathname, searchParams, router]);

  if (!isAuthenticated) return <Loader className="animate-spin" />;
  if (!isConnected) connect();

  return <>{children}</>;
}
