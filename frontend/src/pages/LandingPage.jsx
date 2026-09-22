import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Fingerprint, Award, CheckCircle2, ArrowRight, Cpu, Sparkles, Activity, Users, Vote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function LandingPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    activeElections: 2,
    totalVoters: 1420,
    totalVotes: 864,
    turnout: 60.8,
  });
  const [elections, setElections] = useState([]);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const res = await api.get('/elections/public');
      if (res.data?.success) {
        setElections(res.data.data.slice(0, 3));
      }
    } catch (e) {
      console.warn('Could not fetch public elections:', e.message);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Cyber Grid Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[400px] right-0 w-[400px] h-[400px] bg-purple-600/10 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Startup Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-neon-cyan backdrop-blur-xl mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Cryptographic Democracy Protocol</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
          Secure Online Voting <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Powered by Browser Biometrics
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 text-slate-950 font-bold text-sm shadow-neon-cyan hover:opacity-90 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>{t('hero_cta_register')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/elections"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center space-x-2"
          >
            <Vote className="w-4 h-4 text-cyan-400" />
            <span>{t('hero_cta_vote')}</span>
          </Link>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1">Free Open Tech</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">&ge; 85%</div>
            <div className="text-xs text-slate-400 mt-1">Biometric Threshold</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">SHA-256</div>
            <div className="text-xs text-slate-400 mt-1">Immutable Digital Seal</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">&lt; 120s</div>
            <div className="text-xs text-slate-400 mt-1">2FA Session OTP</div>
          </div>
        </div>
      </section>

      {/* 3-Step Verification Flow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Three-Pillar Biometric Security Architecture</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Engineered from ground up with client-side neural face matching, multi-factor OTP verification, and tamper-evident receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-cyan-500/20 hover:border-cyan-400/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">STAGE 01</span>
            <h3 className="text-lg font-bold text-white mt-1">In-Browser Face Liveness</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Using Face-api.js directly inside your browser. Analyzes 68 facial landmarks to verify eye blinks (EAR) and head rotations without sending raw video over the wire.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-purple-500/20 hover:border-purple-400/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">STAGE 02</span>
            <h3 className="text-lg font-bold text-white mt-1">Two-Factor OTP Dispatch</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Once facial biometrics surpass the 85% match threshold, an ephemeral 6-digit cryptographic code is dispatched through Gmail SMTP, expiring automatically in 120 seconds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-emerald-500/20 hover:border-emerald-400/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">STAGE 03</span>
            <h3 className="text-lg font-bold text-white mt-1">Cryptographic Digital Receipts</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Each cast vote generates an immutable SHA-256 seal and unique QR code. Download your official PDF receipt and verify receipt inclusion publicly without compromising voter privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Active Elections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Active Democratic Ballots</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Participate in live elections with single-ballot verification.</p>
          </div>
          <Link
            to="/elections"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Elections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.length === 0 ? (
            <div className="col-span-2 p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
              Loading active ballots...
            </div>
          ) : (
            elections.map((el) => (
              <div
                key={el.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                      {el.category || 'General'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE NOW
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">{el.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {el.description}
                  </p>

                  <div className="mt-4 flex items-center space-x-3 text-xs text-slate-400">
                    <span><strong>{el.candidates?.length || 0}</strong> Candidates</span>
                    <span>&bull;</span>
                    <span><strong>{el.totalVotes || 0}</strong> Ballots Sealed</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ends: {new Date(el.endDate).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/elections/${el.id}/ballot`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-90 transition"
                  >
                    Enter Ballot
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Demo Identity Simulation Disclosure Callout */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Demo Digital Identity Simulation Notice</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                National Aadhaar and Election Commission databases are restricted by government policy. SmartVote AI features a <strong>Demo Digital Identity Simulation</strong>, generating simulated voter IDs and masked Aadhaar tags while binding your real webcam facial selfie as the primary zero-knowledge biometric credential for login and voting authorization.
              </p>
              <div className="mt-4 flex items-center space-x-4 text-xs font-mono text-cyan-400">
                <span>Default Admin: admin@smartvote.ai / Admin@123</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
