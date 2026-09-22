import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RefreshCw, KeyRound, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import api from '../services/api';

export default function OtpModal({
  email,
  sessionToken,
  maskedMobile,
  demoOtp,
  onSuccess,
  onCancel,
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resendStatus, setResendStatus] = useState(null);
  const [currentOtp, setCurrentOtp] = useState(demoOtp || null);
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

  // Update currentOtp if demoOtp changes
  useEffect(() => {
    if (demoOtp) {
      setCurrentOtp(demoOtp);
    }
  }, [demoOtp]);

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

  const handleAutoFill = () => {
    const code = currentOtp || '123456';
    const arr = code.slice(0, 6).split('');
    setDigits(arr);
    setErrorMsg(null);
    submitOtp(code);
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
        setErrorMsg(res.data?.message || 'Invalid verification code.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 60) return; // Prevent spam
    setResendStatus('Dispatching new verification code...');
    try {
      const res = await api.post('/auth/resend-otp', { email, sessionToken });
      setTimer(120);
      setDigits(['', '', '', '', '', '']);
      if (res.data?.data?.demoOtp) {
        setCurrentOtp(res.data.data.demoOtp);
      }
      setResendStatus('New verification code dispatched.');
      setTimeout(() => setResendStatus(null), 4000);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setErrorMsg('Failed to resend verification code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Official Header Icon */}
        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white">Two-Factor Identity Verification</h3>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Facial security verified. Enter the 6-digit cryptographic verification code dispatched to:
        </p>
        <p className="text-xs font-mono font-semibold text-center text-blue-600 dark:text-blue-400 mt-1">{email}</p>

        {/* Demo Mode / SMTP Notice Callout */}
        <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
          <div className="flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Email Delivery Notice
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium">
                  Testing Mode Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                If Gmail SMTP is not configured with an App Password, check server terminal or use universal testing code <strong className="font-mono text-slate-900 dark:text-white">123456</strong>.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                  Code: {currentOtp || '123456'}
                </span>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1 shadow-sm"
                >
                  <Zap className="w-3 h-3" />
                  <span>Auto-Fill Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Digit Inputs */}
        <div className="flex justify-center space-x-2.5 sm:space-x-3 mb-5" onPaste={handlePaste}>
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
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
            />
          ))}
        </div>

        {/* Error / Resend Notices */}
        {errorMsg && (
          <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/50 rounded-xl flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resendStatus && (
          <div className="p-2.5 mb-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-500/50 rounded-xl flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{resendStatus}</span>
          </div>
        )}

        {/* Countdown & Resend */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6 px-1">
          <div className="flex items-center space-x-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Valid for: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 60}
            className="text-blue-600 dark:text-blue-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 disabled:no-underline font-semibold transition"
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
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => submitOtp()}
            disabled={isSubmitting || digits.some((d) => d === '')}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center space-x-2 transition"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
