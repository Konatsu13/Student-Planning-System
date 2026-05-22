import React from "react";
import type { Metadata } from "next";
import Navbar from "../components/navbar";

export const metadata: Metadata = {
  title: "Dashboard - SPD",
  description: "Your personalized dashboard to manage your student life",
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
      <Navbar />
    </div>
  );
}