import React from "react";
import type { Metadata } from "next";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized dashboard to manage your student life",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#F5F5F7] flex flex-col md:flex-row">
      {/* 🚀 Sidebar premium hanya muncul di layar lebar (tablet/laptop) */}
      <Sidebar className="hidden md:flex" />

      {/* 🚀 Penampung konten utama */}
      <div className="flex-grow flex flex-col items-center justify-start min-w-0 w-full">
        {children}
      </div>

      {/* 🚀 Navbar melayang di bawah hanya muncul di layar HP */}
      <Navbar />
    </div>
  );
}