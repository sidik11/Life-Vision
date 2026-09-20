import React, { useState } from 'react';
import { 
  FileText, Upload, Plus, Search, Filter, Shield, 
  Eye, Download, Trash2, Calendar, User, X, CheckCircle2 
} from 'lucide-react';
import { db, collection, addDoc, deleteDoc, doc, serverTimestamp, storage, ref, uploadString, getDownloadURL } from '../../../firebase';

export default function StaffDocumentModule({ 
  staffList = [], 
  staffDocuments = [], 
  setStaffDocuments, 
  showToast 
}) {
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    staffId: staffList[0]?.id || staffList[0]?.employeeId || '',
    documentType: 'Aadhaar / ID Proof',
    documentName: '',
    expiryDate: '',
    fileContent: '',
    fileName: ''
  });

  const docTypes = [
    'Aadhaar / ID Proof',
    'PAN Card',
    'Educational Certificate',
    'Experience Certificate',
    'Joining Letter',
    'Appointment Letter',
    'Bank Document',
    'Address Proof',
    'Other Documents'
  ];

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        if (showToast) showToast('File size exceeds 10MB limit.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          fileContent: reader.result,
          fileName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Document
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const staffMember = staffList.find(s => (s.id || s.employeeId) === formData.staffId) || staffList[0];

    if (!staffMember || !formData.documentName.trim() || !formData.fileContent) {
      if (showToast) showToast('Please select staff member, enter document title, and upload file.', 'error');
      return;
    }

    setLoading(true);
    let finalFileUrl = formData.fileContent;

    // Optional: Upload to Firebase Storage if online
    try {
      if (formData.fileContent.startsWith('data:')) {
        const storageRef = ref(storage, `staff_documents/${staffMember.id}_${Date.now()}_${formData.fileName}`);
        await uploadString(storageRef, formData.fileContent, 'data_url');
        finalFileUrl = await getDownloadURL(storageRef);
      }
    } catch (storageErr) {
      console.warn("Firebase Storage upload notice (using DataURL fallback):", storageErr);
    }

    const newDoc = {
      staffId: staffMember.id || staffMember.employeeId,
      staffName: staffMember.name,
      department: staffMember.department,
      documentType: formData.documentType,
      documentName: formData.documentName.trim(),
      fileUrl: finalFileUrl,
      fileName: formData.fileName || 'document',
      expiryDate: formData.expiryDate || 'N/A',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Admin',
      status: 'Verified',
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, "staffDocuments"), {
        ...newDoc,
        createdAt: serverTimestamp()
      });
      newDoc.firestoreId = docRef.id;

      if (setStaffDocuments) {
        setStaffDocuments(prev => [newDoc, ...prev]);
      }

      setLoading(false);
      setShowUploadModal(false);
      setFormData({
        staffId: staffList[0]?.id || '',
        documentType: 'Aadhaar / ID Proof',
        documentName: '',
        expiryDate: '',
        fileContent: '',
        fileName: ''
      });

      if (showToast) showToast(`Document "${newDoc.documentName}" uploaded for ${staffMember.name}!`, 'success');

    } catch (err) {
      console.warn("Firestore upload doc notice:", err);
      setLoading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docItem) => {
    if (!window.confirm(`Are you sure you want to delete document "${docItem.documentName}"?`)) return;

    if (setStaffDocuments) {
      setStaffDocuments(prev => prev.filter(d => (d.id && d.id !== docItem.id) || (d.firestoreId && d.firestoreId !== docItem.firestoreId)));
    }

    if (docItem.firestoreId) {
      try {
        await deleteDoc(doc(db, "staffDocuments", docItem.firestoreId));
      } catch (err) {
        console.warn("Firestore delete doc notice:", err);
      }
    }

    if (showToast) showToast(`Document "${docItem.documentName}" deleted.`, 'info');
  };

  // Combine Aadhaar docs from staffList + uploaded staffDocuments
  const allStaffDocs = [
    ...staffDocuments,
    ...staffList.filter(s => s.aadharDoc).map(s => ({
      firestoreId: `aadhar_${s.id}`,
      staffId: s.id || s.employeeId,
      staffName: s.name,
      department: s.department,
      documentType: 'Aadhaar / ID Proof',
      documentName: `Aadhaar Card - ${s.name}`,
      fileUrl: s.aadharDoc,
      fileName: 'aadhaar_card.jpg',
      expiryDate: 'N/A',
      uploadDate: s.joinDate || '2026-01-01',
      uploadedBy: 'Staff',
      status: 'Verified'
    }))
  ];

  // Filter documents
  const filteredDocs = allStaffDocs.filter(d => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (d.documentName || '').toLowerCase().includes(term);
    const staffMatch = (d.staffName || '').toLowerCase().includes(term);
    const typeMatch = (d.documentType || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || staffMatch || typeMatch;

    const matchesStaff = selectedStaffFilter === 'All' || d.staffId === selectedStaffFilter;
    const matchesType = selectedTypeFilter === 'All' || d.documentType === selectedTypeFilter;

    return matchesSearch && matchesStaff && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Staff Document Repository</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif">Staff Documents & Verification Files</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Aadhaar cards, PAN, educational certificates, appointment letters, and bank documents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>+ Upload Staff Document</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search document name, staff name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Staff Members ({staffList.length})</option>
            {staffList.map(s => (
              <option key={s.id || s.employeeId} value={s.id || s.employeeId}>
                {s.name} ({s.id || s.employeeId})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Document Types</option>
            {docTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Document Name</th>
                <th className="p-3.5">Document Type</th>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Upload Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Uploaded By</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 font-serif">No Staff Documents Found</p>
                    <p className="text-2xs text-slate-500 mt-1">Upload staff documents using the button above.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((docItem, idx) => (
                  <tr key={docItem.firestoreId || idx} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Document Name */}
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{docItem.documentName}</span>
                      </div>
                    </td>

                    {/* Document Type */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-2xs font-bold">
                        {docItem.documentType}
                      </span>
                    </td>

                    {/* Staff Member */}
                    <td className="p-3.5">
                      <div>
                        <span className="font-bold text-slate-900 block">{docItem.staffName}</span>
                        <span className="text-[10px] font-mono text-emerald-700">ID: {docItem.staffId}</span>
                      </div>
                    </td>

                    {/* Upload Date */}
                    <td className="p-3.5 font-mono text-slate-600">
                      {docItem.uploadDate}
                    </td>

                    {/* Expiry Date */}
                    <td className="p-3.5 text-slate-600 font-medium">
                      {docItem.expiryDate}
                    </td>

                    {/* Uploaded By */}
                    <td className="p-3.5 text-slate-600">
                      {docItem.uploadedBy || 'Admin'}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocPreview(docItem)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200"
                          title="View Document"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </button>

                        <a
                          href={docItem.fileUrl}
                          download={docItem.fileName || 'document'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#047857] rounded-lg text-xs font-bold transition-all cursor-pointer border border-emerald-200"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5 text-[#047857]" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(docItem)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Upload Staff Document</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              
              {/* Select Staff */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Select Staff Member *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                >
                  {staffList.map(s => (
                    <option key={s.id || s.employeeId} value={s.id || s.employeeId}>
                      {s.name} ({s.id || s.employeeId}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                >
                  {docTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Document Name / Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Document Name / Title *</label>
                <input
                  type="text"
                  required
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  placeholder="e.g. Aadhaar Card Front & Back / Degree Certificate"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Expiry Date (If Applicable)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Upload File (Image / PDF) *</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded-xl text-2xs cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Upload & Save Document</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">{selectedDocPreview.documentName}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedDocPreview.staffName} ({selectedDocPreview.staffId}) • {selectedDocPreview.documentType}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center min-h-[300px] flex items-center justify-center">
              {selectedDocPreview.fileUrl && selectedDocPreview.fileUrl.startsWith('data:image') ? (
                <img src={selectedDocPreview.fileUrl} alt={selectedDocPreview.documentName} className="max-h-[70vh] rounded-xl object-contain mx-auto border border-slate-200" />
              ) : (
                <div className="space-y-3">
                  <FileText className="w-16 h-16 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">{selectedDocPreview.fileName || 'Attachment Document'}</p>
                  <a
                    href={selectedDocPreview.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#047857] text-white font-bold text-xs rounded-xl inline-block shadow-sm"
                  >
                    Open / Download Document File
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
