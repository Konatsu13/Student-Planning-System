'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import Header from '../../components/header';
import { Plus, Edit3, Calendar, Book, Check, Minus, AlertTriangle, ChevronDown, ChevronUp, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import ScheduleModal from '../../components/ScheduleModal';

export type Schedule = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  deadline: string;
  is_completed: boolean;
  created_at: string;
};

export default function Dashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndSchedules = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchSchedules(user.id);
      }
      setLoading(false);
    };
    fetchUserAndSchedules();
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

  const handleCreateOrUpdate = () => {
    if (userId) fetchSchedules(userId);
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const toggleCompletion = async (schedule: Schedule) => {
    const { error } = await supabase
      .from('tb_schedules')
      .update({ is_completed: !schedule.is_completed })
      .eq('id', schedule.id);

    if (!error && userId) fetchSchedules(userId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    const { error } = await supabase.from('tb_schedules').delete().eq('id', id);
    if (!error && userId) fetchSchedules(userId);
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  // --- LOGIKA KALENDER MINGGUAN ---
  const startOfWeek = new Date(currentViewDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
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

  // Cek apakah minggu yang dilihat di kalender adalah minggu saat ini
  const isCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffToday = today.getDate() - today.getDay();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(diffToday);

    return startOfWeek.getTime() <= startOfCurrentWeek.getTime();
  };

  const changeWeek = (offset: number) => {
    // MENCEGAH MUNDUR KE MINGGU SEBELUMNYA
    if (offset < 0 && isCurrentWeek()) return; 

    const newDate = new Date(currentViewDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentViewDate(newDate);
  };

  const formatShortDate = (d: Date) => {
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };
  const weekDateRange = `${formatShortDate(startOfWeek)} - ${formatShortDate(endOfWeek)}`;

  // --- LOGIKA GESTUR SWIPE ---
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) changeWeek(1); 
    // Mencegah swipe kanan (mundur) jika sudah di minggu ini
    if (isRightSwipe && !isCurrentWeek()) changeWeek(-1); 
  };

  const todaySchedules = schedules.filter(s => isSameDay(s.deadline, selectedDate));
  const completedToday = todaySchedules.filter(s => s.is_completed).length;

  const getDayStatus = (date: Date) => {
    const daySchedules = schedules.filter(s => isSameDay(s.deadline, date));
    if (daySchedules.length === 0) return 'empty';
    if (daySchedules.every(s => s.is_completed)) return 'completed';
    return 'warning';
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const hasImportantAnnouncement = schedules.some(s => !s.is_completed && isSameDay(s.deadline, new Date()));

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] pb-28 md:pb-32 overflow-x-hidden max-w-2xl mx-auto w-full relative">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6 md:px-8">
        <Header />
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 mt-2">
        
        <div 
          className="bg-white rounded-2xl md:rounded-3xl shadow-sm mb-4 md:mb-6 w-full overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="bg-[#0095FF] text-white px-4 md:px-5 py-1.5 md:py-2 rounded-br-2xl font-bold text-sm md:text-base shadow-sm">
              {weekDateRange}
            </div>
            <div className="flex gap-4 md:gap-6 pr-4 md:pr-6">
              {/* Jika isCurrentWeek() bernilai true, tombol kiri akan dinonaktifkan (abu-abu) */}
              <button 
                onClick={() => changeWeek(-1)} 
                disabled={isCurrentWeek()}
                className={`transition-transform ${isCurrentWeek() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:text-black active:scale-90'}`}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
              </button>
              <button onClick={() => changeWeek(1)} className="text-gray-700 hover:text-black transition-transform active:scale-90">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="flex justify-between sm:justify-around items-center overflow-x-auto no-scrollbar gap-2 md:gap-4 pb-4 px-3 md:px-5">
            {weekDays.map((date, idx) => {
              const status = getDayStatus(date);
              const isSelected = isSameDay(date, selectedDate);
              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center cursor-pointer min-w-[32px] sm:min-w-[40px] md:min-w-[48px] transition-transform active:scale-95"
                  onClick={() => setSelectedDate(date)}
                >
                  <span className={`font-bold mb-2 sm:mb-3 text-xs sm:text-sm md:text-base ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                    {dayNames[date.getDay()]}
                  </span>
                  
                  {status === 'empty' && (
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-blue-100 border-blue-400 text-blue-500 shadow-md' : 'bg-blue-50 border-blue-200 text-blue-400'}`}>
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    </div>
                  )}
                  {status === 'completed' && (
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-green-100 border-green-500 text-green-600 shadow-md' : 'bg-green-50 border-green-400 text-green-500'}`}>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    </div>
                  )}
                  {status === 'warning' && (
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-orange-100 border-orange-400 text-orange-500 shadow-md' : 'bg-orange-50 border-orange-300 text-orange-500'}`}>
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {hasImportantAnnouncement && (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm mb-4 md:mb-6 overflow-hidden border-2 border-red-400">
            <div 
              className="p-3 md:p-4 flex justify-between items-center cursor-pointer hover:bg-red-50 transition-colors"
              onClick={() => setIsAnnouncementOpen(!isAnnouncementOpen)}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                </div>
                <span className="font-bold text-red-500 text-sm md:text-base">Pengumuman penting!</span>
              </div>
              {isAnnouncementOpen ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-red-500" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-red-500" />}
            </div>
            {isAnnouncementOpen && (
              <div className="px-3 md:px-4 pb-3 md:pb-4 text-xs sm:text-sm md:text-base text-gray-700">
                Anda memiliki jadwal yang belum selesai dengan deadline hari ini. Segera selesaikan!
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-1.5 md:gap-2 bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            <span>Jadwal hari ini</span>
          </div>
          <div className="bg-white text-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold shadow-sm flex-1 text-center text-xs sm:text-sm md:text-base min-w-[120px]">
            {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">
              {todaySchedules.length} Tugas
            </span>
            <span className="bg-green-100 text-green-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">
              {completedToday} Selesai
            </span>
          </div>
          
          <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
            <button 
              onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
              className="bg-blue-500 text-white p-1.5 sm:p-2 md:p-2.5 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
              title="Tambah Jadwal"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-1.5 sm:p-2 md:p-2.5 rounded-full border transition-colors shadow-sm ${isEditMode ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-blue-500 border-blue-100 hover:bg-blue-50'}`}
              title="Mode Edit/Hapus"
            >
              <Edit3 className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {loading ? (
            <div className="text-center py-6 text-xs sm:text-sm md:text-base text-gray-500 animate-pulse">Memuat jadwal...</div>
          ) : todaySchedules.length === 0 ? (
            <div className="text-center py-6 text-xs sm:text-sm md:text-base text-gray-500 bg-white rounded-2xl md:rounded-3xl shadow-sm">Tidak ada jadwal untuk hari ini.</div>
          ) : (
            todaySchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className={`bg-white p-3 sm:p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between transition-all gap-2 md:gap-4 ${isEditMode ? 'border-2 border-orange-200 scale-[1.02]' : 'hover:shadow-md'}`}
              >
                <div 
                  className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 cursor-pointer" 
                  onClick={() => openEditModal(schedule)}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Book className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-blue-900 truncate">{schedule.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 truncate">{schedule.description}</p>
                  </div>
                </div>

                {isEditMode ? (
                  <div className="flex gap-2 md:gap-3 ml-2 md:ml-4 animate-in fade-in slide-in-from-right-2">
                    <button 
                      onClick={() => openEditModal(schedule)}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>
                    <button 
                      onClick={() => handleDelete(schedule.id)}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ml-2 md:ml-4 ${schedule.is_completed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-50 hover:bg-blue-100'}`}
                    onClick={() => toggleCompletion(schedule)}
                  >
                    {schedule.is_completed && <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500 animate-in zoom-in" />}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 md:mt-8 flex gap-3 md:gap-4 max-w-md md:max-w-xl mx-auto">
          <button className="flex-1 bg-green-100 text-green-700 py-2.5 sm:py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 border border-green-200 text-sm sm:text-base md:text-lg hover:bg-green-200 transition-colors">
            <Book className="w-5 h-5 md:w-6 md:h-6" />
            Tugas
          </button>
          <button className="flex-1 bg-blue-50 text-blue-600 py-2.5 sm:py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 border border-blue-100 text-sm sm:text-base md:text-lg hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
            Jadwal
          </button>
        </div>

      </div>

      {isModalOpen && userId && (
        <ScheduleModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingSchedule(null); }}
          userId={userId}
          existingSchedule={editingSchedule}
          onSuccess={handleCreateOrUpdate}
        />
      )}
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}