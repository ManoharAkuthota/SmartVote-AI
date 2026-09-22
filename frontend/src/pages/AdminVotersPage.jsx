import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Lock, Unlock, Eye, RefreshCw, X, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function AdminVotersPage() {
  const [voters, setVoters] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFaceUrl, setSelectedFaceUrl] = useState(null);

  useEffect(() => {
    fetchVoters();
  }, [selectedStatus]);

  const fetchVoters = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/admin/voters', { params });
      if (res.data?.success) {
        setVoters(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load voters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (voterId, newStatus, reason) => {
    try {
      const res = await api.patch(`/admin/voters/${voterId}/status`, {
        status: newStatus,
        reason: reason || 'Administrative decision',
      });
      if (res.data?.success) {
        setVoters((prev) => prev.map((v) => (v.id === voterId ? res.data.data : v)));
      }
    } catch (err) {
      alert('Failed to update voter status: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
            Identity Authorization
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Voter Enrollment Management</h1>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchVoters();
          }}
          className="w-full md:w-96 flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-cyan-400 transition"
        >
          <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, voter ID..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['', 'APPROVED', 'PENDING', 'LOCKED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === '' ? 'ALL VOTERS' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Voters Table */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <span className="text-xs">Querying voter ledger registry...</span>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">Biometric Face</th>
                <th className="pb-3 font-semibold">Full Name & Email</th>
                <th className="pb-3 font-semibold">Demo Voter ID</th>
                <th className="pb-3 font-semibold">Masked Aadhaar</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Enrolled Date</th>
                <th className="pb-3 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {voters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No voter profiles match your search criteria.
                  </td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5">
                      <div
                        onClick={() => setSelectedFaceUrl(v.faceImageUrl)}
                        className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 cursor-pointer hover:scale-105 transition shadow-sm bg-slate-950"
                        title="Click to enlarge biometric portrait"
                      >
                        <img
                          src={v.faceImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={v.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-bold text-white text-xs">{v.fullName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{v.email}</span>
                    </td>

                    <td className="py-3.5 font-mono text-cyan-300 font-semibold">{v.voterIdNumber}</td>
                    <td className="py-3.5 font-mono text-purple-300">{v.maskedAadhaar}</td>

                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : v.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : v.status === 'LOCKED'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right space-x-1.5">
                      {v.status !== 'APPROVED' && (
                        <button
                          onClick={() => updateStatus(v.id, 'APPROVED', 'Admin manual verification')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-[11px] font-semibold"
                          title="Approve Voter"
                        >
                          Approve
                        </button>
                      )}

                      {v.status !== 'REJECTED' && (
                        <button
                          onClick={() => updateStatus(v.id, 'REJECTED', 'Admin rejection')}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/50 text-[11px] font-semibold"
                          title="Reject Registration"
                        >
                          Reject
                        </button>
                      )}

                      {v.status === 'LOCKED' ? (
                        <button
                          onClick={() => updateStatus(v.id, 'APPROVED', 'Admin unlocked account')}
                          className="p-1 rounded-lg bg-slate-800 text-emerald-400 hover:text-white"
                          title="Unlock Account"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(v.id, 'LOCKED', 'Administrative security freeze')}
                          className="p-1 rounded-lg bg-slate-800 text-amber-400 hover:text-white"
                          title="Lock Account"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Biometric Portrait Modal */}
      {selectedFaceUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
          <div className="relative max-w-sm w-full p-4 rounded-3xl bg-slate-900 border border-cyan-500/40 text-center">
            <button
              onClick={() => setSelectedFaceUrl(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-3">Enrolled Biometric Selfie</h3>
            <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-neon-cyan">
              <img src={selectedFaceUrl} alt="Voter" className="w-full h-full object-cover" />
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-mono">
              Stored securely with Cloudinary & 128-D descriptor in MySQL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
