import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Lock, Copy, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function VerifyReceiptPage() {
  const [searchParams] = useSearchParams();
  const initialReceiptId = searchParams.get('receiptId') || '';

  const [receiptId, setReceiptId] = useState(initialReceiptId);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialReceiptId) {
      handleVerify(initialReceiptId);
    }
  }, [initialReceiptId]);

  const handleVerify = async (idToVerify) => {
    const id = idToVerify || receiptId;
    if (!id.trim()) return;

    setIsVerifying(true);
    setSearched(true);
    setResult(null);

    try {
      const res = await api.get(`/votes/verify-receipt/${encodeURIComponent(id.trim())}`);
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setResult({ valid: false, statusMessage: res.data?.message || 'Receipt verification failed.' });
      }
    } catch (err) {
      setResult({
        valid: false,
        statusMessage: err.response?.data?.message || 'Receipt identifier not found on the immutable national voting ledger.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center mb-4 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-3xl font-black text-white">National Cryptographic Receipt Verifier</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Verify that an individual voting receipt is genuine, tamper-free, and officially committed to the National Election Ledger under Article 324.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
        className="relative mb-8"
      >
        <div className="flex rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl p-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition">
          <input
            type="text"
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
            placeholder="Enter Receipt ID (e.g. ECI-2026-A83F9C...)"
            className="flex-1 px-4 py-3 bg-transparent text-sm text-white placeholder-slate-500 font-mono focus:outline-none"
          />
          <button
            type="submit"
            disabled={isVerifying || !receiptId.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center space-x-2 transition cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify Seal</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Verification Result Card */}
      {searched && !isVerifying && result && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl animate-fade-in ${
            result.valid
              ? 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-500/10'
              : 'bg-slate-900/90 border-rose-500/50 shadow-rose-500/10'
          }`}
        >
          {result.valid ? (
            <div>
              {/* Valid Status Header */}
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Valid & Authenticated on National Ledger</h3>
                  <p className="text-xs text-emerald-400 mt-0.5">{result.statusMessage || 'Cryptographic integrity verified under Article 324.'}</p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Receipt ID:</span>
                  <span className="text-amber-400 font-bold">{result.receiptId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Election:</span>
                  <span className="font-sans font-medium text-white text-right max-w-xs truncate">{result.electionTitle}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Recorded Choice:</span>
                  <span className="text-emerald-400 font-bold">{result.candidateName} ({result.partyName} {result.partySymbol})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Timestamp (IST):</span>
                  <span className="text-slate-300">{new Date(result.votedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold">COMMITTED & SEALED</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">SHA-256 Cryptographic Seal:</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 break-all">
                    {result.receiptHash}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 mx-auto mb-3">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Receipt Verification Failed</h3>
              <p className="text-xs text-rose-300 mt-1">{result.statusMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
