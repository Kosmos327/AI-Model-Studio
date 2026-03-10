import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";

export const metadata: Metadata = {
  title: "AI Model Studio",
  description: "AI Character & Content Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <div className="flex min-h-screen">
          <Suspense fallback={<div className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-700" />}>
            <AppSidebar />
          </Suspense>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

