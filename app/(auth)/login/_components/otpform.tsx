'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase';
import { CheckCircle2 } from 'lucide-react';

interface OtpFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function OtpForm({ email, onSuccess, onBack }: OtpFormProps) {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      // Set countdown for 30 seconds
      setResendCountdown(30);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-cyan-100 p-3 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-cyan-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Verification Code</h1>
        <p className="text-gray-500 text-sm mt-2">
          We've send you a message to set the verification code
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Enter OTP code
          </label>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                placeholder="0"
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'Verifying...' : 'Confirm'}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center mt-6">
        <p className="text-gray-600 text-sm">
          Didn't receive the code?{' '}
          <button
            onClick={handleResendOtp}
            disabled={resendCountdown > 0}
            className="text-blue-700 hover:underline font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
          </button>
        </p>
      </div>

      {/* Back Button */}
      <div className="text-center mt-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
