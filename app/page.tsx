'use client'; // Wajib karena kita pakai state untuk form

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  // State untuk menyimpan input user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true); // Toggle antara Login dan Register

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // INTEGRASI DATABASE DI SINI:
    // Jika pakai Supabase: await supabase.auth.signInWithPassword({ email, password })
    // Jika pakai NextAuth: await signIn('credentials', { email, password })
    
    console.log('Submit:', { email, password, type: isLoggingIn ? 'Login' : 'Signup' });
    alert(`Mencoba ${isLoggingIn ? 'Login' : 'Daftar'} dengan ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">
            {isLoggingIn ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isLoggingIn ? 'Enter your details to login' : 'Fill the form to register'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="name@student.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Your secure password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-200 transform hover:scale-[1.02]"
          >
            {isLoggingIn ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Login/Sign Up */}
        <div className="mt-8 text-center text-sm text-gray-400">
          {isLoggingIn ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLoggingIn(!isLoggingIn)}
            className="text-blue-400 hover:underline font-medium"
          >
            {isLoggingIn ? 'Sign Up here' : 'Login here'}
          </button>
        </div>
        
        {/* Tombol Back ke Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}