'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabase';
import UserAvatar from './useravatar';
import Image from 'next/image';
import { House, Calendar, Bell, CircleUserRound, LogOut } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [gender, setGender] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          setEmail(user.email || '');
          const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Siswa';
          setName(fallbackName);
          setGender(user.user_metadata?.gender || '');

          const { data, error: dbError } = await supabase
            .from('tb_user')
            .select('gender, username')
            .eq('id', user.id)
            .maybeSingle();

          if (data) {
            if (data.gender) setGender(data.gender);
            if (!user.user_metadata?.full_name && data.username) {
              const formattedName = data.username
                .split('_')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              setName(formattedName);
            }
          }
        }
      } catch (error) {
        console.error('Gagal mengambil data profil untuk sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari sesi ini?')) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
      isActive
        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-[1.01]'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`;
  };

  return (
    <aside className={`w-72 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col p-6 z-30 shrink-0 ${className}`}>
      
      {/* 1. Header Sidebar: Logo & Nama Aplikasi */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/assets/logo.png"
          alt="SPD Logo"
          width={36}
          height={36}
          className="w-9 h-9 object-contain hover:scale-105 transition-transform"
        />
        <div className="flex flex-col">
          <span className="font-black text-slate-800 text-base leading-tight tracking-tight">
            SPD System
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Basic Edition
          </span>
        </div>
      </div>

      {/* 2. Kartu Profil Pengguna (Real-time Metadata) */}
      <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-4 flex items-center gap-3.5 mb-8 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-3 w-full animate-pulse">
            <div className="w-11 h-11 bg-slate-200 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="w-20 h-3 bg-slate-200 rounded" />
              <div className="w-28 h-2.5 bg-slate-200 rounded" />
            </div>
          </div>
        ) : (
          <>
            <UserAvatar gender={gender} size={44} className="ring-2 ring-white shadow-sm shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-slate-800 text-sm truncate" title={name}>
                {name}
              </span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5" title={email}>
                {email}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Daftar Navigasi Link */}
      <nav className="flex-1 space-y-2.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block mb-3">
          Main Menu
        </span>
        
        <Link href="/dashboard" className={getLinkClass('/dashboard')}>
          <House className="w-5 h-5 shrink-0" />
          <span>Beranda</span>
        </Link>
        
        <Link href="/schedule" className={getLinkClass('/schedule')}>
          <Calendar className="w-5 h-5 shrink-0" />
          <span>Jadwal</span>
        </Link>
        
        <Link href="/notifications" className={getLinkClass('/notifications')}>
          <Bell className="w-5 h-5 shrink-0" />
          <span>Notifikasi</span>
        </Link>
        
        <Link href="/profile" className={getLinkClass('/profile')}>
          <CircleUserRound className="w-5 h-5 shrink-0" />
          <span>Profil</span>
        </Link>
      </nav>

      {/* 4. Footer Sidebar: Tombol Keluar & Info Versi */}
      <div className="border-t border-slate-100 pt-5 mt-auto space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-sm py-3 rounded-2xl border border-rose-100/50 hover:border-rose-200 transition-all active:scale-[0.99] cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Keluar Sesi
        </button>
        
        <div className="text-center text-[10px] text-slate-400 font-bold tracking-wider">
          VERSION 1.0.0
        </div>
      </div>

    </aside>
  );
}
