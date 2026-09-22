import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft, RefreshCw, CheckCircle2, Lock, Vote } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';
import VoteReceiptModal from '../components/VoteReceiptModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function BallotPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchElection();
  }, [id]);

  const fetchElection = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/elections/${id}`);
      if (res.data?.success) {
        setElection(res.data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load official ballot details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) return;
    setIsCasting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/votes/cast', {
        electionId: election.id,
        candidateId: selectedCandidate.id,
      });

      if (res.data?.success) {
        setShowConfirmModal(false);
        setReceipt(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'Vote casting failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Vote rejected: You may have already voted or this ballot is closed.');
      setShowConfirmModal(false);
    } finally {
      setIsCasting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-xs font-medium">Accessing official cryptographic ballot chamber...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-white">Election Ballot Not Found</h2>
        <Link to="/elections" className="text-xs text-amber-400 mt-2 block">
          &larr; Back to Elections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Return link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Voter Portal</span>
      </Link>

      {/* Ballot Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/40 uppercase">
                {election.category || 'Constituency Ballot'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Ends: {new Date(election.endDate).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">{election.title}</h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">{election.description}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Rule</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1 justify-center">
              <Lock className="w-3.5 h-3.5" />
              1 Citizen, 1 Vote
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Article 324 ECI Standard</span>
          </div>
        </div>
      </div>

      {/* Already Voted Banner */}
      {election.hasVoted && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center space-x-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="block text-sm">Your Ballot is Cryptographically Sealed</strong>
            You have already cast your single permitted vote for this election. The ledger record is permanent and immutable.
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center space-x-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Certified Candidate Cards Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Vote className="w-5 h-5 text-amber-400" />
          <span>Official Nominated Candidates ({election.candidates?.length || 0})</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {election.candidates?.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              onSelect={(cand) => setSelectedCandidate(cand)}
              disabled={election.hasVoted}
            />
          ))}
        </div>
      </div>

      {/* Submit Button Sticky Bar */}
      {!election.hasVoted && (
        <div className="p-6 rounded-2xl bg-slate-900/95 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl backdrop-blur-xl">
          <div>
            <span className="text-xs text-slate-400">Current Ballot Choice:</span>
            <div className="text-sm font-bold text-amber-400">
              {selectedCandidate ? `${selectedCandidate.fullName} — ${selectedCandidate.partyName} (${selectedCandidate.partySymbol})` : 'No candidate selected'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedCandidate || isCasting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-40 transition cursor-pointer"
          >
            Review & Seal Ballot Choice
          </button>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>

            <h3 className="text-xl font-bold text-center text-white">Constitutional Vote Confirmation</h3>
            <p className="text-xs text-center text-slate-300 mt-2 leading-relaxed">
              You are about to cast your official democratic ballot for:
            </p>

            <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-base font-black text-amber-400">{selectedCandidate?.fullName}</div>
              <div className="text-xs text-slate-300 mt-1">{selectedCandidate?.partyName} <span className="text-lg">{selectedCandidate?.partySymbol}</span></div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 mb-6 leading-relaxed">
              <strong>STATUTORY NOTICE (Article 324):</strong> Once submitted, your vote is cryptographically signed and permanently committed to the election ledger. Your choice remains 100% secret and cannot be altered or revoked.
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/3 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCastVote}
                disabled={isCasting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
              >
                {isCasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sealing on Ledger...</span>
                  </>
                ) : (
                  <span>I Understand & Seal Ballot</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Pop-up Modal */}
      {receipt && (
        <VoteReceiptModal
          receipt={receipt}
          onClose={() => {
            setReceipt(null);
            fetchElection(); // Refresh election state to show hasVoted = true
          }}
        />
      )}
    </div>
  );
}
