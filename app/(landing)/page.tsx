'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/assets/logo.png"
              alt="SPD Logo"
              width={60}
              height={60}
              className="w-25 h-25"
            />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Student Planning <span className="text-blue-600">Digital</span>
          </h1>

          {/* Subtitle */}
          <p className="text-md text-gray-600 mb-12">
            Manage your student life easily with our all-in-one planning system. Schedule classes, track assignments, and organize your academic journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-bold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

{/* Footer Gaya Hoyoverse - Responsive Version (HP, Tablet, Laptop) */}
      <footer className="w-full bg-[#039ffaff] text-gray-400 relative mt-auto pt-10 pb-6 text-center">
        
        {/* 1. BAGIAN GELOMBANG KURVA ASIMETRIS (Full Width & Stretch) */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-[99%] pointer-events-none">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[40px] md:h-[60px]"
          >
            {/* Path SVG original yang ditarik full lebar kontainer */}
            <path
              d="M0,32 C300,120 600,0 900,32 L1200,60 L1200,120 L0,120 Z"
              fill="#039ffaff"
            ></path>
          </svg>
        </div>

        {/* 2. KONTEN DI DALAM FOOTER */}
        <div className="px-4 flex flex-col items-center gap-2 relative z-10">
          {/* Logo / Singkatan Aplikasi */}
          <div className="text-xs font-bold tracking-widest text-white mb-1">
            Version 0.1.0 (Beta)
          </div>

          {/* Copyright Text */}
          <p className="text-[11px] sm:text-xs text-black font-light">
            &copy; 2026 Kelompok 2 - SPD. All rights reserved.
          </p>
        </div>

      </footer>
    </div>
  );
}