import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, CheckCircle2, ArrowRight, ShieldCheck, Users, Vote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function LandingPage() {
  const { t } = useLanguage();
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
      {/* Subtle National Civic Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-amber-600/10 via-blue-600/10 to-emerald-600/10 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Official Authority Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/30 border border-amber-500/30 text-xs font-semibold text-amber-300 backdrop-blur-xl mb-6 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('hero_badge')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          {t('hero_title')}
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-amber-600/20 transition flex items-center justify-center space-x-2"
          >
            <span>{t('hero_cta_register')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/elections"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-amber-500/40 transition flex items-center justify-center space-x-2"
          >
            <Vote className="w-4 h-4 text-amber-400" />
            <span>{t('hero_cta_vote')}</span>
          </Link>
        </div>

        {/* Official National Electoral Metrics Row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">99.99%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{t('stat_uptime')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Article 324 Secrecy</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">SHA-256</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{t('receipt_hash')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">2-Factor</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Aadhaar & Mobile OTP</div>
          </div>
        </div>
      </section>

      {/* 3-Pillar Official Security Architecture */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Three-Tier Electoral Security Architecture</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Engineered to Election Commission of India standards with on-device biometric liveness, multi-factor Aadhaar verification, and tamper-evident cryptographic auditability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center mb-4">
              <Eye className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pillar 1</span>
            <h3 className="text-base font-bold text-white mt-1">{t('pillar_1_title')}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t('pillar_1_desc')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Pillar 2</span>
            <h3 className="text-base font-bold text-white mt-1">{t('pillar_2_title')}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t('pillar_2_desc')}
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Pillar 3</span>
            <h3 className="text-base font-bold text-white mt-1">{t('pillar_3_title')}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t('pillar_3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Active Elections */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Active Electoral Ballots</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Participate in live parliamentary, state assembly, and municipal ballots.</p>
          </div>
          <Link
            to="/elections"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>View All Ballots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.length === 0 ? (
            <div className="col-span-2 p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              Synchronizing active electoral registers...
            </div>
          ) : (
            elections.map((el) => (
              <div
                key={el.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                      {el.category || 'General Election'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      POLLING ACTIVE
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{el.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {el.description}
                  </p>

                  <div className="mt-4 flex items-center space-x-3 text-xs text-slate-400">
                    <span><strong>{el.candidates?.length || 0}</strong> Certified Candidates</span>
                    <span>&bull;</span>
                    <span><strong>{el.totalVotes || 0}</strong> Ballots Sealed</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Polls close: {new Date(el.endDate).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/elections/${el.id}/ballot`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-xs shadow-sm transition"
                  >
                    {t('btn_access_ballot')}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Official Identity Protocol Callout */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-amber-600/10 border border-amber-500/30 text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Electoral Privacy & Constitutional Protocol</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                SmartVote Bharat strictly enforces secret ballot anonymity under Article 324 of the Constitution of India. When a citizen authenticates via facial biometric capture and casts a vote, their biometric identifier is sealed on the authorization ledger to prevent duplicate voting, while the vote choice is decoupled and sealed cryptographically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
