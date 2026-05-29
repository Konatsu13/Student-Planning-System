import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Planning System",
  description: "Welcome to Student Planning Digital - Your gateway to managing your student life with ease",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* 🚀 Landing page children will render at full-width, allowing footers to stretch correctly */}
      {children}
    </div>
  );
}