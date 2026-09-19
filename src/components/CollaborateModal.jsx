import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, Handshake, User, Phone, Mail, MapPin, Building, Target } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

export default function CollaborateModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '',
    contactPerson: '',
    email: '',
    phone: '',
    orgType: 'Non-Profit / NGO',
    collabArea: 'Skill Training & Workshops',
    location: '',
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newCollab = {
      id: `PRT-OD-${Math.floor(10 + Math.random() * 90)}`,
      orgName: formData.orgName || 'Collaborating Organization',
      contactPerson: formData.contactPerson || 'Collab Lead',
      email: formData.email || 'collab@org.com',
      phone: formData.phone || '+91 98000 00000',
      partnerType: formData.collabType || 'Institutional Partner',
      logo: '/company/Privir Healthcare.jpg',
      location: 'Odisha',
      dateJoined: new Date().toISOString().split('T')[0],
      status: 'Pending',
      programsSupported: 1,
      notes: formData.proposal || 'Collaboration Proposal',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "partners"), newCollab);
      newCollab.firestoreId = docRef.id;
    } catch (firebaseErr) {
      console.warn("Firebase partner save notice:", firebaseErr);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('lvs_submitted_partners') || '[]');
      localStorage.setItem('lvs_submitted_partners', JSON.stringify([newCollab, ...existing]));
      window.dispatchEvent(new CustomEvent('lvs_new_partner', { detail: newCollab }));
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-purple-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/90 hover:bg-slate-200 transition-colors cursor-pointer z-20 shadow-xs border border-slate-200/80"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-purple-100 text-[#6B1D52] rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-black text-[#6B1D52]">Thank You!</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
              Thank you for your interest in collaborating with us. Our team will contact you shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pr-10 sm:pr-12">
              <div className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-[#6B1D52] tracking-wider bg-purple-50 px-3 py-1 rounded-full mb-2 border border-purple-100">
                <Handshake className="w-3.5 h-3.5" />
                <span>Companies, Institutions, NGOs & Volunteers</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52] tracking-tight">
                Collaborate With Us
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Open to Pvt. Ltd. companies, schools, colleges, non-profits, SHGs, volunteers, and community leaders to build stronger networks.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name / Organization Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name or Organization Title"
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization Type
                  </label>
                  <select
                    value={formData.orgType}
                    onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium bg-white"
                  >
                    <option value="Pvt. Ltd. Company">Pvt. Ltd. Company</option>
                    <option value="Educational Institution / College / School">Educational Institution / College</option>
                    <option value="Non-Profit / NGO">Non-Profit / NGO</option>
                    <option value="Government Body / Panchayati Raj">Government Body / Department</option>
                    <option value="Self-Help Group (SHG) Federation">Self-Help Group (SHG)</option>
                    <option value="Volunteer / Individual Partner">Volunteer / Individual</option>
                    <option value="Community Organization / Club">Community Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collaboration Area
                  </label>
                  <select
                    value={formData.collabArea}
                    onChange={(e) => setFormData({ ...formData, collabArea: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium bg-white"
                  >
                    <option value="Livelihood Training">Livelihood Training</option>
                    <option value="Skill Training & Workshops">Skill Training & Workshops</option>
                    <option value="Student / Graduate Placement">Graduate / Trainee Placement</option>
                    <option value="Community Health & Awareness Camps">Health & Awareness Camps</option>
                    <option value="Volunteering & Mentorship">Volunteering & Mentorship</option>
                    <option value="Resource & Facility Sharing">Resource & Facility Sharing</option>
                    <option value="Other Social Initiative">Other Social Drive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location (City / District / State)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Bhubaneswar, Khordha, Odisha"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Collaboration / Message
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe your collaboration proposal, target beneficiaries, or how we can work together..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6B1D52] to-[#4A1039] hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-98"
              >
                <span>Submit Collaboration Request</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
