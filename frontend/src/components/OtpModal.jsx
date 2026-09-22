import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RefreshCw, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function OtpModal({
  email,
  sessionToken,
  maskedMobile,
  onSuccess,
  onCancel,
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resendStatus, setResendStatus] = useState(null);
  const inputRefs = useRef([]);

  // Auto countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all 6 filled
    if (index === 5 && value && newDigits.every((d) => d !== '')) {
      submitOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const arr = pasted.split('');
      setDigits(arr);
      submitOtp(pasted);
    }
  };

  const submitOtp = async (codeToSubmit) => {
    const code = codeToSubmit || digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otpCode: code,
        sessionToken,
        deviceFingerprint: navigator.userAgent,
      });

      if (res.data?.success) {
        onSuccess(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'Invalid OTP code');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 60) return; // Prevent spam
    setResendStatus('Sending new code...');
    try {
      await api.post('/auth/resend-otp', { email, sessionToken });
      setTimer(120);
      setDigits(['', '', '', '', '', '']);
      setResendStatus('New OTP dispatched to your email.');
      setTimeout(() => setResendStatus(null), 4000);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setErrorMsg('Failed to resend OTP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mb-4 shadow-neon-cyan">
          <KeyRound className="w-7 h-7 text-cyan-400" />
        </div>

        <h3 className="text-xl font-bold text-center text-white">Two-Factor Authorization</h3>
        <p className="text-xs text-center text-slate-400 mt-1 max-w-xs mx-auto">
          Biometrics accepted. Enter the 6-digit cryptographic verification code dispatched to:
        </p>
        <p className="text-xs font-mono font-semibold text-center text-cyan-400 mt-1">{email}</p>

        {/* 6 Digit Inputs */}
        <div className="flex justify-center space-x-2.5 sm:space-x-3 my-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono text-cyan-300 bg-slate-950/90 border border-slate-700 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition"
            />
          ))}
        </div>

        {/* Error / Resend Notices */}
        {errorMsg && (
          <div className="p-2.5 mb-4 bg-rose-950/70 border border-rose-500/50 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resendStatus && (
          <div className="p-2.5 mb-4 bg-cyan-950/70 border border-cyan-500/50 rounded-xl flex items-center space-x-2 text-cyan-300 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        {/* Countdown & Resend */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
          <div className="flex items-center space-x-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Expires in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 60}
            className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 font-semibold transition"
          >
            Resend Code
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => submitOtp()}
            disabled={isSubmitting || digits.some((d) => d === '')}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-95 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating Ledger OTP...</span>
              </>
            ) : (
              <span>Verify & Sign In</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
