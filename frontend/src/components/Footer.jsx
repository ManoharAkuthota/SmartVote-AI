import React from 'react';
import { Shield, Lock, Cpu, CheckCircle2, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/90 text-slate-400 text-xs">
      {/* Trust & Security Badges Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <Shield className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Client Biometric Liveness</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-purple-400">
            <Lock className="w-4 h-4" />
            <span className="font-semibold tracking-wide">SHA-256 Digital Seals</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-emerald-400">
            <Cpu className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Spring Security 3.3 JWT</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-amber-400">
            <Award className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Verifiable Zero-Knowledge</span>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="font-bold text-slate-200">SmartVote AI Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Version 1.0.0 Production Release</span>
          </div>

          {/* Demo Identity Disclaimer */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-[11px] text-slate-300 max-w-xl text-center md:text-left">
            <span className="font-bold text-cyan-400 mr-1.5">[Notice] Demo Digital Identity Simulation:</span>
            Government identity databases are simulated for demonstration. Enrolled browser facial descriptors serve as the primary cryptographic biometric identity.
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; 2026 SmartVote AI Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
