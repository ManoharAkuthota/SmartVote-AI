import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Vote, Clock, CheckCircle2, FileText, ExternalLink, Calendar, AlertCircle, RefreshCw, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import VoteReceiptModal from '../components/VoteReceiptModal';
import api from '../services/api';

export default function VoterDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

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
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 p-0.5 bg-slate-950 shrink-0">
            <img
              src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
              alt="Voter Avatar"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">{user?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                VERIFIED CITIZEN VOTER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{user?.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 font-mono">
                EPIC: {user?.voterIdNumber || 'IND-DL-8941205'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono">
                Aadhaar: {user?.maskedAadhaar || 'XXXX-XXXX-4589'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Voter Stats & Sign Out Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ballots Cast</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">{history.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Available</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {activeElections.filter((e) => !e.hasVoted).length}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            title="Sign Out of Voter Account"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'active'
              ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
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
          Scheduled Elections ({upcomingElections.length})
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
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-xs font-medium">Synchronizing cryptographic voter records...</p>
        </div>
      ) : (
        <>
          {/* ACTIVE ELECTIONS TAB */}
          {activeTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeElections.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                  No active constituency elections at this moment. Please check scheduled polls.
                </div>
              ) : (
                activeElections.map((el) => (
                  <div
                    key={el.id}
                    className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/30 uppercase">
                          {el.category}
                        </span>
                        {el.hasVoted ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            BALLOT CAST & SEALED
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            POLLING OPEN
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
                        Closes: {new Date(el.endDate).toLocaleDateString()}
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
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-md transition"
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
                  No upcoming elections scheduled on the calendar.
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
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-mono font-bold text-xs">{item.receiptId}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-xs text-slate-400">{new Date(item.votedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{item.electionTitle}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Selected: <strong className="text-amber-400">{item.candidateName}</strong> ({item.partyName} {item.partySymbol})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Certificate</span>
                      </button>
                      <Link
                        to={`/verify?receiptId=${item.receiptId}`}
                        className="px-3.5 py-2 rounded-xl bg-amber-950/60 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition"
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
