"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

// Custom providers wrapper component
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
