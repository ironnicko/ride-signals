"use client";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardMap = dynamic(() => import("@/components/DashboardMap"), { ssr: false });

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardMap />
    </ProtectedRoute>
  );
}
