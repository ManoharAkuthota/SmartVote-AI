import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
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
    voterIdNumber: 'IND-DL-' + Math.floor(1000000 + Math.random() * 9000000),
    maskedAadhaar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
  });
  const [showPassword, setShowPassword] = useState(false);

  const [faceData, setFaceData] = useState({
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
    if (!formData.fullName.trim()) return 'Please enter your full legal citizen name.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Please enter a valid email address.';
    if (!formData.mobileNumber.trim()) return 'Please enter your 10-digit mobile phone number.';
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  const handleNextToPhoto = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handlePhotoSuccess = (capturedData) => {
    setFaceData({
      faceImageUrl: capturedData.faceImageUrl,
      embedding: capturedData.embedding,
      qualityScore: capturedData.qualityScore || 0.96,
      livenessPassed: capturedData.livenessPassed,
      blinkDetected: capturedData.blinkDetected,
      headTurnDetected: capturedData.headTurnDetected,
    });
    setStep(3);
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        voterIdNumber: formData.voterIdNumber,
        maskedAadhaar: formData.maskedAadhaar,
        faceImageUrl: faceData.faceImageUrl,
        faceEmbedding: faceData.embedding,
        livenessPassed: faceData.livenessPassed,
        blinkDetected: faceData.blinkDetected,
        headTurnDetected: faceData.headTurnDetected,
        deviceFingerprint: navigator.userAgent,
      };

      const res = await api.post('/auth/register', payload);

      if (res.data?.success) {
        setSuccessMsg('Voter enrollment completed successfully on the National Electoral Roll! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/login', { state: { email: formData.email } });
        }, 1500);
      } else {
        setErrorMsg(res.data?.message || 'Registration could not be completed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Email or EPIC Voter ID may already be enrolled.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl backdrop-blur-xl">
        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              1
            </div>
            <span className={`text-xs font-medium ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>
              Identity Profile
            </span>
          </div>

          <div className="w-10 h-0.5 bg-slate-800" />

          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              2
            </div>
            <span className={`text-xs font-medium ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>
              Photo Capture
            </span>
          </div>

          <div className="w-10 h-0.5 bg-slate-800" />

          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              3
            </div>
            <span className={`text-xs font-medium ${step >= 3 ? 'text-white' : 'text-slate-500'}`}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center space-x-2 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center space-x-2 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Personal & Identity Info (Form 6) */}
        {step === 1 && (
          <form onSubmit={handleNextToPhoto} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Official Voter Enrollment (Form 6)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your citizenship details to initialize your official digital voter record.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh Kumar Verma / Priya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="voter@domain.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition"
                    required
                  />
                </div>
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
                  placeholder="At least 6 characters"
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

            {/* Official Digital Identity Format */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Election Commission of India Identifiers (Pre-assigned)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400">Assigned EPIC Voter ID</span>
                  <input
                    type="text"
                    name="voterIdNumber"
                    value={formData.voterIdNumber}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Masked Aadhaar Reference</span>
                  <input
                    type="text"
                    name="maskedAadhaar"
                    value={formData.maskedAadhaar}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 active:scale-[0.99] text-white font-semibold text-xs shadow transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue to Photo Capture</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-4 text-xs text-slate-400">
              Already enrolled?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2">
                Official Citizen Sign-In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Facial Security Enrollment */}
        {step === 2 && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-white">Official Photo Enrollment</h2>
              <p className="text-xs text-slate-400 mt-1">
                Position your face inside the oval guide and click <strong>Take Photo Now</strong>.
              </p>
            </div>

            <FaceScanner
              mode="register"
              requireLiveness={true}
              onSuccess={handlePhotoSuccess}
            />

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-5 text-xs text-slate-400 hover:text-white flex items-center space-x-1 mx-auto transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile Information</span>
            </button>
          </div>
        )}

        {/* STEP 3: Verification Summary & Confirmation */}
        {step === 3 && (
          <div className="space-y-5 text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md">
              <img
                src={faceData.faceImageUrl}
                alt="Captured Face"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{formData.fullName}</h3>
              <p className="text-xs text-amber-400 font-medium mt-0.5">{formData.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-left space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Official EPIC Voter ID:</span>
                <span className="text-amber-300 font-mono font-bold">{formData.voterIdNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Aadhaar Identifier:</span>
                <span className="text-slate-200 font-mono">{formData.maskedAadhaar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facial Verification:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Enrolled
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Electoral Protocol:</span>
                <span className="text-slate-300">ECI Certified Cryptographic Ledger</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-white font-semibold text-xs shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enrolling on Electoral Roll...</span>
                  </>
                ) : (
                  <span>Confirm & Complete Enrollment</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
