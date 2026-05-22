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

      {/* Footer */}
      <footer className="border-t border-blue-100 py-6 text-center text-gray-600 text-sm">
        <p>&copy; 2026 Kelompok 2 - SPD. All rights reserved.</p>
      </footer>
    </div>
  );
}