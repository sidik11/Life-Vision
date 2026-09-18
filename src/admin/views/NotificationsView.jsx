import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Trash2, Filter, Mail, Phone, User, MessageSquare, Shield, Activity } from 'lucide-react';

export default function NotificationsView({ contacts = [], showToast, onShowToast, activeSubTab }) {
  const notify = showToast || onShowToast || (() => {});
  const [filter, setFilter] = useState(() => {
    if (activeSubTab === 'logs') return 'System';
    return 'All';
  });

  const [systemNotifications, setSystemNotifications] = useState([
    { id: 'SYS-1', title: 'New Training Application Received', desc: 'Sunita Sahu submitted application for Tailoring & Stitching (Bhubaneswar Center)', time: '10 mins ago', category: 'Application', unread: true },
    { id: 'SYS-2', title: 'CSR Grant Sanctioned', desc: 'HDFC Parivartan Foundation approved ₹45 Lakhs grant for women empowerment', time: '2 hours ago', category: 'Donation', unread: true },
    { id: 'SYS-3', title: 'Batch Completed & Certified', desc: 'BATCH-2026-T1 completed graduation with 96% pass rate', time: 'Yesterday', category: 'Training', unread: false },
    { id: 'SYS-4', title: 'Super Admin Login Alert', desc: 'Successful login from Bhubaneswar IP 192.168.1.8', time: 'Today, 10:15 AM', category: 'Security', unread: false }
  ]);

  const handleMarkAllRead = () => {
    setSystemNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    notify('All notifications marked as read!', 'info');
  };

  const handleClearAll = () => {
    setSystemNotifications([]);
    notify('System notifications cleared!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Notifications & Activity Logs</h1>
          <p className="text-xs text-slate-500">Live operational alerts, contact form inquiries & system security logs</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilter('All')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({systemNotifications.length + contacts.length})
            </button>
            <button
              onClick={() => setFilter('Contacts')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === 'Contacts' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contact Messages ({contacts.length})
            </button>
            <button
              onClick={() => setFilter('System')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === 'System' ? 'bg-[#123B5D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System Activity Logs ({systemNotifications.length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Real Live Contact Submissions Section */}
      {(filter === 'All' || filter === 'Contacts') && contacts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#16A34A]" />
            <span>Website Contact Form Inquiries ({contacts.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <span className="text-[10px] text-slate-500 font-medium">{c.date}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    New Message
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Subject: {c.subject}</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">"{c.message}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Notifications & Activity Logs */}
      {(filter === 'All' || filter === 'System') && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#123B5D]" />
            <span>System Audit & Activity Logs ({systemNotifications.length})</span>
          </h2>

          <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {systemNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No activity logs.
              </div>
            ) : (
              systemNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors ${
                    n.unread ? 'bg-emerald-50/40 border-l-4 border-[#16A34A]' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      n.unread ? 'bg-emerald-100 text-[#16A34A]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{n.title}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-800 border border-slate-200">
                          {n.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">{n.time}</span>
                    </div>
                  </div>

                  {n.unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
