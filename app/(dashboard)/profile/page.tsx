'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import { useRouter } from 'next/navigation';
import { APP_VERSION } from '@/config/version';
import UserAvatar from '../../components/useravatar';
import { 
  User, Mail, Lock, Settings, ChevronRight, 
  ArrowLeft, LogOut, CheckCircle, Edit, Trash2, ShieldAlert, Award, Bell
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // State data user
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<string>('');

  // State untuk sub-view
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState<boolean>(false);

  // State form Ubah Profil
  const [inputName, setInputName] = useState<string>('');
  const [inputGender, setInputGender] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [inputConfirmPassword, setInputConfirmPassword] = useState<string>('');
  const [updateError, setUpdateError] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;

      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');

        // 1. Ambil nama & gender awal dari Auth Metadata (Fallback tercepat)
        const initialName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        const initialGender = user.user_metadata?.gender || '';
        
        setName(initialName);
        setGender(initialGender);
        
        setInputName(initialName);
        setInputGender(initialGender);

        // 2. Sinkronisasikan dengan tabel tb_user di database
        const { data: dbUser, error: dbError } = await supabase
          .from('tb_user')
          .select('username, gender')
          .eq('id', user.id)
          .maybeSingle();

        if (dbUser) {
          if (dbUser.username) {
            // Format username budi_santoso -> Budi Santoso
            const formattedName = dbUser.username
              .split('_')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            setName(formattedName);
            setInputName(formattedName);
          }
          if (dbUser.gender) {
            setGender(dbUser.gender);
            setInputGender(dbUser.gender);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sign out dari Supabase
  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari sesi ini?')) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  // Menyimpan perubahan profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');

    if (!inputName.trim()) {
      setUpdateError('Nama lengkap tidak boleh kosong!');
      return;
    }
    if (!inputGender) {
      setUpdateError('Jenis kelamin harus dipilih!');
      return;
    }

    // Validasi password jika diinputkan
    if (inputPassword) {
      if (inputPassword.length < 6) {
        setUpdateError('Password baru minimal harus 6 karakter!');
        return;
      }
      if (inputPassword !== inputConfirmPassword) {
        setUpdateError('Konfirmasi password tidak cocok!');
        return;
      }
    }

    setSaving(true);

    try {
      if (!userId) return;

      // 1. UPDATE Auth Metadata
      const authUpdates: any = {
        data: {
          full_name: inputName,
          gender: inputGender
        }
      };

      // Jika ada input password baru, update password juga
      if (inputPassword) {
        authUpdates.password = inputPassword;
      }

      const { error: authUpdateErr } = await supabase.auth.updateUser(authUpdates);
      if (authUpdateErr) throw authUpdateErr;

      // 2. UPDATE database tb_user (Upsert agar aman)
      const { error: dbUpdateErr } = await supabase
        .from('tb_user')
        .upsert({
          id: userId,
          email: email,
          password: '', // dikelola supabase auth
          username: inputName.toLowerCase().replace(/\s+/g, '_'), // budi santoso -> budi_santoso
          gender: inputGender,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (dbUpdateErr) throw dbUpdateErr;

      setUpdateSuccess('Profil Anda berhasil diperbarui!');
      
      // Update state lokal
      setName(inputName);
      setGender(inputGender);
      setInputPassword('');
      setInputConfirmPassword('');

      // Kembali ke tampilan utama setelah delay 1.5 detik
      setTimeout(() => {
        setIsEditingProfile(false);
        setUpdateSuccess('');
      }, 1500);

    } catch (err: any) {
      setUpdateError(err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  // --- LOGIKA HAPUS AKUN SECARA AMAN (CRUD DELETE OPSI HAPUS AKUN) ---
  const handleDeleteAccount = async () => {
    if (!userId) return;

    // Tahap Konfirmasi 1
    const confirm1 = confirm('PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda secara permanen?');
    if (!confirm1) return;

    // Tahap Konfirmasi 2
    const confirm2 = confirm('TINDAKAN INI PERMANEN. Semua jadwal dan profil Anda di sistem SPD akan dihapus dan tidak bisa dikembalikan. Lanjutkan?');
    if (!confirm2) return;

    setLoading(true);
    try {
      // 1. Hapus jadwal user di tabel tb_schedules
      const { error: scheduleDelError } = await supabase
        .from('tb_schedules')
        .delete()
        .eq('user_id', userId);

      if (scheduleDelError) throw scheduleDelError;

      // 2. Hapus data user di tabel tb_user
      const { error: userDelError } = await supabase
        .from('tb_user')
        .delete()
        .eq('id', userId);

      if (userDelError) throw userDelError;

      // 3. Log out dari Supabase Auth
      await supabase.auth.signOut();

      alert('Akun Anda telah berhasil dihapus secara permanen.');
      router.push('/');
    } catch (err: any) {
      alert('Gagal menghapus akun: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-xs mt-3 animate-pulse">Menghubungkan profil...</span>
      </div>
    );
  }

  // --- VIEW 2: TAMPILAN UBAH PROFIL (EDIT MODE) ---
  if (isEditingProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-28 max-w-2xl mx-auto w-full relative font-sans">
        
        {/* Header Ubah Profil */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <button 
            onClick={() => {
              setIsEditingProfile(false);
              setInputName(name);
              setInputGender(gender);
              setInputPassword('');
              setInputConfirmPassword('');
              setUpdateError('');
            }}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-extrabold text-slate-800 text-base sm:text-lg">Ubah Profil</h1>
        </div>

        <form onSubmit={handleSaveProfile} className="p-5 space-y-6">
          
          {/* Reactive Avatar Center Section */}
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative group">
              {/* Avatar reaktif yang langsung berganti jika jenis kelamin dipilih */}
              <UserAvatar gender={inputGender} size={96} className="shadow-lg ring-4 ring-[#0095FF]/10 scale-105 transition-transform" />
              <div className="absolute bottom-0 right-0 bg-green-3300 text-white p-2 rounded-full shadow-md border-2 border-white">
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">{inputName || 'Nama Siswa'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Input Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-[#0095FF]/30 focus:border-[#0095FF] outline-none transition-all bg-white"
                  placeholder="Contoh: Alex Morgan"
                />
              </div>
            </div>

            {/* Input Email (Read Only) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Email (Tidak bisa diubah)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-400 text-sm bg-slate-100 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Input Jenis Kelamin (Dropdown reaktif) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <select
                value={inputGender}
                onChange={e => setInputGender(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-[#0095FF]/30 focus:border-[#0095FF] outline-none transition-all bg-white cursor-pointer"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Divider untuk keamanan */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">Ubah Keamanan (Opsional)</span>
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Password Baru (Kosongkan jika tidak diubah)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  value={inputPassword}
                  onChange={e => setInputPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-[#0095FF]/30 focus:border-[#0095FF] outline-none transition-all bg-white"
                  placeholder="Min. 6 karakter"
                />
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  value={inputConfirmPassword}
                  onChange={e => setInputConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-[#0095FF]/30 focus:border-[#0095FF] outline-none transition-all bg-white"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

          </div>

          {/* Feedback alerts */}
          {updateError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-2xl text-xs sm:text-sm">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>{updateSuccess}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0095FF] hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base py-3 rounded-2xl shadow-md shadow-blue-500/10 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(false);
                setInputName(name);
                setInputGender(gender);
                setInputPassword('');
                setInputConfirmPassword('');
                setUpdateError('');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm sm:text-base py-3 rounded-2xl transition-all cursor-pointer text-center"
            >
              BATALKAN
            </button>

            {/* OPSI HAPUS AKUN (TOMBOL DELETE DARI CRUD PROFILE) */}
            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs sm:text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4.5 h-4.5" />
                HAPUS AKUN SECARA PERMANEN
              </button>
            </div>

          </div>

        </form>

      </div>
    );
  }

  // --- VIEW 1: TAMPILAN UTAMA PENGATURAN (MAIN MENU) ---
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-28 overflow-x-hidden max-w-2xl mx-auto w-full relative font-sans">
      
      {/* Header Halaman */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
        <Settings className="w-5 h-5 text-slate-800" />
        <h1 className="font-extrabold text-slate-800 text-base sm:text-lg">Pengaturan</h1>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Profil Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#0095FF]/10 text-[#0095FF] px-3.5 py-1 text-[9px] font-black rounded-bl-2xl uppercase tracking-wider">
            Siswa Aktif
          </div>
          
          <UserAvatar gender={gender} size={64} className="shadow-md shadow-slate-100 ring-2 ring-slate-100" />
          
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-slate-800 text-base sm:text-lg truncate">{name || 'Siswa SPD'}</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{email}</p>
          </div>
        </div>

        {/* List Menu Pengaturan Utama */}
        <div className="space-y-3">
          <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Pengaturan Utama</span>
          
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm divide-y divide-slate-50">
            
            {/* Navigasi Ubah Profil */}
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="w-full flex items-center justify-between p-4.5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">Ubah Profil</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ubah nama, password, dan ganti gender</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            {/* Navigasi Update (Mengarah ke Halaman Notifikasi) */}
            <button 
              onClick={() => router.push('/notifications')}
              className="w-full flex items-center justify-between p-4.5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">Update & Notifikasi</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Lihat berita terbaru dan alarm tenggat waktu</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            {/* Menu About Us (Kelompok Developer) */}
            <button 
              onClick={() => setIsAboutUsOpen(true)}
              className="w-full flex items-center justify-between p-4.5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">About Us</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tentang tim pengembang Student Planning Digital</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

          </div>
        </div>

        {/* Tombol Logout Sesi */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-sm sm:text-base py-3 rounded-2xl border border-rose-100 hover:border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4.5 h-4.5" />
            Keluar Sesi
          </button>
          
          <div className="text-center text-[10px] text-slate-400 mt-6 font-medium">
            Version {APP_VERSION} <br/>
            © 2026 Student Planning Digital. Hak Cipta Dilindungi.
          </div>
        </div>

      </div>

      {/* --- OVERLAY ABOUT US MODAL --- */}
      {isAboutUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 border border-slate-100 relative overflow-hidden animate-in zoom-in duration-200 text-center">
            
            <div className="w-14 h-14 rounded-full bg-[#0095FF]/10 text-[#0095FF] flex items-center justify-center mx-auto mb-4.5">
              <Award className="w-7 h-7" />
            </div>

            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg mb-2">Student Planning Digital</h3>
            
            <div className="text-xs text-slate-500 leading-relaxed mb-6 space-y-2 text-justify bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p>
                Aplikasi **Student Planning Digital (SPD)** dirancang khusus untuk mempermudah siswa dan mahasiswa dalam mengatur waktu secara dinamis, mengelola jadwal secara presisi, serta memantau tenggat waktu kritis demi kesuksesan akademik.
              </p>
              <p className="font-bold text-center text-slate-700 mt-2">
                "Pintar, Terorganisir, & Produktif Setiap Hari."
              </p>
            </div>

            <button 
              onClick={() => setIsAboutUsOpen(false)}
              className="w-full bg-[#0095FF] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Tutup Deskripsi
            </button>

          </div>
        </div>
      )}

    </div>
  );
}