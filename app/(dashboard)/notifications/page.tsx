'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import Header from '../../components/header';
import { 
  Bell, AlertTriangle, Check, ChevronDown, ChevronUp, 
  Clock, ArrowRight, BookOpen, Calendar, HelpCircle 
} from 'lucide-react';
import ScheduleModal from '../../components/ScheduleModal';
import { Schedule } from '../dashboard/page';

interface SystemNotification {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  // State untuk modal edit tugas jika klik "Lihat Rincian Tugas"
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // State untuk mengontrol expand deskripsi notifikasi sistem
  const [expandedSystemIds, setExpandedSystemIds] = useState<string[]>([]);
  // State untuk menyimpan daftar notifikasi sistem yang terlihat (belum di-read hari ini)
  const [visibleSystemNotifications, setVisibleSystemNotifications] = useState<SystemNotification[]>([]);

  // Daftar notifikasi sistem bawaan (hardcoded update info)
  const defaultSystemNotifications: SystemNotification[] = [
    {
      id: 'sys-update-1',
      title: '🚀 Fitur Baru: Kalender Akademik Bulanan!',
      shortDesc: 'Kami meluncurkan fitur Kalender Akademik interaktif lengkap dengan indikator warna tugas.',
      fullDesc: 'Halo Siswa! Kini Anda dapat meninjau semua tugas dalam sebulan penuh dengan menekan "View All" di halaman Schedule. Indikator Hijau menandakan semua tugas di hari tersebut telah rampung, sedangkan Merah berarti ada tugas penting yang masih pending. Selamat mencoba!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 jam yang lalu
    },
    {
      id: 'sys-update-2',
      title: '💡 Tips Manajemen Waktu: Teknik Pomodoro Terintegrasi',
      shortDesc: 'Tingkatkan produktivitas belajar Anda menggunakan prinsip 25 menit fokus.',
      fullDesc: 'Belajar secara nonstop terbukti menurunkan fokus Anda. Cobalah teknik Pomodoro: pilih satu tugas penting Anda di aplikasi SPD, kerjakan dengan fokus penuh selama 25 menit, lalu ambil istirahat pendek selama 5 menit. Ulangi 4 kali untuk hasil belajar maksimal!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 hari yang lalu
    },
    {
      id: 'sys-update-3',
      title: '⚙️ Pemeliharaan Infrastruktur: Kecepatan Supabase Ditingkatkan',
      shortDesc: 'Server database kami telah dioptimalkan untuk sinkronisasi instan.',
      fullDesc: 'Kami telah melakukan optimasi kueri pada Supabase sehingga penambahan, pengubahan, dan penghapusan jadwal berjalan secara ultra cepat di seluruh gawai Anda. Aplikasi kini lebih responsif dalam memuat tugas harian.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 hari yang lalu
    }
  ];

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchSchedules(user.id);
      }
      setLoading(false);
    };
    initPage();
  }, []);

  useEffect(() => {
    // Memfilter notifikasi sistem berdasarkan localStorage dengan batasan 24 jam
    filterSystemNotifications();
    
    // Set interval untuk melakukan cek berkala (opsional)
    const interval = setInterval(filterSystemNotifications, 1000 * 60); // cek tiap 1 menit
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async (uid: string) => {
    const { data, error } = await supabase
      .from('tb_schedules')
      .select('*')
      .eq('user_id', uid)
      .order('deadline', { ascending: true });

    if (!error && data) {
      setSchedules(data);
    }
  };

  // Callback sukses setelah mengedit jadwal via modal
  const handleSuccess = () => {
    if (userId) fetchSchedules(userId);
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  // Menyelesaikan tugas secara instan dari card peringatan
  const handleCompleteInstantly = async (schedule: Schedule) => {
    const { error } = await supabase
      .from('tb_schedules')
      .update({ is_completed: true })
      .eq('id', schedule.id);

    if (!error && userId) {
      fetchSchedules(userId);
    }
  };

  // --- LOGIKA FILTER NOTIFIKASI SISTEM (localStorage 24 jam) ---
  const filterSystemNotifications = () => {
    try {
      const readDataStr = localStorage.getItem('spd_system_notifications_read');
      const readData: { [id: string]: number } = readDataStr ? JSON.parse(readDataStr) : {};
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 jam

      const filtered = defaultSystemNotifications.filter(notif => {
        const readTimestamp = readData[notif.id];
        // Jika belum pernah dibaca, atau sudah lewat 24 jam sejak dibaca, tampilkan!
        if (!readTimestamp || (now - readTimestamp >= oneDayInMs)) {
          return true;
        }
        return false; // Sembunyikan karena dibaca kurang dari 24 jam yang lalu
      });

      setVisibleSystemNotifications(filtered);
    } catch (e) {
      console.error('Error reading localStorage:', e);
      setVisibleSystemNotifications(defaultSystemNotifications);
    }
  };

  // Menandai notifikasi sistem dibaca (disembunyikan selama 24 jam)
  const markSystemNotificationAsRead = (id: string) => {
    try {
      const readDataStr = localStorage.getItem('spd_system_notifications_read');
      const readData: { [id: string]: number } = readDataStr ? JSON.parse(readDataStr) : {};
      
      // Simpan waktu saat ini
      readData[id] = Date.now();
      localStorage.setItem('spd_system_notifications_read', JSON.stringify(readData));
      
      // Update UI state
      filterSystemNotifications();
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  };

  // Toggle expand deskripsi notifikasi sistem
  const toggleExpandSystem = (id: string) => {
    if (expandedSystemIds.includes(id)) {
      setExpandedSystemIds(prev => prev.filter(item => item !== id));
    } else {
      setExpandedSystemIds(prev => [...prev, id]);
    }
  };

  // --- LOGIKA PERINGATAN DEADLINE (< 2 HARI & BELUM SELESAI) ---
  const now = new Date();
  const deadlineAlerts = schedules.filter(s => {
    if (s.is_completed) return false;
    const deadlineTime = new Date(s.deadline).getTime();
    const timeDiff = deadlineTime - now.getTime();
    
    // Tampilkan jika deadline sudah lewat, atau deadline dalam kurun waktu 2 hari (172800000 ms) ke depan
    return timeDiff <= 2 * 24 * 60 * 60 * 1000;
  });

  // Helper untuk memformat durasi sisa waktu deadline secara ramah manusia
  const getDeadlineAlertMessage = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs < 0) {
      return {
        label: 'Terlewat',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        text: 'Waktu pengerjaan tugas ini sudah habis!'
      };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 2) {
      return {
        label: 'Kritis',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse',
        text: 'Berakhir dlm kurang dari 2 Jam'
      };
    } else if (diffHours < 24) {
      return {
        label: 'Mendesak',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        text: `Berakhir dlm ${diffHours} Jam (Hari Ini)`
      };
    } else {
      return {
        label: 'Mendesak',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        text: `Berakhir dlm ${diffDays} Hari (Besok)`
      };
    }
  };

  // --- LOGIKA STATISTIK TUGAS MINGGU INI ---
  const startOfCurrentWeek = new Date(now);
  const currentDay = startOfCurrentWeek.getDay();
  startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - currentDay); // Hari Minggu
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const endOfCurrentWeek = new Date(startOfCurrentWeek);
  endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6); // Hari Sabtu
  endOfCurrentWeek.setHours(23, 59, 59, 999);

  const weeklySchedules = schedules.filter(s => {
    const deadlineTime = new Date(s.deadline).getTime();
    return deadlineTime >= startOfCurrentWeek.getTime() && deadlineTime <= endOfCurrentWeek.getTime();
  });

  const weeklyCompleted = weeklySchedules.filter(s => s.is_completed).length;
  const weeklyPending = weeklySchedules.filter(s => !s.is_completed).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-28 overflow-x-hidden max-w-2xl mx-auto w-full relative font-sans">
      
      {/* HEADER UTAMA */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-6 md:px-8">
        <Header />
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 mt-2 space-y-6">
        
        {/* BAGIAN 1: PERINGATAN DEADLINE KRITIS */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base">Peringatan Tenggat Waktu</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Tinjau tenggat waktu kritis dan tugas mendesak Anda dalam 2 hari ke depan.
          </p>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-6 text-slate-400 text-xs sm:text-sm animate-pulse bg-white rounded-3xl border border-slate-100 p-4 shadow-sm">
                Menganalisis deadline tugas...
              </div>
            ) : deadlineAlerts.length === 0 ? (
              <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-3xl p-5 text-center shadow-sm">
                <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm">Hebat! Bebas Tenggat Kritis</p>
                <p className="text-xs text-emerald-600/80 mt-1">Tidak ada tugas mendesak dalam 2 hari ke depan. Pertahankan kinerjamu!</p>
              </div>
            ) : (
              deadlineAlerts.map((alert) => {
                const alertInfo = getDeadlineAlertMessage(alert.deadline);
                return (
                  <div 
                    key={alert.id} 
                    className="bg-white border-l-4 border-rose-500 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300"
                  >
                    
                    {/* Top Row: Priority Pill & Sisa Waktu */}
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${alertInfo.badgeColor}`}>
                        {alertInfo.label}
                      </span>
                      <span className="text-slate-400 text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {alertInfo.text}
                      </span>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {alert.title}
                      </h3>
                      {alert.description && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Quick Actions */}
                    <div className="flex gap-2.5 pt-3.5 border-t border-slate-50">
                      
                      <button 
                        onClick={() => handleCompleteInstantly(alert)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                        Mulai Kerjakan Sekarang
                      </button>

                      <button 
                        onClick={() => {
                          setEditingSchedule(alert);
                          setIsModalOpen(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 px-4 rounded-2xl transition-all cursor-pointer"
                      >
                        Detail Tugas
                      </button>

                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BAGIAN 2: NOTIFIKASI SISTEM (TEMPORARY 24 JAM) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base">Notifikasi Sistem & Update</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Pengumuman penting dan tips akademis dari tim pengembang sistem SPD.
          </p>

          <div className="space-y-3">
            {visibleSystemNotifications.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-3xl p-5 text-center shadow-sm">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-xs">Semua notifikasi sistem telah dibaca</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Notifikasi baru akan muncul otomatis atau tereset dalam 24 jam.</p>
              </div>
            ) : (
              visibleSystemNotifications.map((notif) => {
                const isExpanded = expandedSystemIds.includes(notif.id);
                return (
                  <div 
                    key={notif.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 transition-all duration-300"
                  >
                    
                    {/* Header Row: Title & Action Centang */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-medium block mt-1">
                          Dikirim: {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Tombol Centang (Tandai Dibaca - Hilang 1 Hari) */}
                      <button 
                        onClick={() => markSystemNotificationAsRead(notif.id)}
                        className="p-1.5 bg-blue-50 hover:bg-emerald-50 hover:text-emerald-600 text-blue-500 rounded-xl transition-colors cursor-pointer"
                        title="Tandai Dibaca (Sembunyikan 24 Jam)"
                      >
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </div>

                    {/* Deskripsi Singkat */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {notif.shortDesc}
                    </p>

                    {/* Deskripsi Lengkap (View More) */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
                        {notif.fullDesc}
                      </div>
                    )}

                    {/* Button View More / Less */}
                    <button 
                      onClick={() => toggleExpandSystem(notif.id)}
                      className="mt-3 flex items-center gap-1 text-[10px] sm:text-xs font-black text-blue-500 hover:underline transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? 'Lihat Lebih Sedikit' : 'Lihat Selengkapnya'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BAGIAN 3: WIDGET STATISTIK TUGAS MINGGU INI */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-indigo-600/10">
          
          <div className="flex items-center gap-2 mb-3.5">
            <Calendar className="w-5 h-5 opacity-90" />
            <h3 className="font-extrabold text-sm sm:text-base">Tugas Minggu Ini</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Box Selesai */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-black opacity-80 uppercase tracking-wider">Selesai</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black">{weeklyCompleted}</span>
                <span className="text-xs opacity-60">Tugas</span>
              </div>
            </div>

            {/* Box Tertunda */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-black opacity-80 uppercase tracking-wider">Tertunda</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black">{weeklyPending}</span>
                <span className="text-xs opacity-60">Tugas</span>
              </div>
            </div>

          </div>

          <div className="text-[10px] opacity-75 text-center mt-4">
            Dihitung otomatis untuk periode {startOfCurrentWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {endOfCurrentWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>

        </div>

      </div>

      {/* MODAL EDIT JADWAL */}
      {isModalOpen && userId && (
        <ScheduleModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingSchedule(null); }}
          userId={userId}
          existingSchedule={editingSchedule}
          onSuccess={handleSuccess}
        />
      )}

    </div>
  );
}