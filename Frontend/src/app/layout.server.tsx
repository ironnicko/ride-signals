// src/app/layout.server.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RideSignals",
  description: "Sync your rides and communicate effortlessly.",
};

export default function RootServerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
