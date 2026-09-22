import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Vote, Clock, CheckCircle2, FileText, ExternalLink, Calendar, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VoteReceiptModal from '../components/VoteReceiptModal';
import api from '../services/api';

export default function VoterDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('active'); // 'active', 'upcoming', 'history'
  const [elections, setElections] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [elRes, histRes] = await Promise.all([
        api.get('/elections'),
        api.get('/votes/my-votes'),
      ]);

      if (elRes.data?.success) {
        setElections(elRes.data.data);
      }
      if (histRes.data?.success) {
        setHistory(histRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load voter dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeElections = elections.filter((e) => e.status === 'ACTIVE');
  const upcomingElections = elections.filter((e) => e.status === 'UPCOMING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Voter Profile Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400 p-0.5 bg-slate-950 shrink-0 shadow-neon-cyan">
            <img
              src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt="Voter Avatar"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">{user?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                VERIFIED VOTER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{user?.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 font-mono">
                ID: {user?.voterIdNumber || 'SMV-DEMO-001'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-purple-500/30 text-purple-300 font-mono">
                Aadhaar: {user?.maskedAadhaar || 'XXXX-XXXX-0000'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Voter Stats */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
            <span className="text-xs text-slate-400">Ballots Cast</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{history.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
            <span className="text-xs text-slate-400">Available</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {activeElections.filter((e) => !e.hasVoted).length}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'active'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Active Elections ({activeElections.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'upcoming'
              ? 'bg-purple-500/20 border border-purple-400 text-purple-300'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Upcoming Elections ({upcomingElections.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'history'
              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Voting History & Receipts ({history.length})
        </button>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs font-medium">Synchronizing cryptographic voter records...</p>
        </div>
      ) : (
        <>
          {/* ACTIVE ELECTIONS TAB */}
          {activeTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeElections.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                  No active elections at this moment. Please check upcoming elections.
                </div>
              ) : (
                activeElections.map((el) => (
                  <div
                    key={el.id}
                    className="p-6 rounded-3xl bg-slate-900/70 border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                          {el.category}
                        </span>
                        {el.hasVoted ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            BALLOT CAST & LOCKED
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            VOTE OPEN
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white mt-2">{el.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                        {el.description}
                      </p>

                      <div className="mt-4 flex items-center space-x-4 text-xs text-slate-400">
                        <span><strong>{el.candidates?.length || 0}</strong> Candidates</span>
                        <span>&bull;</span>
                        <span><strong>{el.totalVotes || 0}</strong> Votes Sealed</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Ends: {new Date(el.endDate).toLocaleDateString()}
                      </span>

                      {el.hasVoted ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-700"
                        >
                          Already Voted
                        </button>
                      ) : (
                        <Link
                          to={`/elections/${el.id}/ballot`}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-90 transition"
                        >
                          Cast Ballot Now
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* UPCOMING ELECTIONS TAB */}
          {activeTab === 'upcoming' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingElections.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                  No upcoming elections scheduled right now.
                </div>
              ) : (
                upcomingElections.map((el) => (
                  <div
                    key={el.id}
                    className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        Scheduled
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">{el.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {el.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-purple-300 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Starts on: {new Date(el.startDate).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VOTING HISTORY & RECEIPTS TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                  You have not cast any ballots yet. Visit an active election to vote.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.receiptId}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-400 font-mono font-bold text-xs">{item.receiptId}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-xs text-slate-400">{new Date(item.votedAt).toLocaleString()}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{item.electionTitle}</h4>
                      <p className="text-xs text-cyan-400 mt-0.5">
                        Selected: <strong>{item.candidateName}</strong> ({item.partyName} {item.partySymbol})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Receipt</span>
                      </button>
                      <Link
                        to={`/verify?receiptId=${item.receiptId}`}
                        className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify Seal</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Pop-up Receipt Modal */}
      {selectedReceipt && (
        <VoteReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
