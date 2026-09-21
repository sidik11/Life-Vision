import React, { useState } from 'react';
import { X, Heart, User, Mail, Phone, MapPin, CheckCircle2, Award, Sparkles, Briefcase, Loader2 } from 'lucide-react';
import { saveToFirestore } from '../utils/firebaseSave';
import { sendWebsiteFormEmail } from '../utils/emailHelper';

export default function VolunteerModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    gender: 'Female',
    state: 'Odisha',
    city: '',
    roleInterest: 'Skill Trainer / Instructor',
    availability: 'Weekends Only',
    motivation: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const locationStr = formData.city && formData.state 
      ? `${formData.city}, ${formData.state}` 
      : (formData.city || formData.state || '');

    const newVol = {
      id: `VOL-LVS-${Date.now().toString().slice(-4)}`,
      name: formData.fullName,
      email: formData.email,
      phone: formData.mobile,
      gender: formData.gender,
      state: formData.state,
      city: formData.city,
      location: locationStr,
      skills: formData.roleInterest,
      interest: formData.roleInterest,
      availability: formData.availability,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    await saveToFirestore('volunteers', newVol, 'lvs_new_volunteer');

    // Dispatch Confirmation & Admin Notification Emails
    sendWebsiteFormEmail({
      type: 'volunteer',
      applicantEmail: formData.email,
      applicantName: formData.fullName,
      data: newVol
    }).catch(err => console.warn("Email alert notice:", err));

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        mobile: '',
        gender: 'Female',
        state: 'Odisha',
        city: '',
        roleInterest: 'Skill Trainer / Instructor',
        availability: 'Weekends Only',
        motivation: ''
      });
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 bg-[#C52B75] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-black text-[#6B1D52]">Thank You for Joining Us!</h3>
            <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
              Your volunteer application has been received. Our volunteer coordinator will get in touch with you shortly at <span className="font-bold text-slate-900">{formData.email}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 inline-block font-serif">
                Join Our Movement
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-tight flex items-center gap-2">
                <span>Volunteer with Life Vision</span>
                <Heart className="w-6 h-6 text-[#C52B75] fill-pink-100" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Share your time, expertise, and passion to help empower rural women, youth, and underserved communities.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium text-slate-700"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium text-slate-700"
                  >
                    <option value="Odisha">Odisha</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Delhi / NCR">Delhi / NCR</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other State / UT">Other State / UT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your location"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area of Interest</label>
                  <select
                    value={formData.roleInterest}
                    onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium text-slate-700"
                  >
                    <option value="Skill Trainer / Instructor">Skill Trainer / Instructor</option>
                    <option value="Health Camp Coordinator">Health Camp Coordinator</option>
                    <option value="Community Outreach & Awareness">Community Outreach & Awareness</option>
                    <option value="Digital / Social Media Volunteer">Digital / Social Media Volunteer</option>
                    <option value="Career & Placement Mentor">Career & Placement Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium text-slate-700"
                  >
                    <option value="Weekends Only">Weekends Only</option>
                    <option value="2-4 Hours Weekly">2-4 Hours Weekly</option>
                    <option value="Full Time / Internship">Full Time / Internship</option>
                    <option value="Project Basis">Project Basis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Why would you like to volunteer with us?</label>
                <textarea
                  rows={3}
                  placeholder="Share a brief note about your experience or passion for social welfare..."
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#C52B75] via-[#A82260] to-[#6B1D52] text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Volunteer Application</span>
                    <Heart className="w-4 h-4 fill-white" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
