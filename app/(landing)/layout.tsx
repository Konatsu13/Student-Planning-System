import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing - SPD",
  description: "Welcome to Student Planning Digital - Your gateway to managing your student life with ease",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-center items-center">
      {/* 🚀 Semua halaman di dalam folder (auth) seperti login dan register 
          akan otomatis masuk ke dalam children ini dengan aman */}
      {children}
    </div>
  );
}