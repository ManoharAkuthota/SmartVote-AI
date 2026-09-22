import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Vote, ShieldAlert, Activity, CheckCircle2, UserX, BarChart3, Clock, ArrowUpRight, RefreshCw, FileText } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load admin analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !analytics) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
        <p className="text-xs">Aggregating cryptographic election telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              Admin Command Center
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Election Operations & Intelligence</h1>
        </div>

        {/* Quick Link Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/elections"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-200 text-xs font-semibold transition"
          >
            Manage Elections
          </Link>
          <Link
            to="/admin/voters"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-semibold transition"
          >
            Voter Registry
          </Link>
          <Link
            to="/admin/audit"
            className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-neon-purple hover:opacity-90 transition"
          >
            Security Audit
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Registered Voters"
          value={analytics?.totalRegisteredVoters || 0}
          subtitle={`${analytics?.totalApprovedVoters || 0} Biometrically Verified`}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Sealed Ballots Cast"
          value={analytics?.totalVotesCast || 0}
          subtitle={`${analytics?.turnoutPercentage || 0}% Total Turnout`}
          icon={Vote}
          color="green"
        />
        <StatCard
          title="Active Elections"
          value={analytics?.activeElectionsCount || 0}
          subtitle="Polling open nationwide"
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Suspicious Login Alerts"
          value={analytics?.suspiciousLoginsCount || 0}
          subtitle="Spoof / Failed Biometrics"
          icon={ShieldAlert}
          color="pink"
        />
      </div>

      {/* Charts & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Candidate Vote Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Candidate Vote Distribution</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Tallies</span>
          </div>

          <div className="space-y-4">
            {(!analytics?.candidateVoteDistribution || analytics.candidateVoteDistribution.length === 0) ? (
              <p className="text-xs text-slate-500 py-8 text-center">No votes recorded yet across active ballots.</p>
            ) : (
              analytics.candidateVoteDistribution.map((cand) => (
                <div key={cand.candidateId} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">
                      {cand.candidateName} <span className="text-slate-500">({cand.partyName})</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {cand.voteCount} votes ({cand.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(2, cand.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hourly Voting Volume Trend (SVG Chart) */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Hourly Voting Volume (Last 24 Hours)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Real-time Surge Tracker</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-1 pt-6 px-2 border-b border-slate-800">
            {Array.from({ length: 24 }).map((_, idx) => {
              const matched = analytics?.hourlyVotes?.find((h) => h.hour === idx);
              const count = matched ? matched.count : 0;
              const maxCount = Math.max(1, ...(analytics?.hourlyVotes?.map((h) => h.count) || [1]));
              const heightPct = Math.round((count / maxCount) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] text-white rounded font-mono pointer-events-none z-10 whitespace-nowrap">
                    {idx}:00 - {count} votes
                  </div>

                  <div
                    className={`w-full max-w-[12px] rounded-t transition-all ${
                      count > 0 ? 'bg-gradient-to-t from-purple-600 to-cyan-400 shadow-neon-cyan' : 'bg-slate-800/40'
                    }`}
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                  />
                  <span className="text-[8px] text-slate-500 font-mono mt-1 block">
                    {idx % 4 === 0 ? `${idx}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Trail Stream */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Recent System Audit Operations</span>
          </h2>
          <Link to="/admin/audit" className="text-xs text-cyan-400 hover:text-cyan-300">
            View All Audit Logs &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Actor</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Entity</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(!analytics?.recentActivities || analytics.recentActivities.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No recent audit activity records found.
                  </td>
                </tr>
              ) : (
                analytics.recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 text-cyan-400">{act.actorEmail}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {act.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">{act.entityType} ({act.entityId})</td>
                    <td className="py-2.5 text-slate-500">{act.ipAddress || '127.0.0.1'}</td>
                    <td className="py-2.5 text-slate-400 max-w-xs truncate">{act.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
