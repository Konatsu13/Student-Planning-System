'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase';
import UserAvatar from './useravatar';
import { Bell } from 'lucide-react';

export default function DashboardHeader() {
  const [gender, setGender] = useState<string>(''); // State untuk menampung jenis kelamin
  const [name, setName] = useState<string>(''); // State untuk nama user
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 1. Dapatkan info user yang sedang login dari Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;

        if (user) {
          // Ambil nama dari metadata user auth sebagai fallback tercepat
          const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Siswa';
          setName(fallbackName);

          // Ambil gender dari metadata user auth sebagai fallback tercepat
          const fallbackGender = user.user_metadata?.gender || '';
          if (fallbackGender) {
            setGender(fallbackGender);
          }

          // 2. Tembak/Eksport data profil dari tabel 'tb_user'
          // Menggunakan maybeSingle() agar TIDAK melempar error PGRST116 jika profil belum dibuat!
          const { data, error: dbError } = await supabase
            .from('tb_user')
            .select('gender, username')
            .eq('id', user.id)
            .maybeSingle(); 

          if (dbError) {
            console.warn('Gagal memuat profil tb_user:', dbError.message);
          }

          if (data) {
            if (data.gender) {
              setGender(data.gender); // Masukkan data gender ke state ("Laki-laki" atau "Perempuan")
            }
            
            // Jika nama metadata kosong, gunakan username dari tb_user
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
        console.error('Gagal mengambil data profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-between w-full py-4 mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-6 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full py-4 mb-6">
      {/* Kiri: Avatar & Informasi Selamat Datang */}
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar gender={gender} size={48} className="flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-gray-500 text-sm font-medium">Selamat datang 👋</span>
          <span 
            className="text-xl font-bold text-[#002482] truncate max-w-[160px] sm:max-w-[280px] md:max-w-[360px]" 
            title={name}
          >
            {name}
          </span>
        </div>
      </div>

      {/* Kanan: Tombol Notifikasi (Lonceng) */}
      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative flex-shrink-0">
        <Bell className="w-6 h-6 text-gray-800" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
    </div>
  );
}