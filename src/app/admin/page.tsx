"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage platform operations and moderation.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'overview' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Overview
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          User Management
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'reports' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Reports & Moderation
          {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: '1,248', icon: 'group', color: 'bg-blue-500/10 text-blue-500' },
            { label: 'Active Artworks', value: '8,432', icon: 'palette', color: 'bg-indigo-500/10 text-indigo-500' },
            { label: 'Total Commissions', value: '$12,450', icon: 'payments', color: 'bg-emerald-500/10 text-emerald-500' },
            { label: 'Pending Reports', value: '14', icon: 'flag', color: 'bg-rose-500/10 text-rose-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Users</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/5">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(i => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">U{i}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">User Name {i}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">user{i}@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">Creator</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-bold">Active</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-rose-500 hover:text-rose-600 text-sm font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">block</span> Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Tab Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] uppercase tracking-wider font-bold rounded">NSFW Content</span>
                  <span className="text-xs text-slate-500">Reported 2 hours ago</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Inappropriate Artwork Upload</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">User 'Anonymous' reported artwork #8842 for violating community guidelines.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Review</button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all">Remove Content</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
