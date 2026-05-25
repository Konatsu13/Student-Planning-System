'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import Header from '../../components/header';
import { 
  Clock, Plus, Edit3, Trash2, Calendar, 
  ChevronLeft, ChevronRight, X, Check, AlertTriangle, Play 
} from 'lucide-react';
import ScheduleModal from '../../components/ScheduleModal';
import { Schedule } from '../dashboard/page';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  // State untuk modal CRUD
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // State untuk Kalender Bulanan (Overlay)
  const [isCalendarOverlayOpen, setIsCalendarOverlayOpen] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());

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

  // Mengambil seluruh jadwal user dari database tb_schedules
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

  // Callback sukses setelah CRUD dari ScheduleModal
  const handleSuccess = () => {
    if (userId) fetchSchedules(userId);
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  // Mengubah status penyelesaian jadwal
  const toggleCompletion = async (schedule: Schedule) => {
    const { error } = await supabase
      .from('tb_schedules')
      .update({ is_completed: !schedule.is_completed })
      .eq('id', schedule.id);

    if (!error && userId) fetchSchedules(userId);
  };

  // Menghapus jadwal dari database
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    const { error } = await supabase.from('tb_schedules').delete().eq('id', id);
    if (!error && userId) fetchSchedules(userId);
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  // --- LOGIKA MINGGUAN (HORIZONTAL STRIP) ---
  const startOfWeek = new Date(currentViewDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day; // Set ke hari Minggu awal minggu
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date | string, d2: Date) => {
    const date1 = new Date(d1);
    return (
      date1.getDate() === d2.getDate() &&
      date1.getMonth() === d2.getMonth() &&
      date1.getFullYear() === d2.getFullYear()
    );
  };

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentViewDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentViewDate(newDate);
  };

  // Mendapatkan status penyelesaian tugas di hari tertentu (untuk kalender strip)
  const getDayStatus = (date: Date) => {
    const daySchedules = schedules.filter(s => isSameDay(s.deadline, date));
    if (daySchedules.length === 0) return 'empty';
    if (daySchedules.every(s => s.is_completed)) return 'completed';
    return 'pending';
  };

  // Nama hari untuk kalender mingguan
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Filter jadwal sesuai tanggal terpilih
  const selectedDateSchedules = schedules.filter(s => isSameDay(s.deadline, selectedDate));

  // --- LOGIKA KALENDER BULANAN (OVERLAY) ---
  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const yearsList = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const startDayOfWeek = date.getDay(); // 0: Minggu, 1: Senin, dst.

    // 1. Padding hari dari bulan sebelumnya
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDaysCount - i),
        isCurrentMonth: false,
      });
    }

    // 2. Hari di bulan aktif saat ini
    const currentMonthDaysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // 3. Padding hari dari bulan berikutnya agar genap kelipatan 7
    const totalCells = 42; // Grid standar 6 baris x 7 kolom
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(calendarMonth, calendarYear);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(prev => prev - 1);
      } else {
        setCalendarMonth(prev => prev - 1);
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(prev => prev + 1);
      } else {
        setCalendarMonth(prev => prev + 1);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-28 overflow-x-hidden max-w-2xl mx-auto w-full relative font-sans">
      
      {/* HEADER UTAMA */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-6 md:px-8">
        <Header />
      </div>

      {/* KALENDER STRIP MINGGUAN */}
      <div className="px-4 sm:px-6 md:px-8 mt-2">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6 transition-all duration-300">
          
          <div className="flex justify-between items-center mb-4">
            {/* Range Tanggal Minggu Ini */}
            <div className="bg-[#0095FF]/10 text-[#0095FF] px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm">
              {startOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {endOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Tombol View All (Membuka Monthly Calendar Overlay) */}
              <button 
                onClick={() => {
                  setCalendarMonth(selectedDate.getMonth());
                  setCalendarYear(selectedDate.getFullYear());
                  setIsCalendarOverlayOpen(true);
                }}
                className="text-xs font-bold text-[#0095FF] hover:underline transition-all cursor-pointer"
              >
                View All
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => changeWeek(-1)} 
                  className="p-1 hover:bg-slate-50 text-slate-600 rounded-full transition-transform active:scale-90 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => changeWeek(1)} 
                  className="p-1 hover:bg-slate-50 text-slate-600 rounded-full transition-transform active:scale-90 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Hari dalam Seminggu */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((date, idx) => {
              const status = getDayStatus(date);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button 
                  key={idx} 
                  onClick={() => {
                    setSelectedDate(date);
                    setCurrentViewDate(date);
                  }}
                  className={`flex flex-col items-center py-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' 
                      : 'hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  {/* Nama Hari */}
                  <span className={`text-[10px] sm:text-xs font-semibold mb-1 opacity-70`}>
                    {dayNames[date.getDay()]}
                  </span>
                  {/* Tanggal */}
                  <span className="text-sm sm:text-base font-black mb-1.5">
                    {date.getDate()}
                  </span>
                  
                  {/* Status Indicator */}
                  {status === 'completed' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  )}
                  {status === 'pending' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                  )}
                  {status === 'empty' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200/50" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* JUDUL INFORMASI JADWAL TANGGAL TERPILIH */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Jadwal Kegiatan
              </h2>
              <p className="text-xs text-slate-400">
                {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button 
            onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>

        {/* TIMELINE JADWAL (VERTIKAL SEPERTI FIGMA) */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 mt-4 ml-3 sm:ml-4">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm animate-pulse">
              Memuat jadwal kegiatan...
            </div>
          ) : selectedDateSchedules.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 -ml-6 sm:-ml-8">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">Tidak ada jadwal</p>
              <p className="text-xs text-slate-400 mt-1">Hari ini bebas tugas! Rileks sejenak atau buat kegiatan baru.</p>
            </div>
          ) : (
            selectedDateSchedules.map((schedule, idx) => {
              const deadlineDate = new Date(schedule.deadline);
              const jamWIB = deadlineDate.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) + ' WIB';

              return (
                <div key={schedule.id} className="relative group">
                  
                  {/* Circle Pin on the Timeline Line */}
                  <span className={`absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-colors ${
                    schedule.is_completed ? 'bg-emerald-500' : 'bg-[#0095FF]'
                  }`}>
                    <Clock className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>

                  {/* Schedule Card */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 hover:shadow-md transition-all duration-300">
                    
                    {/* Top Row: Jam & Badge status */}
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-black text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {jamWIB}
                      </span>
                      
                      {/* Badge status */}
                      <button 
                        onClick={() => toggleCompletion(schedule)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                          schedule.is_completed 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {schedule.is_completed ? 'SELESAI' : 'TERTUNDA'}
                      </button>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="mb-4">
                      <h3 className={`font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors ${schedule.is_completed ? 'line-through opacity-60' : ''}`}>
                        {schedule.title}
                      </h3>
                      {schedule.description && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {schedule.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Action Buttons */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      
                      {/* Checkbox interaktif */}
                      <button 
                        onClick={() => toggleCompletion(schedule)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          schedule.is_completed 
                            ? 'bg-emerald-50 border-emerald-500' 
                            : 'border-slate-300 hover:border-blue-500'
                        }`}>
                          {schedule.is_completed && <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />}
                        </div>
                        <span>{schedule.is_completed ? 'Selesai' : 'Belum selesai'}</span>
                      </button>

                      {/* Action edit & hapus */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(schedule)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors cursor-pointer"
                          title="Edit Jadwal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* --- OVERLAY KALENDER BULANAN (Drawer / Full Overlay) --- */}
      {isCalendarOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100">
            
            {/* Header Kalender Bulanan */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-[#0095FF]/5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-[#0095FF]" />
                <span className="font-extrabold text-slate-800 text-sm sm:text-base">Kalender Akademik</span>
              </div>
              <button 
                onClick={() => setIsCalendarOverlayOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kontrol Navigasi Bulan & Tahun */}
            <div className="p-4 flex justify-between items-center gap-2">
              
              {/* Dropdown Bulan */}
              <select 
                value={calendarMonth}
                onChange={e => setCalendarMonth(parseInt(e.target.value))}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0095FF]/30 transition-all cursor-pointer"
              >
                {monthsList.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>

              {/* Dropdown Tahun */}
              <select 
                value={calendarYear}
                onChange={e => setCalendarYear(parseInt(e.target.value))}
                className="w-28 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0095FF]/30 transition-all cursor-pointer"
              >
                {yearsList.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Panah Cepat */}
              <div className="flex gap-1.5">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Nama-Nama Hari */}
            <div className="grid grid-cols-7 gap-1 px-4 text-center text-xs font-black text-slate-400 mb-2">
              {dayNames.map((name, i) => (
                <div key={i}>{name}</div>
              ))}
            </div>

            {/* Grid Tanggal Kalender Bulanan */}
            <div className="grid grid-cols-7 gap-1 px-4 pb-6">
              {calendarDays.map((cell, idx) => {
                const daySchedules = schedules.filter(s => isSameDay(s.deadline, cell.date));
                const hasSchedules = daySchedules.length > 0;
                const allCompleted = hasSchedules && daySchedules.every(s => s.is_completed);
                const isSelected = isSameDay(cell.date, selectedDate);
                const isToday = isSameDay(cell.date, new Date());

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(cell.date);
                      setCurrentViewDate(cell.date);
                      setIsCalendarOverlayOpen(false); // Tutup overlay
                    }}
                    className={`aspect-square relative rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                      !cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-800 font-bold'
                    } ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-black scale-105 shadow-md shadow-blue-500/20' 
                        : 'hover:bg-slate-50'
                    } ${isToday && !isSelected ? 'border border-blue-400 bg-blue-50/30' : ''}`}
                  >
                    
                    {/* Tanggal */}
                    <span className="text-xs sm:text-sm">{cell.date.getDate()}</span>

                    {/* Indikator Bulat Berwarna */}
                    {hasSchedules && (
                      <span className={`w-2 h-2 rounded-full absolute bottom-1 sm:bottom-1.5 transition-colors ${
                        allCompleted 
                          ? isSelected ? 'bg-white' : 'bg-emerald-500' // Hijau = Semua Selesai
                          : isSelected ? 'bg-white' : 'bg-rose-500'    // Merah = Ada Pending
                      }`} />
                    )}

                  </button>
                );
              })}
            </div>

            {/* Panduan Warna */}
            <div className="bg-slate-50 px-5 py-4 flex justify-around text-[10px] sm:text-xs font-bold text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Semua Selesai (Hijau)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Belum Selesai (Merah)</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CRUD JADWAL */}
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