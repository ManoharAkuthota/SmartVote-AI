import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  const [sessionToken, setSessionToken] = useState(null);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [demoOtp, setDemoOtp] = useState(null);
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
        if (data.demoOtp) {
          setDemoOtp(data.demoOtp);
        }

        if (data.nextStep === 'FACE_VERIFY') {
          setStep(2);
        } else if (data.nextStep === 'OTP_VERIFY') {
          setStep(3);
        }
      } else {
        setErrorMsg(res.data?.message || 'Authentication failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please verify your electoral credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Live Face Verification Complete
  const handleFaceSuccess = async (faceData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/verify-face', {
        email: formData.email,
        sessionToken,
        liveEmbedding: faceData.embedding,
        livenessPassed: faceData.livenessPassed,
        blinkDetected: faceData.blinkDetected,
        headTurnDetected: faceData.headTurnDetected,
        deviceFingerprint: navigator.userAgent,
      });

      if (res.data?.success) {
        setSessionToken(res.data.data.sessionToken);
        if (res.data.data?.demoOtp) {
          setDemoOtp(res.data.data.demoOtp);
        }
        setStep(3);
      } else {
        setErrorMsg(res.data?.message || 'Facial identity match could not be confirmed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Facial match score insufficient. Please retry.');
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
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl backdrop-blur-xl">
        {/* Error Alert */}
        {errorMsg && step === 1 && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center space-x-2 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Password Entry */}
        {step === 1 && (
          <form onSubmit={handleLoginInit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Official E-Voter Portal</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to begin secure multi-factor facial security authentication.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="voter@smartvote.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Indian Demo Accounts */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-medium">
                Official Demo Credentials:
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('voter')}
                  className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-medium transition flex items-center justify-center gap-1"
                >
                  <span>👤 Citizen Voter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin')}
                  className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-medium transition flex items-center justify-center gap-1"
                >
                  <span>🛡️ Election Admin</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-white font-semibold text-xs shadow transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Continue to Facial Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center mt-4 text-xs text-slate-400">
              Not yet enrolled as a voter?{' '}
              <Link to="/register" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2">
                Apply for Enrollment (Form 6)
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Facial Security Verification */}
        {step === 2 && (
          <div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white">Facial Security Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Position your face within the oval guide to verify against your enrolled electoral photo.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start space-x-2.5 text-rose-200 text-xs text-left shadow-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-300">Facial Identity Unconfirmed</p>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            <FaceScanner
              mode="login"
              requireLiveness={true}
              onSuccess={handleFaceSuccess}
              isVerifying={isSubmitting}
              externalError={errorMsg}
              onReset={() => setErrorMsg(null)}
            />

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 text-xs text-slate-400 hover:text-white block text-center mx-auto transition"
            >
              &larr; Return to Email & Password
            </button>
          </div>
        )}

        {/* STEP 3: Two-Factor OTP Modal */}
        {step === 3 && (
          <OtpModal
            email={formData.email}
            sessionToken={sessionToken}
            maskedMobile={maskedMobile}
            demoOtp={demoOtp}
            onSuccess={handleOtpSuccess}
            onCancel={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
