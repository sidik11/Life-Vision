import React, { useState } from 'react';
import ActionPopover from '../components/Common/ActionPopover';
import { Trash2, Mail, Phone, User, MessageSquare, Eye, X, Send } from 'lucide-react';
import { db, doc, updateDoc, deleteDoc } from '../../firebase';

export default function NotificationsView({ contacts = [], setContacts, showToast, onShowToast }) {
  const notify = showToast || onShowToast || (() => {});
  const [viewingContact, setViewingContact] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  const INQUIRY_STATUSES = ['New', 'Read', 'In Progress', 'Responded', 'Closed'];

  const handleStatusChange = async (contactItem, newStatus) => {
    const updated = { ...contactItem, status: newStatus };
    if (setContacts) {
      setContacts(prev => prev.map(c => (c.id === contactItem.id || (c.firestoreId && c.firestoreId === contactItem.firestoreId)) ? updated : c));
    }
    const docId = contactItem.firestoreId || contactItem.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "contacts", docId), { status: newStatus, updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore contact status notice:", e);
      }
    }
    if (viewingContact && (viewingContact.id === contactItem.id || viewingContact.firestoreId === contactItem.firestoreId)) {
      setViewingContact(updated);
    }
    notify(`Updated inquiry status to "${newStatus}"!`, 'success');
  };

  const handleSaveRemark = async (contactItem) => {
    if (!remarkText.trim()) return;
    const currentRemarks = Array.isArray(contactItem.remarks) ? contactItem.remarks : (contactItem.remarks ? [contactItem.remarks] : []);
    const updatedRemarks = [{ text: remarkText, date: new Date().toLocaleDateString('en-GB') }, ...currentRemarks];
    const updated = { ...contactItem, remarks: updatedRemarks };

    if (setContacts) {
      setContacts(prev => prev.map(c => (c.id === contactItem.id || (c.firestoreId && c.firestoreId === contactItem.firestoreId)) ? updated : c));
    }
    const docId = contactItem.firestoreId || contactItem.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "contacts", docId), { remarks: updatedRemarks, updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore contact remark notice:", e);
      }
    }
    setViewingContact(updated);
    setRemarkText('');
    notify('✓ Remark added to contact inquiry!', 'success');
  };

  const handleDeleteContact = async (contactId, name, docId) => {
    if (window.confirm(`Are you sure you want to delete inquiry from "${name}"?`)) {
      const targetDocId = docId || contactId;
      if (targetDocId) {
        try {
          await deleteDoc(doc(db, "contacts", targetDocId));
        } catch (e) {
          console.warn("Firestore contact delete notice:", e);
        }
      }
      if (setContacts) {
        setContacts(prev => prev.filter(c => c.id !== contactId && (!docId || c.firestoreId !== docId)));
      }
      notify(`Deleted contact inquiry from ${name}.`, 'info');
    }
  };

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Read': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'In Progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Responded': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Closed': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Contact Form Inquiries</h1>
          <p className="text-xs text-slate-500">Live website contact form inquiries and messaging</p>
        </div>
      </div>

      {/* Real Live Contact Submissions Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#16A34A]" />
          <span>Website Contact Form Inquiries ({contacts.length})</span>
        </h2>

        {contacts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No Contact Inquiries Yet</p>
            <p className="text-slate-400">Inquiries submitted via the website Contact page will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => {
              const currentStatus = c.status || 'New';
              return (
                <div key={c.id || c.firestoreId} className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                        <span className="text-[10px] text-slate-500 font-medium">{c.date || c.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(c, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${getStatusBadgeClass(currentStatus)}`}
                      >
                        {INQUIRY_STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>

                      {/* 3-dot Action Menu */}
                      <ActionPopover
                        items={[
                          { label: 'View Inquiry Details', icon: Eye, onClick: () => setViewingContact(c) },
                          { divider: true },
                          { label: 'Delete Inquiry', icon: Trash2, danger: true, onClick: () => handleDeleteContact(c.id, c.name, c.firestoreId) }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.email}</span>
                    </p>
                    {c.phone && (
                      <p className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-800">Subject: {c.subject || 'General Inquiry'}</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed truncate">"{c.message}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW CONTACT INQUIRY DETAILS MODAL */}
      {viewingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">{viewingContact.name}</h3>
                <p className="text-xs text-slate-500">Submitted on {viewingContact.date || viewingContact.createdAt}</p>
              </div>
              <button onClick={() => setViewingContact(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Inquiry Status:</span>
                <select
                  value={viewingContact.status || 'New'}
                  onChange={(e) => handleStatusChange(viewingContact, e.target.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${getStatusBadgeClass(viewingContact.status || 'New')}`}
                >
                  {INQUIRY_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <a href={`mailto:${viewingContact.email}`} className="font-bold text-blue-600 hover:underline">{viewingContact.email}</a>
              </div>
              {viewingContact.phone && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <a href={`tel:${viewingContact.phone}`} className="font-bold text-emerald-700 hover:underline">{viewingContact.phone}</a>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Subject:</span>
                <span className="font-bold text-slate-900">{viewingContact.subject || 'General Inquiry'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Full Message:</span>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium leading-relaxed">
                  "{viewingContact.message}"
                </div>
              </div>

              {/* Admin Remark Input */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block">Add Admin Remark / Response Note:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter remark note..."
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveRemark(viewingContact)}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
                {viewingContact.remarks && Array.isArray(viewingContact.remarks) && viewingContact.remarks.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {viewingContact.remarks.map((r, rIdx) => (
                      <div key={rIdx} className="p-2 bg-emerald-50 text-emerald-900 rounded-lg text-2xs font-medium flex justify-between">
                        <span>• {r.text || r}</span>
                        <span className="font-mono text-slate-400">{r.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleDeleteContact(viewingContact.id, viewingContact.name, viewingContact.firestoreId);
                  setViewingContact(null);
                }}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Delete Inquiry
              </button>
              <button
                onClick={() => setViewingContact(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


