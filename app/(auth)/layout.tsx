import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
// import "../assets/";
import Image from "next/image";

export function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* LOGO */}
      <div className="text-center mb-8">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={80}
          height={80}
        />
      </div>
      
      {/* Form content */}
    </div>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Login - Student Planning Digital",
  description: "Create an account or login to manage your student life easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="select-none min-h-full flex flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
