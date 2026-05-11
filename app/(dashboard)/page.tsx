'use client';

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard! Here you can manage your student life easily.</p>
      <Link href="/" className="text-blue-500 mt-4 inline-block">
        Logout
      </Link>
    </div>
  );
}