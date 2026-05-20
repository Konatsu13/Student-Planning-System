'use client';

import { useState } from 'react';
import LoginForm from './_components/loginform';
import RegisterForm from './_components/registerform';
import OtpForm from './_components/otpform';
import NewPasswordForm from './_components/newpassword';
import Dashboard  from '@/app/(dashboard)/page';

type AuthStep = 'login' | 'register' | 'otp' | 'newPassword' | 'success';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');

  const handleRegisterSuccess = () => {
    // Jika perlu verifikasi OTP setelah registrasi
    // setStep('otp');
    // Langsung ke success jika tidak pakai OTP
    setStep('success');
  };

  const handleLoginSuccess = () => {
    setStep('success');
  };

  const handleOtpSuccess = () => {
    setStep('newPassword');
  };

  const handleNewPasswordSuccess = () => {
    setStep('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Success Screen */}
      {step === 'success' && (
        <div className="w-full max-w-md mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been successfully created. Please wait while we redirect you...
          </p>
          <div className="animate-pulse text-gray-500">Redirecting...</div>
        </div>
      )}

      {/* Login Screen */}
      {step === 'login' && (
        <LoginForm
          onSwitchToRegister={() => setStep('register')}
          onSwitchToForgotPassword={() => {
            setStep('otp');
          }}
        />
      )}

      {/* Register Screen */}
      {step === 'register' && (
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setStep('login')}
        />
      )}

      {/* OTP Screen */}
      {step === 'otp' && (
        <OtpForm
          email={email}
          onSuccess={handleOtpSuccess}
          onBack={() => setStep('login')}
        />
      )}

      {/* New Password Screen */}
      {step === 'newPassword' && (
        <NewPasswordForm
          email={email}
          onSuccess={handleNewPasswordSuccess}
          onBack={() => setStep('login')}
        />
      )}
    </div>
  );
}
