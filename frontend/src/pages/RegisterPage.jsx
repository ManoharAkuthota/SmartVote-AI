import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    voterIdNumber: 'SMV-' + Math.floor(1000000 + Math.random() * 9000000),
    maskedAadhaar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
  });

  const [biometrics, setBiometrics] = useState({
    faceImageUrl: '',
    embedding: null,
    qualityScore: 0.95,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Please enter a valid email address.';
    if (!formData.mobileNumber.trim()) return 'Please enter your mobile phone number.';
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  const handleNextToBiometrics = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleBiometricSuccess = (data) => {
    setBiometrics({
      faceImageUrl: data.faceImageUrl,
      embedding: data.embedding,
      qualityScore: data.qualityScore,
    });
    setStep(3);
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...formData,
        faceImageUrl: biometrics.faceImageUrl,
        faceEmbedding: biometrics.embedding,
        qualityScore: biometrics.qualityScore,
      };

      const res = await api.post('/auth/register', payload);

      if (res.data?.success) {
        setSuccessMsg('Digital identity enrolled successfully! Redirecting to biometric sign-in...');
        setTimeout(() => {
          navigate('/login', { state: { email: formData.email } });
        }, 2200);
      } else {
        setErrorMsg(res.data?.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
              step >= 1 ? 'bg-cyan-400 text-slate-950 shadow-neon-cyan' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">Profile</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-cyan-400' : 'bg-slate-800'}`} />

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
              step >= 2 ? 'bg-cyan-400 text-slate-950 shadow-neon-cyan' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">Biometrics</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-cyan-400' : 'bg-slate-800'}`} />

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
              step >= 3 ? 'bg-emerald-400 text-slate-950 shadow-neon-green' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">Confirm</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center space-x-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Personal & Identity Info */}
        {step === 1 && (
          <form onSubmit={handleNextToBiometrics} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Enroll Digital Identity</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your credential details to initialize your biometric voter profile.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Maya Lin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="+1 555-0199"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Demo Identity Simulation Fields */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20 space-y-3">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-cyan-400">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Demo Digital Identity Simulation (Pre-filled)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400">Demo Voter ID</span>
                  <input
                    type="text"
                    name="voterIdNumber"
                    value={formData.voterIdNumber}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Masked Aadhaar</span>
                  <input
                    type="text"
                    name="maskedAadhaar"
                    value={formData.maskedAadhaar}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-purple-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-90 flex items-center justify-center space-x-2 transition"
            >
              <span>Proceed to Biometric Capture</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-4 text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign in with Biometrics
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Biometric Webcam Enrollment */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Biometric Face Enrollment</h2>
              <p className="text-xs text-slate-400 mt-1">
                Look into the camera. We will verify liveness (blink and head turn) and store your 128-D neural vector.
              </p>
            </div>

            <FaceScanner
              mode="register"
              requireLiveness={true}
              onSuccess={handleBiometricSuccess}
            />

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile Details</span>
            </button>
          </div>
        )}

        {/* STEP 3: Verification Summary & Cloudinary Commit */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-r from-cyan-400 to-purple-500 shadow-neon-cyan">
              <img
                src={biometrics.faceImageUrl}
                alt="Captured Face"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{formData.fullName}</h3>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">{formData.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Voter ID:</span>
                <span className="text-cyan-300 font-bold">{formData.voterIdNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masked Aadhaar:</span>
                <span className="text-purple-300">{formData.maskedAadhaar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biometric Vector:</span>
                <span className="text-emerald-400 font-bold">128-D Descriptor Sealed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Target:</span>
                <span className="text-slate-300">Cloudinary + MySQL</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Retake Photo
              </button>
              <button
                type="button"
                onClick={handleSubmitRegistration}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-95 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enrolling Biometric Identity...</span>
                  </>
                ) : (
                  <span>Commit Digital Registration</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
