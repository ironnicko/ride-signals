"use client";

import { useAuth } from "@/stores/useAuth";
import SignIn from "@/app/signin/page";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedProps) {
  const {isAuthenticated} = useAuth.getState();
  return isAuthenticated ? <>{children}</> : <SignIn></SignIn>;
}
