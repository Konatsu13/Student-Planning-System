'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white selection:bg-blue-500 selection:text-white">
      
      {/* Main Content Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 max-w-4xl mx-auto text-center w-full z-10">
        {/* Logo Utama */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="SPD Logo"
              width={100}
              height={100}
              className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain transition-transform duration-500 group-hover:rotate-6"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
          Student Planning <span className="text-blue-600">Digital</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-2xl leading-relaxed">
          Kelola kehidupan akademikmu dengan mudah menggunakan sistem perencanaan semua-dalam-satu. Jadwalkan kelas, pantau tenggat waktu tugas, dan susun perjalanan belajarmu dengan lebih cerdas, teratur, & produktif setiap hari.
        </p>

        {/* CTA Button */}
        <div className="flex flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all font-bold text-lg shadow-md tracking-wide"
          >
            Bergabung Sekarang
          </Link>
        </div>
      </main>

      {/* Footer Gaya Hoyoverse - Responsive Premium Version */}
      <footer className="w-full bg-[#111218] text-slate-400 relative mt-auto mt-10 pt-14 pb-8 py">
        
        {/* 1. BAGIAN GELOMBANG KURVA ASIMETRIS (Full Width & Stretch) */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-[98%] pointer-events-none">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] sm:h-[80px] md:h-[100px]"
          >
            {/* S-curve path transitioning from high (left, Y=0) to low (right, Y=60) */}
            <path
              d="M0,0 L350,0 C450,0 450,60 550,60 L1200,60 L1200,120 L0,120 Z"
              fill="#111218"
            ></path>
          </svg>
        </div>

        {/* 2. KONTEN DI DALAM FOOTER */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start text-center md:text-left gap-8 md:gap-4 mb-10">
            
            {/* Bagian Kiri: Logo + Info + Links */}
            <div className="flex flex-col items-center md:items-start gap-4">
              
              {/* Logo Brand Footer */}
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-white text-base tracking-tight">
                  Student Planning <span className="text-blue-400">Digital</span>
                </span>
              </div>
              
              {/* Navigasi Links */}
              {/* <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mt-2 text-xs sm:text-sm font-medium">
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </div> */}

              {/* Copyright Text */}
              <p className="text-[11px] sm:text-xs text-slate-500 font-light mt-1">
                &copy; 2026 Kelompok 2 - SPD. All rights reserved.
              </p>
            </div>

            {/* Bagian Kanan: Kontrol Aksi (Bahasa & Kembali ke Atas) + Versi */}
            <div className="flex flex-col items-center md:items-end gap-4 md:mt-2">
              
              {/* Version Info */}
              <div className="text-[11px] font-bold tracking-widest text-slate-500 bg-slate-800/30 px-3 py-1 rounded-full border border-slate-800/50">
                Version 1.0.0
              </div>
            </div>

          </div>

          {/* Garis batas tipis bawah */}
          <div className="border-t border-slate-800/60 pt-6 text-center">
            <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
              Pintar, Terorganisir, & Produktif Setiap Hari.
            </span>
          </div>

        </div>

      </footer>
    </div>
  );
}