import React from 'react';
import { Shield, Lock, ShieldCheck, Award, FileCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      {/* Official Trust & Security Badges */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold tracking-wide">Certified Biometric Verification</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Lock className="w-4 h-4 text-blue-500" />
            <span className="font-semibold tracking-wide">256-Bit Tamper-Evident Seals</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold tracking-wide">End-to-End Cryptographic Ledger</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="font-semibold tracking-wide">Voter Anonymity Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="font-bold text-slate-200">SmartVote Official Electoral Portal</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Certified National System</span>
          </div>

          {/* Official Compliance Notice */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 max-w-xl text-center md:text-left leading-relaxed">
            <span className="font-semibold text-blue-400 mr-1.5">Official Electoral Notice:</span>
            All ballots cast on this portal are sealed with cryptographic SHA-256 digital signatures. Voter identity is decoupled from ballot contents to guarantee secret voting and verifiable democratic integrity.
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; 2026 SmartVote Electoral System. All official rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
