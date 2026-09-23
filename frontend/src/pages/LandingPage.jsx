import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Users,
  Vote,
  Search,
  FileText,
  Smartphone,
  Landmark,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Camera,
  Check,
  Building2,
  Key
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function LandingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [hashInput, setHashInput] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      setLoadingElections(true);
      const res = await api.get('/elections/public');
      if (res.data?.success) {
        setElections(res.data.data.slice(0, 4));
      }
    } catch (e) {
      console.warn('Could not fetch public elections:', e.message);
    } finally {
      setLoadingElections(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (hashInput.trim()) {
      navigate(`/verify?hash=${encodeURIComponent(hashInput.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Is my vote genuinely secret under Article 324?",
      a: "Yes, absolutely. Under Article 324 of the Constitution of India, secret ballot protection is mathematically guaranteed. SmartVote Bharat uses a Zero-Knowledge Decoupling protocol where your authenticated voter authorization token is separated from your ballot selection prior to cryptographic sealing. Neither election officials, system administrators, nor external observers can link your identity to your chosen candidate."
    },
    {
      q: "Does SmartVote Bharat store my facial scan or facial patterns?",
      a: "No. The AI facial security verification runs ephemerally in browser memory. It performs real-time liveness analysis (blink and head posture verification) to match you against your official electoral roll photograph. Once verified, the camera feed and temporary memory buffers are instantly purged. 0% facial vector templates are stored on our servers."
    },
    {
      q: "Can someone use a printed photograph or video of me to vote?",
      a: "No. The multi-point AI anti-spoofing engine requires active physical liveness challenges, including random micro-blinks, natural pupil depth reflections, and slight angular head movements. Static photographs, screen replays, and artificial masks are automatically flagged and rejected as fraudulent attempts."
    },
    {
      q: "How do I independently verify that my vote was officially counted?",
      a: "Immediately upon casting your ballot, the portal generates an official Election Commission PDF receipt containing an immutable SHA-256 cryptographic seal and verifiable QR code. You can paste this hash into our Public Ledger Verifier at any time to verify its permanent inclusion in the audit ledger without disclosing your vote choice."
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Subtle National Civic Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl pointer-events-none -z-10" />

      {/* 1. HERO SECTION: Institutional National Authority */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Official Authority Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300 backdrop-blur-xl mb-6 shadow-sm">
          <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>भारत निर्वाचन आयोग • Sovereign Digital Democracy | Article 324 Compliant</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight">
          SmartVote Bharat: Sovereign, Remote & Verifiable E-Voting for Every Indian Citizen
        </h1>

        {/* Comprehensive Explanatory Lead */}
        <p className="mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          SmartVote Bharat is India&apos;s sovereign national digital electoral portal. Built in accordance with Election Commission of India standards, it empowers over 900 million citizens—including domestic migrant workers, armed forces personnel on duty, senior citizens, and overseas voters—to cast an immutable, tamper-evident, and 100% secret ballot from any connected device using AI facial security verification, multi-factor Aadhaar authentication, and cryptographic ledger verification.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto">
          <Link
            to="/elections"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-amber-600/25 transition flex items-center justify-center space-x-2"
          >
            <Vote className="w-4 h-4" />
            <span>{t('hero_cta_vote')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-300 dark:border-slate-700 shadow-sm transition flex items-center justify-center space-x-2"
          >
            <span>{t('hero_cta_register')}</span>
          </Link>
          <Link
            to="/verify"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-800 transition flex items-center justify-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span>Audit Receipt</span>
          </Link>
        </div>

        {/* Official National Electoral Metrics Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">99.99%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('stat_uptime')}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">Fault-Tolerant Node Mesh</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Article 324 Secrecy</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Decoupled Identity Token</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">SHA-256</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Ledger Audit Seal</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">Tamper-Evident Hash</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">0% Retained</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Ephemeral AI Security</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 font-semibold">Zero Template Storage</div>
          </div>
        </div>
      </section>

      {/* 2. EXECUTIVE OVERVIEW: What is SmartVote Bharat? */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-700 dark:text-blue-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Architecture & Mission</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            What is SmartVote Bharat? (स्मार्टवोट भारत क्या है?)
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            SmartVote Bharat is India&apos;s next-generation sovereign digital election infrastructure. It bridges geographic distance and physical polling barriers, allowing certified Indian voters to participate in Lok Sabha, Vidhan Sabha, and Municipal elections securely from their mobile phones or computers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Constitutional Mandate</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Designed under the constitutional framework of Article 324 (Superintendence, direction, and control of elections). It strictly preserves universal adult suffrage, eliminates physical coercion at polling booths, and guarantees 100% ballot secrecy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Universal Democratic Inclusion</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Over 300 million domestic migrants, defense personnel stationed on frontiers, elderly citizens, and overseas voters are often disenfranchised by physical distance. SmartVote Bharat provides remote voting rights without requiring travel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cryptographic Trust & Auditability</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Replaces paper ballot risks with SHA-256 cryptographic verification. Every ballot cast generates a verifiable digital certificate that can be checked against the public electoral ledger without exposing the voter&apos;s political choice.
            </p>
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP: How Remote E-Voting Works */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl my-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Citizen Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            How Remote E-Voting Works (मतदान प्रक्रिया)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A simple, secure 4-step process taking under 2 minutes while maintaining peak national security standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Step 1 */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  01
                </span>
                <Smartphone className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. E-Voter Authentication</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Enter your EPIC (Voter ID) or Aadhaar number. A secure 6-digit OTP is delivered to your registered mobile phone to verify identity credentials.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 2-Factor Verification
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center">
                  02
                </span>
                <Camera className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. AI Facial Security</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Browser AI checks 3D liveness (blink, head tilt) to verify your living presence against your electoral roll photo. Zero facial scan data is stored.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Anti-Spoofing Protected
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                  03
                </span>
                <Vote className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Secret Digital Ballot</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Access your constituency candidates with verified party symbols. Cast your confidential vote under Article 324 end-to-end secrecy.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 100% Anonymized Choice
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center">
                  04
                </span>
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Tamper-Proof Receipt</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Download an official ECI certificate with SHA-256 seal & QR code. Audit your vote on the public ledger anytime without revealing choice.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Verifiable Audit Trail
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHO CAN VOTE REMOTELY? Empowering Every Citizen */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-700 dark:text-purple-400 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Civic Empowerment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Democracy for Every Citizen: Who Can Vote Remotely?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Removing barriers for citizens who cannot physically reach their polling stations on election day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Internal Migrant Workers</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Vote in your hometown constituency from anywhere in India without losing daily wages or incurring expensive bus and train travel expenses.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Armed Forces & Defense</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Service voters and personnel posted in border outposts, high-altitude terrain, or naval vessels can cast their franchise securely and on schedule.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Seniors & Divyangjan</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Specially-abled citizens and seniors vote comfortably from home using multi-language voice narration and accessible contrast controls.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overseas NRI Electors</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Indian citizens living abroad can exercise their democratic franchise in parliamentary elections through secure passport-linked verification.
            </p>
          </div>
        </div>
      </section>

      {/* 5. LIVE BALLOTS & CONSTITUENCIES */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Electoral Registers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Active Democratic Ballots</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Participate in live parliamentary, state assembly, and municipal corporation ballots.
            </p>
          </div>
          <Link
            to="/elections"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <span>View All Electoral Ballots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loadingElections ? (
            <div className="col-span-2 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
              Synchronizing active electoral registers with Central Election Commission servers...
            </div>
          ) : elections.length === 0 ? (
            <div className="col-span-2 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
              No active elections currently in polling cycle.
            </div>
          ) : (
            elections.map((el) => (
              <div
                key={el.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      {el.category || 'General Election'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      POLLING ACTIVE
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{el.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {el.description}
                  </p>

                  <div className="mt-4 flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <span><strong>{el.candidates?.length || 0}</strong> Certified Candidates</span>
                    <span>&bull;</span>
                    <span><strong>{el.totalVotes || 0}</strong> Ballots Sealed</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Polls close: {new Date(el.endDate).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/elections/${el.id}/ballot`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-sm transition"
                  >
                    {t('btn_access_ballot')}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 6. INSTANT PUBLIC LEDGER VERIFICATION WIDGET */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-amber-500/30 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Instant Public Ledger Verifier</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Audit any sealed ballot receipt hash directly against the public cryptographic ledger.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifySubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Paste SHA-256 Receipt Hash (e.g., e3b0c44298fc1c149afbf4...)"
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-inner"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>Verify on Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            * SmartVote Bharat&apos;s Zero-Knowledge Verifier confirms the cryptographic integrity and inclusion of the sealed receipt without disclosing candidate preference.
          </p>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-700 dark:text-blue-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Citizen Trust & Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions (अक्सर पूछे जाने वाले प्रश्न)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Clear, authoritative answers regarding voter privacy, facial security, and election legality.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. OFFICIAL HELPLINE & CONSTITUTIONAL FOOTER CALLOUT */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                National Voter Support & Grievance
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Election Commission Helpline: Toll-Free 1950
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Assistance available in Hindi, English, and all scheduled Indian languages 24x7.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
              >
                Enroll as Voter
              </Link>
              <Link
                to="/elections"
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition whitespace-nowrap"
              >
                Explore Ballots
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
