import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Database, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export default function UsersTab({ currentUserId, onSwitchUser, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Unable to load students from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSelect = (user) => {
    onSwitchUser(user.id);
    setMessage(`Switched active student to ${user.name} (ID: ${user.id}). Progress and scores are now tracked for ${user.name}.`);
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setCreating(true);
    setMessage('');
    setError('');
    try {
      const res = await api.createUser(name.trim(), email.trim());
      setMessage(`Student "${res.name}" registered successfully! Switched active profile to ${res.name}.`);
      setName('');
      setEmail('');
      onSwitchUser(res.id);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to create student profile');
    } finally {
      setCreating(false);
    }
  };

  const activeUser = users.find(u => u.id === currentUserId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Database className="w-4 h-4" />
          Live Student Profiles & Accounts
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Student Profiles & Accounts
        </h2>
        <p className="text-sm text-slate-500">
          Switch active student profile to test individual progress tracking, attempts, and personalized recommendations.
        </p>

        {/* Currently Active Student Banner */}
        {activeUser && (
          <div className="mt-2 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  Currently Active: <span className="text-indigo-700">{activeUser.name}</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-mono">
                    ID #{activeUser.id}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono">{activeUser.email}</p>
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('Dashboard')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                View Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{message}</span>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('Dashboard')}
              className="text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1 cursor-pointer"
            >
              Go to Dashboard →
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadUsers}
            className="text-rose-700 font-bold hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid: Create User + User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Register New Student Profile
          </h3>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {creating ? 'Registering in Database...' : 'Register Student'}
            </button>
          </form>
        </div>

        {/* Existing Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Connected Students ({users.length})
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Database Ready
            </span>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {loading ? (
              <p className="text-xs text-slate-400 p-4">Loading student records...</p>
            ) : users.length === 0 ? (
              <p className="text-xs text-slate-400 p-4">No students found.</p>
            ) : users.map((u) => {
              const isActive = u.id === currentUserId;
              return (
                <div
                  key={u.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isActive 
                      ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-semibold shadow-xs' 
                      : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold flex items-center gap-1.5 truncate">
                      {u.name}
                      {isActive && (
                        <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono font-semibold">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{u.email}</p>
                  </div>

                  <button
                    onClick={() => handleSelect(u)}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs cursor-default'
                        : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isActive ? (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Current
                      </span>
                    ) : (
                      'Select'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
