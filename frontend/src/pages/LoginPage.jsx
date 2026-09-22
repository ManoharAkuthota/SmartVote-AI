import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import OtpModal from '../components/OtpModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1: Password, 2: Face Verification, 3: OTP
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [sessionToken, setSessionToken] = useState(null);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  // Preset demo credentials helper
  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setFormData({ email: 'admin@smartvote.ai', password: 'Admin@123' });
    } else {
      setFormData({ email: 'voter@smartvote.ai', password: 'Voter@123' });
    }
    setErrorMsg(null);
  };

  // STEP 1: Email + Password Submit
  const handleLoginInit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/login-init', {
        email: formData.email,
        password: formData.password,
        deviceFingerprint: navigator.userAgent,
      });

      if (res.data?.success) {
        const data = res.data.data;
        setSessionToken(data.sessionToken);
        setMaskedMobile(data.maskedMobile);

        if (data.nextStep === 'FACE_VERIFY') {
          setStep(2);
        } else if (data.nextStep === 'OTP_VERIFY') {
          // Admin bypasses face or user without face
          setStep(3);
        }
      } else {
        setErrorMsg(res.data?.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid credentials or account locked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Live Face Verification Complete
  const handleFaceSuccess = async (biometricData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/verify-face', {
        email: formData.email,
        sessionToken,
        liveEmbedding: biometricData.embedding,
        livenessPassed: biometricData.livenessPassed,
        blinkDetected: biometricData.blinkDetected,
        headTurnDetected: biometricData.headTurnDetected,
        deviceFingerprint: navigator.userAgent,
      });

      if (res.data?.success) {
        setSessionToken(res.data.data.sessionToken);
        setStep(3); // Advance to OTP verification
      } else {
        setErrorMsg(res.data?.message || 'Facial verification failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Facial biometrics does not meet 85% confidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: OTP Complete
  const handleOtpSuccess = (jwtResponse) => {
    login(jwtResponse.token, jwtResponse.user);
    if (jwtResponse.user?.role === 'ROLE_ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Password Entry */}
        {step === 1 && (
          <form onSubmit={handleLoginInit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mb-3 shadow-neon-cyan">
                <ShieldCheck className="w-7 h-7 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Biometric Sign-In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to initiate facial liveness verification.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="voter@smartvote.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Demo Shortcuts */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Demo Credentials:
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('voter')}
                  className="flex-1 py-1.5 px-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-[11px] text-cyan-300 font-mono transition"
                >
                  ⚡ Fill Voter
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin')}
                  className="flex-1 py-1.5 px-2 bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-lg text-[11px] text-purple-300 font-mono transition"
                >
                  🛡️ Fill Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-90 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Initialize Biometrics</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center mt-4 text-xs text-slate-400">
              Need a digital identity?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Enroll Now
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Facial Biometric Verification */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Live Face Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Authenticating against your stored 128-D embedding (85% similarity requirement).
              </p>
            </div>

            <FaceScanner
              mode="login"
              requireLiveness={true}
              onSuccess={handleFaceSuccess}
            />

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 text-xs text-slate-400 hover:text-white block text-center mx-auto"
            >
              Cancel & Return
            </button>
          </div>
        )}

        {/* STEP 3: Two-Factor OTP Modal */}
        {step === 3 && (
          <OtpModal
            email={formData.email}
            sessionToken={sessionToken}
            maskedMobile={maskedMobile}
            onSuccess={handleOtpSuccess}
            onCancel={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
