import React from 'react';
import { Shield, Lock, ShieldCheck, Award, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      {/* Subtle National Tricolor Accent Divider */}
      <div className="h-0.5 w-full flex">
        <div className="h-full flex-1 bg-amber-500/70" />
        <div className="h-full flex-1 bg-white/70" />
        <div className="h-full flex-1 bg-emerald-600/70" />
      </div>

      {/* Official Trust & Security Badges */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-semibold tracking-wide">ECI Facial Security Standards</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="font-semibold tracking-wide">SHA-256 Tamper-Proof Seals</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold tracking-wide">End-to-End Cryptographic Ledger</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-semibold tracking-wide">Article 324 Secret Ballot</span>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="font-bold text-slate-200">SmartVote Bharat (भारत निर्वाचन)</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-medium">National E-Voting Portal</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>{t('helpline_text') || 'National Voter Helpline: Toll-Free 1950'}</span>
            </div>
          </div>

          {/* Official Compliance Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 max-w-xl text-center md:text-left leading-relaxed">
            <span className="font-bold text-amber-400 mr-1.5">Official Electoral Notice:</span>
            In compliance with <strong>Article 324 of the Constitution of India</strong> and the Representation of the People Act, all ballots cast on this portal are sealed with cryptographic SHA-256 digital signatures. Voter identity is decoupled from ballot contents to guarantee secret voting and verifiable democratic integrity.
          </div>

          <div className="text-slate-500 text-[11px] text-center md:text-right">
            <div>&copy; 2026 SmartVote Bharat.</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Election Commission of India Standards</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
