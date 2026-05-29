'use client';

import Link from "next/link";
import { usePathname } from "next/navigation"; // 1. Import hook untuk deteksi URL
import { House, Calendar, Bell, CircleUserRound } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname(); // 2. Ambil rute aktif saat ini

  // 3. Fungsi pembantu untuk cek status aktif dan berikan warna yang sesuai
  const getIconColor = (path: string) => {
    return pathname === path 
      ? "text-blue-400 scale-110 transition-all" // Warna saat ACTIVE (+ efek membesar dikit)
      : "text-gray-400 hover:text-white transition-colors"; // Warna saat INACTIVE
  };

  return (
    <div className="md:hidden">
      <nav className=" h-12 bg-white text-gray-700 flex items-center justify-between px-8 gap-6 rounded-3xl fixed bottom-4 left-4 right-4 shadow-lg">
        
        <Link href="/dashboard">
          <House className={getIconColor('/dashboard')} />
        </Link>
        
        <Link href="/schedule">
          <Calendar className={getIconColor('/schedule')} />
        </Link>
        
        <Link href="/notifications">
          <Bell className={getIconColor('/notifications')} />
        </Link>
        
        <Link href="/profile">
          <CircleUserRound className={getIconColor('/profile')} />
        </Link>
        
      </nav>
    </div>
  );
}