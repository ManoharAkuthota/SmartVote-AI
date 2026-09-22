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
      link.setAttribute('download', `ECI_SmartVote_Audit_Report_${Date.now()}.csv`);
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
            Cryptographic Integrity Audit (Article 324)
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Electoral Security & Access Telemetry</h1>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold shadow-md flex items-center space-x-2 transition cursor-pointer"
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
              ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          System Action Ledger ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'login'
              ? 'bg-purple-500/20 border border-purple-400 text-purple-300'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Facial Security & OTP Access History ({loginHistories.length})
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
          <span className="text-xs">Querying cryptographic telemetry...</span>
        </div>
      ) : activeTab === 'audit' ? (
        /* SYSTEM AUDIT LOGS TABLE */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp (IST)</th>
                <th className="pb-3 font-semibold">Actor / Officer</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Entity Type</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No system audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-400">
                      {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </td>
                    <td className="py-3 text-amber-400 font-semibold">{log.actorEmail}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{log.entityType} ({log.entityId})</td>
                    <td className="py-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 text-slate-400 max-w-sm truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* LOGIN HISTORIES TABLE */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp (IST)</th>
                <th className="pb-3 font-semibold">Voter / Admin</th>
                <th className="pb-3 font-semibold">Verification Result</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Device / Client Agent</th>
                <th className="pb-3 font-semibold">Security Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loginHistories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No access history records found.
                  </td>
                </tr>
              ) : (
                loginHistories.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-400">
                      {new Date(h.attemptTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </td>
                    <td className="py-3 text-amber-400 font-semibold">{h.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{h.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{h.deviceFingerprint || h.userAgent}</td>
                    <td className="py-3 text-slate-400">{h.failureReason || 'ECI MFA Authenticated'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
