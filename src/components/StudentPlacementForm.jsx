import React, { useState } from 'react';
import { GraduationCap, User, Phone, Mail, MapPin, CheckCircle2, Send, BookOpen, Award, Briefcase, Share2, Loader2 } from 'lucide-react';
import { saveToFirestore } from '../utils/firebaseSave';

export default function StudentPlacementForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Support Type
    supportType: 'NGO Tuition Fee Sponsorship + Job Placement Support',

    // Personal Information
    fullName: '',
    dob: '',
    gender: 'Female',
    guardianName: '',
    phone: '',
    email: '',

    // Address Details
    state: 'Odisha',
    district: '',
    block: '',
    villageCity: '',
    pincode: '',
    fullAddress: '',

    // Higher Education Details
    higherCourse: 'B.Tech / B.E. Engineering',
    collegeName: '',
    passingYear: '',
    boardUniversity: '',

    // Current Status & Referral
    employmentStatus: 'Student',
    hearAboutUs: 'Website',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newApplication = {
      id: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      status: 'Pending',
      appliedAt: new Date().toISOString().split('T')[0]
    };

    const newPlacement = {
      id: `PLC-OD-${Math.floor(100 + Math.random() * 900)}`,
      student: formData.fullName || 'Scholarship Applicant',
      course: formData.higherCourse || 'Higher Education Scholarship',
      trainingCompleted: 'Scholarship Requested',
      placementStatus: 'Applied',
      employer: formData.collegeName || 'Tuition Fee Sponsorship',
      jobRole: formData.supportType || 'Higher Education Placement',
      location: `${formData.district || 'Bhubaneswar'}, ${formData.state || 'Odisha'}`,
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 'Scholarship Requested'
    };

    // 1. Save to Firestore Collections with fast timeout & Admin Events
    await saveToFirestore('training_applications', newApplication, 'lvs_new_application');
    await saveToFirestore('placements', newPlacement, 'lvs_new_placement');

    // Show success feedback to the user
    setIsSubmitting(false);
    setSubmitted(true);

    // 3. Optional FormSubmit email notice to support.lifevision@gmail.com (Non-blocking)
    fetch('https://formsubmit.co/ajax/support.lifevision@gmail.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `[LVS Student Application] ${formData.fullName} - ${formData.higherCourse}`,
        _replyto: formData.email,
        _captcha: 'false',
        _template: 'table',
        "Student Name": formData.fullName,
        "Phone": formData.phone,
        "Email": formData.email,
        "Course": formData.higherCourse,
        "College": formData.collegeName,
        "District": formData.district,
        "Support Required": formData.supportType
      })
    }).catch(err => console.warn("Email alert status:", err));

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        supportType: 'NGO Tuition Fee Sponsorship + Job Placement Support',
        fullName: '',
        dob: '',
        gender: 'Female',
        guardianName: '',
        phone: '',
        email: '',
        state: 'Odisha',
        district: '',
        block: '',
        villageCity: '',
        pincode: '',
        fullAddress: '',
        higherCourse: 'B.Tech / B.E. Engineering',
        collegeName: '',
        passingYear: '',
        boardUniversity: '',
        employmentStatus: 'Student',
        hearAboutUs: 'Website',
      });
    }, 6000);
  };

  return (
    <div id="student-placement-form" className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-pink-100/90 font-sans space-y-8 max-w-4xl mx-auto">
      
      {/* Form Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-pink-100 pb-6">
        <div className="inline-flex items-center gap-2 text-[#6B1D52] bg-pink-50 text-xs font-black px-4 py-1.5 rounded-full border border-pink-100">
          <GraduationCap className="w-4 h-4 text-[#C52B75]" />
          <span>Life Vision Society — Student Welfare Aid Application</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-wide">
          Student Higher Education & Job Placement Application
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
          Fill out this form to apply for NGO higher education fee sponsorship, free textbooks, scholarships, or employer job placement assistance.
        </p>
      </div>

      {submitted ? (
        <div className="bg-gradient-to-b from-pink-50 via-white to-pink-50/60 border-2 border-pink-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 animate-scale-up shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-emerald-100">
            <CheckCircle2 className="w-11 h-11" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52]">
            Application Submitted Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-md mx-auto leading-relaxed">
            Thank you for applying to Life Vision Society. Your application has been saved to our Firebase Cloud database. Our student welfare team will contact you shortly on your provided phone number.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Support Type Required */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-black text-[#6B1D52] tracking-wider uppercase flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C52B75]" />
              <span>1. Choose Assistance Type</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-800">
              {[
                'NGO Tuition Fee Sponsorship + Job Placement Support',
                'Free Study Books & Education Scholarship',
                'Job Matchmaking & Placement Assistance Only',
                'General Student Support Inquiry'
              ].map((typeOption) => (
                <label
                  key={typeOption}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    formData.supportType === typeOption
                      ? 'bg-pink-50 border-[#C52B75] text-[#6B1D52] shadow-2xs'
                      : 'bg-[#FFF7F6]/50 border-pink-100 hover:bg-pink-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="supportType"
                    value={typeOption}
                    checked={formData.supportType === typeOption}
                    onChange={handleChange}
                    className="accent-[#C52B75]"
                  />
                  <span>{typeOption}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="space-y-4 pt-4 border-t border-pink-50">
            <h3 className="text-sm font-serif font-black text-[#6B1D52] tracking-wider uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-[#C52B75]" />
              <span>2. Student Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Student Full Name *</label>
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  required
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Father / Guardian Name *</label>
                <input
                  type="text"
                  required
                  name="guardianName"
                  placeholder="Enter guardian name"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="student@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Higher Education Details */}
          <div className="space-y-4 pt-4 border-t border-pink-50">
            <h3 className="text-sm font-serif font-black text-[#6B1D52] tracking-wider uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C52B75]" />
              <span>3. Course & Academic Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Enrolled / Pursuing *</label>
                <select
                  name="higherCourse"
                  value={formData.higherCourse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                >
                  <option value="B.Tech / B.E. Engineering">B.Tech / B.E. Engineering</option>
                  <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                  <option value="BCA / B.Sc Computer Science">BCA / B.Sc Computer Science</option>
                  <option value="BBA / B.Com / Degree">BBA / B.Com / Degree</option>
                  <option value="ITI Vocational Trade">ITI Vocational Trade</option>
                  <option value="Class 11-12 / School Higher Secondary">Class 11-12 / School Higher Secondary</option>
                  <option value="Other Higher Course">Other Higher Course</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">College / Institution Name *</label>
                <input
                  type="text"
                  required
                  name="collegeName"
                  placeholder="Enter college name"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Expected Passing Year *</label>
                <input
                  type="text"
                  required
                  name="passingYear"
                  placeholder="e.g. 2026"
                  value={formData.passingYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address Details */}
          <div className="space-y-4 pt-4 border-t border-pink-50">
            <h3 className="text-sm font-serif font-black text-[#6B1D52] tracking-wider uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C52B75]" />
              <span>4. Permanent Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">District *</label>
                <input
                  type="text"
                  required
                  name="district"
                  placeholder="e.g. Khordha / Cuttack"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Village *</label>
                <input
                  type="text"
                  required
                  name="villageCity"
                  placeholder="Enter village or city"
                  value={formData.villageCity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
                <input
                  type="text"
                  required
                  name="pincode"
                  placeholder="e.g. 751001"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#C52B75] via-[#A82260] to-[#6B1D52] text-white font-black py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer text-sm tracking-wider flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Saving Application to Firebase...</span>
              </>
            ) : (
              <>
                <span>Submit Application for Student Support</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
}
