import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, RefreshCw, AlertTriangle, CheckCircle2, Lock, Smartphone } from 'lucide-react';
import api from '../services/api';

export default function AdminAuditLogsPage() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'login'
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginHistories, setLoginHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [auditRes, loginRes] = await Promise.all([
        api.get('/admin/audit-logs'),
        api.get('/admin/login-histories'),
      ]);

      if (auditRes.data?.success) setAuditLogs(auditRes.data.data);
      if (loginRes.data?.success) setLoginHistories(loginRes.data.data);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/admin/export/audit-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartVote_Audit_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export CSV: ' + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
            Cryptographic Integrity Audit
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Security & Access Telemetry</h1>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold shadow-neon-cyan flex items-center space-x-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Report (CSV)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'audit'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Action Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'login'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Authentication & Device Log ({loginHistories.length})
        </button>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <span className="text-xs">Reading immutable security journal...</span>
        </div>
      ) : activeTab === 'audit' ? (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Actor / Email</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Target Entity</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 text-cyan-300 font-bold">{log.actorEmail}</td>
                  <td className="py-3 text-slate-400">{log.actorRole}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-purple-300">{log.entityType} ({log.entityId})</td>
                  <td className="py-3 text-slate-500">{log.ipAddress}</td>
                  <td className="py-3 text-slate-300 font-sans max-w-sm truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Account Email</th>
                <th className="pb-3 font-semibold">Authentication Status</th>
                <th className="pb-3 font-semibold">Failure / Security Reason</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Browser / Fingerprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loginHistories.map((hist) => (
                <tr key={hist.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 text-slate-400">{new Date(hist.timestamp).toLocaleString()}</td>
                  <td className="py-3 text-white font-bold">{hist.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hist.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : hist.status === 'FAILED_FACE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                        : hist.status === 'LOCKED'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    }`}>
                      {hist.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-sans">{hist.failureReason || 'Authorized'}</td>
                  <td className="py-3 text-slate-500">{hist.ipAddress}</td>
                  <td className="py-3 text-slate-400 text-[10px] max-w-xs truncate">{hist.userAgent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
