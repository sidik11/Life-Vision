import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, GraduationCap, User, Phone, Mail, BookOpen, MapPin, Award, Briefcase, Share2 } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

export default function StudentPlacementModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      salary: 'Scholarship Requested',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "placements"), newPlacement);
      newPlacement.firestoreId = docRef.id;
    } catch (firebaseErr) {
      console.warn("Firebase placement save notice:", firebaseErr);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('lvs_submitted_placements') || '[]');
      localStorage.setItem('lvs_submitted_placements', JSON.stringify([newPlacement, ...existing]));
      window.dispatchEvent(new CustomEvent('lvs_new_placement', { detail: newPlacement }));
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-pink-100 max-h-[92vh] overflow-y-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/90 hover:bg-slate-200 transition-colors cursor-pointer z-20 shadow-xs border border-slate-200/80"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-[#006B3C] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52]">
              Application Submitted Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
              Thank you for registering with Life Vision Society. Our scholarship & placement support committee will review your application details and contact you shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 pr-10 sm:pr-12">
              <div className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full mb-2 border border-pink-100 max-w-full flex-wrap">
                <GraduationCap className="w-3.5 h-3.5 text-[#C52B75] shrink-0" />
                <span className="truncate sm:whitespace-normal">Scholarship & Placement Support • Free Higher Education Aid</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52] tracking-tight">
                Student Scholarship & Placement Registration Form
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                Please fill out all required details below for NGO tuition fee sponsorship or direct job placement assistance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. SUPPORT TYPE PROVIDED */}
              <div className="bg-gradient-to-r from-pink-50/80 via-white to-pink-50/80 p-4 sm:p-5 rounded-2xl border border-pink-200/80 space-y-3">
                <label className="block text-xs font-black text-[#6B1D52] tracking-wider flex items-center gap-2 font-serif">
                  <Award className="w-4 h-4 text-[#C52B75]" />
                  <span>1. Support Type Provided *</span>
                </label>
                <div className="p-3.5 sm:p-4 rounded-xl border-2 border-[#C52B75] bg-white shadow-xs flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C52B75] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                      NGO Tuition Fee Sponsorship + Job Placement Support
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight block mt-0.5">
                      For underprivileged students whose college tuition fees will be sponsored by NGO, with complete direct job placement support.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. PERSONAL INFORMATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 tracking-wider flex items-center gap-2 font-serif border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-[#C52B75]" />
                  <span>2. Personal Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Enter student full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Guardian Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Father / Mother / Guardian Name *
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      required
                      placeholder="Enter father / mother / guardian name"
                      value={formData.guardianName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="student@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ADDRESS DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 tracking-wider flex items-center gap-2 font-serif border-b border-slate-100 pb-2">
                  <MapPin className="w-4 h-4 text-[#C52B75]" />
                  <span>3. Address Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                    >
                      <option value="Odisha">Odisha</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Bihar">Bihar</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Assam">Assam</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Goa">Goa</option>
                      <option value="Delhi / NCR">Delhi / NCR</option>
                      <option value="Other State / UT">Other State / UT</option>
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      placeholder="e.g. Khordha, Cuttack, Puri"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Block / Municipality */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Block / Municipality
                    </label>
                    <input
                      type="text"
                      name="block"
                      placeholder="e.g. Saheed Nagar Block"
                      value={formData.block}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Village / Town / City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Village / Town / City *
                    </label>
                    <input
                      type="text"
                      name="villageCity"
                      required
                      placeholder="e.g. Bhubaneswar"
                      value={formData.villageCity}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* PIN Code */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="751007"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Full Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Address *
                    </label>
                    <textarea
                      name="fullAddress"
                      required
                      rows="2"
                      placeholder="House No., Street Name, Landmark"
                      value={formData.fullAddress}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 4. HIGHER EDUCATION COURSE DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 tracking-wider flex items-center gap-2 font-serif border-b border-slate-100 pb-2">
                  <BookOpen className="w-4 h-4 text-[#C52B75]" />
                  <span>4. Higher Education Course & Institution Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Higher Education Course */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Higher Education Course *
                    </label>
                    <select
                      name="higherCourse"
                      value={formData.higherCourse}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                    >
                      <option value="B.Tech / B.E. Engineering">B.Tech / B.E. Engineering</option>
                      <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                      <option value="BCA (Bachelor of Computer Applications)">BCA (Bachelor of Computer Applications)</option>
                      <option value="BBA (Bachelor of Business Administration)">BBA (Bachelor of Business Administration)</option>
                      <option value="B.Sc / BA / B.Com Graduation">B.Sc / BA / B.Com Graduation</option>
                      <option value="B.Sc Nursing / GNM Healthcare">B.Sc Nursing / GNM Healthcare</option>
                      <option value="ITI Technical Trade">ITI Technical Trade</option>
                      <option value="Postgraduate (M.Tech / MCA / MBA / M.Sc)">Postgraduate (M.Tech / MCA / MBA / M.Sc)</option>
                      <option value="Other Higher Education Course">Other Higher Education Course</option>
                    </select>
                  </div>

                  {/* College / Institution Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College / School / Institution Name *
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      required
                      placeholder="e.g. Govt. Engineering College / Utkal University"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Passing / Current Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Year / Passing Year
                    </label>
                    <input
                      type="text"
                      name="passingYear"
                      placeholder="e.g. 1st Year / 2025"
                      value={formData.passingYear}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Board / University */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Board / Affiliated University
                    </label>
                    <input
                      type="text"
                      name="boardUniversity"
                      placeholder="e.g. BPUT / Utkal University / CHSE"
                      value={formData.boardUniversity}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. CURRENT STATUS & 6. REFERRAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Employment / Student Status */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 font-serif">
                    <Briefcase className="w-3.5 h-3.5 text-[#C52B75]" />
                    <span>5. Current Status *</span>
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                  >
                    <option value="Student">Student</option>
                    <option value="Job Seeker">Job Seeker</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* How did you hear about us */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 font-serif">
                    <Share2 className="w-3.5 h-3.5 text-[#C52B75]" />
                    <span>6. How did you hear about us?</span>
                  </label>
                  <select
                    name="hearAboutUs"
                    value={formData.hearAboutUs}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="College / School">College / School</option>
                    <option value="Friend/Family">Friend/Family</option>
                    <option value="Community Worker">Community Worker</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C52B75] to-[#A82260] hover:from-[#A82260] hover:to-[#8C1B4E] text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-98 mt-6"
              >
                <span>Submit Scholarship & Placement Application</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
