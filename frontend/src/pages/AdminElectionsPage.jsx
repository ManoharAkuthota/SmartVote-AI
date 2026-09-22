import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, AlertCircle, CheckCircle2, RefreshCw, X, Shield } from 'lucide-react';
import api from '../services/api';

export default function AdminElectionsPage() {
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [managingElection, setManagingElection] = useState(null); // For candidate management

  // Election form
  const [electionForm, setElectionForm] = useState({
    title: '',
    description: '',
    category: 'Parliamentary (Lok Sabha)',
    bannerUrl: '',
    startDate: '',
    endDate: '',
  });

  // Candidate form
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    partyName: '',
    partySymbol: '🪷',
    photoUrl: '',
    manifesto: '',
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/elections');
      if (res.data?.success) {
        setElections(res.data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load elections.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/elections', electionForm);
      if (res.data?.success) {
        setSuccessMsg('Election created successfully on the national register.');
        setShowCreateModal(false);
        setElectionForm({ title: '', description: '', category: 'Parliamentary (Lok Sabha)', bannerUrl: '', startDate: '', endDate: '' });
        fetchElections();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create election.');
    }
  };

  const handleUpdateElection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/elections/${editingElection.id}`, electionForm);
      if (res.data?.success) {
        setSuccessMsg('Election updated successfully.');
        setEditingElection(null);
        fetchElections();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update election.');
    }
  };

  const handleDeleteElection = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this constituency election? All associated votes and candidate records will be purged.')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/elections/${id}`);
      if (res.data?.success) {
        setSuccessMsg('Election deleted successfully.');
        fetchElections();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete election.');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/admin/elections/${managingElection.id}/candidates`, candidateForm);
      if (res.data?.success) {
        setSuccessMsg('Candidate nominated successfully.');
        setCandidateForm({ fullName: '', partyName: '', partySymbol: '🪷', photoUrl: '', manifesto: '' });
        // Refresh local managingElection candidates
        const updated = await api.get(`/elections/${managingElection.id}`);
        if (updated.data?.success) {
          setManagingElection(updated.data.data);
        }
        fetchElections();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add candidate.');
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Remove this candidate from the election ballot?')) return;
    try {
      const res = await api.delete(`/admin/elections/${managingElection.id}/candidates/${candidateId}`);
      if (res.data?.success) {
        setSuccessMsg('Candidate removed.');
        const updated = await api.get(`/elections/${managingElection.id}`);
        if (updated.data?.success) {
          setManagingElection(updated.data.data);
        }
        fetchElections();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove candidate.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
            Constituency Ballots
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Elections & Ballot Management</h1>
        </div>

        <button
          onClick={() => {
            setEditingElection(null);
            setElectionForm({
              title: '',
              description: '',
              category: 'Parliamentary (Lok Sabha)',
              bannerUrl: '',
              startDate: '',
              endDate: '',
            });
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:opacity-95 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Ballot</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-6 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center space-x-2 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center space-x-2 text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Elections Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
            <span className="text-xs">Fetching electoral registry...</span>
          </div>
        ) : elections.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No elections configured yet. Click "Create New Ballot" to initialize one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Title & Constituency</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Poll Dates</th>
                  <th className="pb-3 font-semibold">Candidates</th>
                  <th className="pb-3 font-semibold">Votes</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {elections.map((el) => (
                  <tr key={el.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-white text-sm">{el.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{el.description}</div>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                        {el.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        el.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : el.status === 'UPCOMING'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {el.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 font-mono text-[11px]">
                      <div>From: {new Date(el.startDate).toLocaleDateString()}</div>
                      <div>To: {new Date(el.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => setManagingElection(el)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-[11px] border border-slate-700 flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{el.candidates?.length || 0} Candidates</span>
                      </button>
                    </td>
                    <td className="py-4 text-amber-400 font-mono font-bold">{el.totalVotes || 0}</td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingElection(el);
                          setElectionForm({
                            title: el.title,
                            description: el.description,
                            category: el.category,
                            bannerUrl: el.bannerUrl || '',
                            startDate: el.startDate ? el.startDate.slice(0, 16) : '',
                            endDate: el.endDate ? el.endDate.slice(0, 16) : '',
                          });
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400"
                        title="Edit Election"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteElection(el.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/50"
                        title="Delete Election"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ELECTION MODAL */}
      {(showCreateModal || editingElection) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingElection(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingElection ? 'Modify Constituency Ballot' : 'Create New Constituency Ballot'}
            </h3>

            <form onSubmit={editingElection ? handleUpdateElection : handleCreateElection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Election Title & Constituency</label>
                <input
                  type="text"
                  value={electionForm.title}
                  onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                  placeholder="e.g. 18th Lok Sabha General Elections 2026 - New Delhi"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Electoral Category</label>
                <select
                  value={electionForm.category}
                  onChange={(e) => setElectionForm({ ...electionForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Parliamentary (Lok Sabha)">Parliamentary (Lok Sabha)</option>
                  <option value="State Assembly (Vidhan Sabha)">State Assembly (Vidhan Sabha)</option>
                  <option value="Municipal Corporation (Nagar Nigam)">Municipal Corporation (Nagar Nigam)</option>
                  <option value="Council of States (Rajya Sabha)">Council of States (Rajya Sabha)</option>
                  <option value="Panchayati Raj Council">Panchayati Raj Council</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Constitutional Scope</label>
                <textarea
                  rows={3}
                  value={electionForm.description}
                  onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                  placeholder="Explain the constituency scope and Article 324 secret voting terms."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={electionForm.startDate}
                    onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={electionForm.endDate}
                    onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition cursor-pointer"
              >
                {editingElection ? 'Save Ballot Modifications' : 'Initialize & Publish Constituency Ballot'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE CANDIDATES MODAL */}
      {managingElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setManagingElection(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              Certified Candidates: {managingElection.title}
            </h3>
            <p className="text-xs text-slate-400 mb-6">Nominate or remove certified candidates contesting this ballot.</p>

            {/* Existing Candidates List */}
            <div className="space-y-3 mb-8">
              {managingElection.candidates?.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-amber-500/30 shrink-0">
                      <img
                        src={cand.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                        alt={cand.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{cand.fullName}</span>
                        <span className="text-base">{cand.partySymbol}</span>
                      </div>
                      <span className="text-[11px] text-amber-400">{cand.partyName}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCandidate(cand.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/50"
                    title="Remove Candidate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Candidate Form */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 mb-3 uppercase tracking-wider">Nominate New Candidate</h4>
              <form onSubmit={handleAddCandidate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Candidate Full Name (e.g. Rajeshwar Nath Sharma)"
                    value={candidateForm.fullName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Political Party Name (e.g. BJP, INC, AAP)"
                    value={candidateForm.partyName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, partyName: e.target.value })}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Party Symbol (Emoji: 🪷, ✋, 🧹, 🐘, 🚜, ☀️, 🪁)"
                    value={candidateForm.partySymbol}
                    onChange={(e) => setCandidateForm({ ...candidateForm, partySymbol: e.target.value })}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Photo Image URL"
                    value={candidateForm.photoUrl}
                    onChange={(e) => setCandidateForm({ ...candidateForm, photoUrl: e.target.value })}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Official Policy Manifesto & Commitments to Constituents"
                  value={candidateForm.manifesto}
                  onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-bold text-xs shadow hover:opacity-95 transition cursor-pointer"
                >
                  Certify & Add Candidate to Ballot
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
