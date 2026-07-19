"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0f1019",
            color: "#f1f5f9",
            border: "1px solid #272836",
          },
        }}
      />
    </SessionProvider>
  );
}
