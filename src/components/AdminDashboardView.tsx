import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Loader2, Sparkles, UserX, Trash2, Eye, Ban, AlertOctagon, 
  RefreshCw, TrendingUp, DollarSign, Tv, Users, AlertCircle, CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend 
} from 'recharts';
import { User, ModerationReport, AnalyticMetric } from '../types';

export default function AdminDashboardView() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticMetric[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Focus and Audit states
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null);
  const [aiAuditing, setAiAuditing] = useState<Record<string, boolean>>({});
  const [actioningReport, setActioningReport] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch reports
      const resR = await fetch('/api/admin/reports');
      if (resR.ok) {
        const dataR = await resR.ok ? await resR.json() : [];
        setReports(dataR);
      }

      // 2. Fetch analytics history
      const resA = await fetch('/api/admin/analytics');
      if (resA.ok) {
        const dataA = await resA.json();
        setAnalytics(dataA);
      }

      // 3. Fetch users list
      const resU = await fetch('/api/admin/users');
      if (resU.ok) {
        const dataU = await resU.json();
        setUsers(dataU);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAiAudit = async (reportId: string) => {
    setAiAuditing(prev => ({ ...prev, [reportId]: true }));
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/ai-check`, {
        method: 'POST'
      });
      if (res.ok) {
        const updatedReport = await res.json();
        setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAuditing(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleResolveAction = async (reportId: string, actionOutcome: 'dismiss' | 'warn' | 'ban') => {
    setActioningReport(prev => ({ ...prev, [reportId]: true }));
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: actionOutcome })
      });
      if (res.ok) {
        // Refresh full scope to see updated ban states
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningReport(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleToggleUserBan = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100">
        <Loader2 className="animate-spin text-blue-600 dark:text-cyan-400" size={32} />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">Loading Admin Control Nodes...</p>
      </div>
    );
  }

  // Get key indicators from modern arrays
  const lastMetrics = analytics[analytics.length - 1] || { users: 0, revenue: 0, activeStreams: 0 };
  const firstMetrics = analytics[0] || { users: 0 };
  const usersGrowthString = `+${Math.round((lastMetrics.users - firstMetrics.users) / firstMetrics.users * 100)}%`;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 max-w-6xl mx-auto h-[calc(100vh-7rem)] overflow-y-auto pr-1 animate-fade-in">
      
      {/* HEADER HUD BAR */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-600 dark:text-cyan-400 shrink-0" size={24} />
          <div>
            <h2 className="font-bold text-xs uppercase tracking-widest text-blue-600 dark:text-cyan-400 font-mono">Sphere Moderator Dashboard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Integrated telemetry chart overlays & AI safety filters</p>
          </div>
        </div>

        <button 
          onClick={fetchDashboardData}
          className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
          title="Sync cluster stats"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* INDICATORS ROW TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Total Spheres</span>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-slate-100">{lastMetrics.users}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{usersGrowthString}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Accumulated Income</span>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-slate-100">${lastMetrics.revenue}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+18%</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Active Streams</span>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-slate-100">{lastMetrics.activeStreams}</p>
            <span className="text-[10px] text-blue-600 dark:text-indigo-400 font-bold">Max priority</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Violations pending</span>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-500">{reports.filter(r => r.status === 'pending').length}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Secured</span>
          </div>
        </div>

      </div>

      {/* RECHARTS PLOTS BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User expansion area plot */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-3">
          <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">User Expansion Trend</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'currentColor', color: 'var(--color-slate-900)', borderColor: 'transparent', borderRadius: '8px', fontSize: 12 }} />
                <Area type="monotone" dataKey="users" name="Active Spheres" stroke="#3b82f6" fillOpacity={1} fill="url(#userGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform dynamic income graph */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-3">
          <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Virtual Gift Cash Flows</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'currentColor', color: 'var(--color-slate-900)', borderColor: 'transparent', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="revenue" name="Donations ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* MODERATION REPORTS & Violations LISTING */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350">Violation tickets & AI evaluation</h3>
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">Real-time reports</span>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-6">All clear! No violation complaints outstanding.</p>
        ) : (
          <div className="space-y-4">
            {reports.map(rep => {
              const isAuditLoading = aiAuditing[rep.id];
              const isActionLoading = actioningReport[rep.id];
              const isFocused = focusedReportId === rep.id;

              return (
                <div 
                  key={rep.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    rep.status === 'pending' 
                      ? (isFocused ? 'bg-slate-50 dark:bg-slate-950 border-blue-500/50 dark:border-cyan-500/50' : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850') 
                      : 'bg-slate-100/50 dark:bg-white/[0.01] border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-900 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">Ticket ID: {rep.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold border ${
                        rep.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setFocusedReportId(isFocused ? null : rep.id)}
                        className="text-[10px] px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded transition-colors cursor-pointer"
                      >
                        {isFocused ? 'Collapse' : 'Inspect text'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    {/* Snippet details */}
                    <div className="md:col-span-2 space-y-1.5">
                      <p className="text-blue-650 dark:text-indigo-405 text-blue-600 dark:text-indigo-400 font-semibold">Reported item: "{rep.contentSnippet}"</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">Complaint Reason: <span className="text-slate-700 dark:text-slate-200">{rep.reason}</span></p>
                      
                      {isFocused && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 mt-2 space-y-1 font-mono text-[10px] text-slate-500">
                          <p>&bull; Content format: {rep.contentType}</p>
                          <p>&bull; Submitted by peer: @{rep.reporterName}</p>
                          <p>&bull; Filed: {new Date(rep.createdAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* AI Assessment actions */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold">
                        <Sparkles size={12} className="shrink-0 animate-spin text-blue-600 dark:text-cyan-400" style={{ animationDuration: '6s' }} />
                        <span className="font-extrabold text-[10px] uppercase tracking-wider font-mono">Gemini policy scan</span>
                      </div>

                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono italic select-text whitespace-pre-wrap">{rep.aiAssessment}</p>

                      {rep.status === 'pending' && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          
                          {/* Run AI auditor check */}
                          <button
                            onClick={() => handleTriggerAiAudit(rep.id)}
                            disabled={isAuditLoading}
                            className="text-[9px] px-2 py-1 bg-blue-50 dark:bg-cyan-600/10 text-blue-600 dark:text-cyan-455 hover:bg-blue-105 dark:hover:bg-cyan-600/20 rounded font-bold border border-blue-100 dark:border-cyan-500/20 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                          >
                            {isAuditLoading && <Loader2 size={8} className="animate-spin" />}
                            Run AI Policy scan
                          </button>

                          <button
                            onClick={() => handleResolveAction(rep.id, 'dismiss')}
                            disabled={isActionLoading}
                            className="text-[9px] px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold disabled:opacity-50 cursor-pointer"
                          >
                            Dismiss
                          </button>

                          <button
                            onClick={() => handleResolveAction(rep.id, 'warn')}
                            disabled={isActionLoading}
                            className="text-[9px] px-2 py-1 bg-amber-50 dark:bg-yellow-600/20 text-amber-600 dark:text-yellow-500 hover:bg-amber-100 dark:hover:bg-yellow-600/30 rounded font-semibold border border-amber-100 dark:border-yellow-600/10 disabled:opacity-50 cursor-pointer"
                          >
                            Warn author
                          </button>

                          <button
                            onClick={() => handleResolveAction(rep.id, 'ban')}
                            disabled={isActionLoading}
                            className="text-[9px] px-2 py-1 bg-rose-50 dark:bg-red-600/20 text-rose-600 dark:text-red-400 hover:bg-rose-100 dark:hover:bg-red-600/30 rounded font-semibold border border-rose-100 dark:border-red-605/10 disabled:opacity-50 cursor-pointer"
                          >
                            Suspend author
                          </button>

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* USER LIST & QUICK SUSPEND LOG */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 font-mono">Platform Users Account Logs</h3>
        
        <div className="overflow-x-auto text-slate-800 dark:text-slate-200">
          <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                <th className="py-2.5 px-2">Spherer Handle</th>
                <th className="py-2.5 px-2">Role</th>
                <th className="py-2.5 px-2">Warnings</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 text-right">Moderator Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="py-3 px-2 flex items-center gap-2">
                    <img src={u.profilePicture} className="w-5.5 h-5.5 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{u.displayName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">@{u.username}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2 capitalize font-mono text-slate-500 dark:text-slate-400">{u.role}</td>
                  <td className="py-3 px-2 text-rose-600 dark:text-rose-500 font-mono font-bold">{u.warningCount} tickets</td>
                  <td className="py-3 px-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                      u.isBanned 
                        ? 'bg-rose-50 dark:bg-red-500/10 text-rose-650 dark:text-red-400 border-rose-100 dark:border-red-500/10' 
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10'
                    }`}>
                      {u.isBanned ? 'Suspended' : 'Pristine Active'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleToggleUserBan(u.id)}
                      disabled={u.role === 'admin'}
                      className={`text-[10px] px-2 py-1 rounded font-bold transition-all disabled:opacity-30 border cursor-pointer ${
                        u.isBanned 
                          ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 dark:hover:bg-emerald-600/30 border-emerald-100 dark:border-emerald-500/10' 
                          : 'bg-rose-50 hover:bg-rose-100 dark:bg-red-600/20 text-rose-600 dark:text-red-400 dark:hover:bg-red-600/30 border-rose-100 dark:border-red-500/10'
                      }`}
                    >
                      {u.isBanned ? 'Reinstate' : 'Ban account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
