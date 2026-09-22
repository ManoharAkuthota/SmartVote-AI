import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, Search, Calendar, Users, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/elections/public');
      if (res.data?.success) {
        setElections(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = elections.filter((e) => {
    const matchesFilter = filter === 'ALL' || e.status === filter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
          Electoral Registry
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">Active & Scheduled Ballots</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Discover national councils, policy referendums, and assembly polls secured by zero-knowledge biometric consensus.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elections or topics..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex space-x-2">
          {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-neon-cyan'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <span className="text-xs">Fetching electoral registers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-3 p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              No elections found matching criteria.
            </div>
          ) : (
            filtered.map((el) => (
              <div
                key={el.id}
                className="p-6 rounded-3xl bg-slate-900/70 border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                      {el.category || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      el.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : el.status === 'UPCOMING'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {el.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1 leading-snug">{el.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {el.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>Candidates: <strong>{el.candidates?.length || 0}</strong></span>
                    <span>Total Votes: <strong>{el.totalVotes || 0}</strong></span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Deadline: {new Date(el.endDate).toLocaleDateString()}
                  </div>

                  {el.status === 'ACTIVE' ? (
                    <Link
                      to={`/elections/${el.id}/ballot`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-90 flex items-center space-x-1.5 transition"
                    >
                      <span>Cast Ballot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">
                      {el.status === 'UPCOMING' ? 'Opens Soon' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
