'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import { X, Trash2 } from 'lucide-react';
import { Schedule } from '../(dashboard)/dashboard/page';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  existingSchedule: Schedule | null;
  onSuccess: () => void;
}

export default function ScheduleModal({ isOpen, onClose, userId, existingSchedule, onSuccess }: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingSchedule) {
      setTitle(existingSchedule.title);
      setDescription(existingSchedule.description);
      
      if (existingSchedule.deadline) {
        const date = new Date(existingSchedule.deadline);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        setDeadline(localISOTime);
      }
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
    }
  }, [existingSchedule]);

  if (!isOpen) return null;

  // Membuat format tanggal untuk batasan minimal input (Hari Ini)
  const getMinDateTime = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    // Format "YYYY-MM-DDTHH:mm". Sengaja diset T00:00 agar seharian penuh di hari ini masih bisa dipilih.
    return (new Date(today.getTime() - offset)).toISOString().slice(0, 10) + "T00:00";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- VALIDASI DEADLINE ---
    const selectedDeadline = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam ke awal hari ini

    // Jika deadline yang dipilih berada sebelum hari ini
    if (selectedDeadline < today) {
      alert("Gagal menyimpan: Anda tidak dapat membuat jadwal untuk hari yang sudah berlalu!");
      return;
    }

    setLoading(true);

    const scheduleData = {
      user_id: userId,
      title,
      description,
      deadline: selectedDeadline.toISOString(),
      priority: 'normal',
      is_completed: existingSchedule ? existingSchedule.is_completed : false,
    };

    let error;
    if (existingSchedule) {
      const res = await supabase.from('tb_schedules').update(scheduleData).eq('id', existingSchedule.id);
      error = res.error;
    } else {
      const res = await supabase.from('tb_schedules').insert([scheduleData]);
      error = res.error;
    }

    setLoading(false);
    if (error) {
      alert('Error saving schedule: ' + error.message);
    } else {
      onSuccess();
    }
  };

  const handleDelete = async () => {
    if (!existingSchedule) return;
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    
    setLoading(true);
    const { error } = await supabase.from('tb_schedules').delete().eq('id', existingSchedule.id);
    setLoading(false);
    
    if (error) {
      alert('Error deleting schedule: ' + error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
      <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            {existingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h2>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1.5 md:mb-2">Judul Kegiatan</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm sm:text-base border border-gray-300 rounded-xl md:rounded-2xl p-2.5 sm:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Belajar Javascript"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1.5 md:mb-2">Deskripsi</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm sm:text-base border border-gray-300 rounded-xl md:rounded-2xl p-2.5 sm:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[80px] sm:min-h-[100px] md:min-h-[120px]"
              placeholder="Contoh: Belajar variable, if else, dll"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1.5 md:mb-2">Deadline</label>
            <input 
              type="datetime-local" 
              required
              min={getMinDateTime()} // Atribut ini memblokir agar UI kalender HP tidak bisa pilih hari kemarin
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full text-sm sm:text-base border border-gray-300 rounded-xl md:rounded-2xl p-2.5 sm:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3 pt-2 md:pt-4">
            {existingSchedule && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="p-2.5 sm:p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl md:rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center"
                title="Hapus"
              >
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base md:text-lg font-bold py-2.5 sm:py-3 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}