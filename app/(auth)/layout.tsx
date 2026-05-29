import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description: "Login or register to manage your student life easily",
};


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-center items-center">
      {children}
    </div>
  );
}