import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, GraduationCap, User, Phone, Mail, BookOpen, MapPin, Calendar, Briefcase, Award, Share2, FileCheck, Upload, Loader2 } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

export default function ApplyModal({ isOpen, onClose, selectedCourse }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRegId, setLastRegId] = useState('');
  const [formData, setFormData] = useState({
    // Course
    course: selectedCourse || 'Tailoring & Stitching Training',

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

    // Educational Qualification
    qualification: '10th',
    passingYear: '',
    boardUniversity: '',

    // Current Employment Status
    employmentStatus: 'Unemployed',

    // Referral
    hearAboutUs: 'Social Media',
  });

  // Optional Document Uploads (< 5MB limit each)
  const [documents, setDocuments] = useState({
    photo: null,
    photoName: '',
    aadhaar: null,
    aadhaarName: '',
    marksheet: null,
    marksheetName: ''
  });

  const [docErrors, setDocErrors] = useState({
    photo: '',
    aadhaar: '',
    marksheet: ''
  });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit in bytes

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setDocErrors((prev) => ({
        ...prev,
        [field]: 'File size exceeds 5MB limit. Please choose a file smaller than 5MB.'
      }));
      e.target.value = '';
      return;
    }

    setDocErrors((prev) => ({ ...prev, [field]: '' }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments((prev) => ({
        ...prev,
        [field]: reader.result,
        [`${field}Name`]: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedCourse) {
      setFormData((prev) => ({ ...prev, course: selectedCourse }));
    }
  }, [selectedCourse]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newApp = {
        id: `APP-LVS-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: formData.fullName || 'New Applicant',
        fullName: formData.fullName || 'New Applicant',
        photo: documents.photo || '/hero_training.png',
        gender: formData.gender || 'Female',
        age: 22,
        dob: formData.dob || '2004-01-01',
        mobile: formData.phone || '+91 98000 00000',
        phone: formData.phone || '+91 98000 00000',
        email: formData.email || 'applicant@gmail.com',
        address: formData.fullAddress || formData.villageCity || 'Main Village Road',
        district: formData.district || 'Bhubaneswar',
        state: formData.state || 'Odisha',
        pincode: formData.pincode || '751001',
        qualification: formData.qualification || '12th Pass',
        institution: formData.boardUniversity || 'Odisha Board',
        passingYear: formData.passingYear || '2022',
        course: formData.course || selectedCourse || 'Tailoring & Stitching Training',
        preferredCenter: 'Bhubaneswar LVS Skill Center',
        preferredBatch: 'BATCH-2026-T1 (Morning)',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'New',
        location: `${formData.district || 'Bhubaneswar'}, ${formData.state || 'Odisha'}`,
        timelineStep: 1,
        documents: {
          photo: documents.photoName ? `Uploaded (${documents.photoName})` : 'Applicant Photo',
          idProof: documents.aadhaarName ? `Uploaded (${documents.aadhaarName})` : 'Aadhaar Card (Optional)',
          educationCertificate: documents.marksheetName ? `Uploaded (${documents.marksheetName})` : 'Marksheet (Optional)',
          other: 'Registration Form'
        },
        uploadedPhoto: documents.photo,
        uploadedAadhaar: documents.aadhaar,
        uploadedMarksheet: documents.marksheet,
        createdAt: new Date().toISOString()
      };

      // 1. Save to Firebase Firestore Database
      try {
        const firestorePayload = {
          ...newApp,
          createdAt: serverTimestamp(),
          uploadedPhoto: documents.photo && documents.photo.length < 500000 ? documents.photo : null,
          uploadedAadhaar: documents.aadhaar && documents.aadhaar.length < 500000 ? documents.aadhaar : null,
          uploadedMarksheet: documents.marksheet && documents.marksheet.length < 500000 ? documents.marksheet : null,
        };
        const docRef = await addDoc(collection(db, "training_applications"), firestorePayload);
        newApp.firestoreId = docRef.id;
      } catch (firebaseErr) {
        console.warn("Firebase training application save notice:", firebaseErr);
      }

      // 2. Save locally for fallback/Admin Panel
      try {
        const existing = JSON.parse(localStorage.getItem('lvs_submitted_applications') || '[]');
        localStorage.setItem('lvs_submitted_applications', JSON.stringify([newApp, ...existing]));
        window.dispatchEvent(new CustomEvent('lvs_new_application', { detail: newApp }));
      } catch (err) {
        console.error(err);
      }

      setLastRegId(newApp.id);
      setSubmitted(true);
      setIsSubmitting(false);

      // 3. Automated Confirmation Email Dispatch (Non-blocking)
      const studentName = formData.fullName || 'Student';
      const courseName = formData.course || selectedCourse || 'Tailoring & Stitching Training';
      const regId = newApp.id;
      const trainingCentre = newApp.preferredCenter || 'Bhubaneswar LVS Skill Center';
      const regDate = newApp.applicationDate;
      const recipientEmail = formData.email ? formData.email.trim() : '';

      const emailBody = `Subject: Training Registration Confirmation – Life Vision Society

Dear ${studentName},

Thank you for registering for the ${courseName} training program with Life Vision Society.

Your registration has been successfully received.

Registration Details:
• Name: ${studentName}
• Course: ${courseName}
• Registration ID: ${regId}
• Centre: ${trainingCentre}
• Registration Date: ${regDate}

Our team will review your registration and contact you regarding the next steps, training schedule, and admission confirmation.

Please keep your Registration ID for future reference.

Regards,
Life Vision Society
Skill Development & Training Team`;

      fetch('https://formsubmit.co/ajax/support.lifevision@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Training Registration Confirmation – Life Vision Society`,
          _replyto: recipientEmail || 'support.lifevision@gmail.com',
          _autorespond: emailBody,
          _captcha: 'false',
          _template: 'table',
          "Student Name": studentName,
          "Registration ID": regId,
          "Course": courseName,
          "Training Centre": trainingCentre,
          "Registration Date": regDate,
          "Mobile": formData.phone,
          "Email": recipientEmail || 'N/A',
          "District": formData.district || 'N/A',
          "Full Confirmation Message": emailBody
        })
      }).catch(emailErr => console.warn("Confirmation email dispatch notice:", emailErr));

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 4000);

    } catch (err) {
      console.error("Form submission error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-pink-100 max-h-[92vh] overflow-y-auto text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/90 hover:bg-slate-200 transition-colors cursor-pointer z-20 shadow-xs border border-slate-200/80"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-[#006B3C] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52]">Registration Successful!</h3>
            {lastRegId && (
              <div className="inline-block bg-pink-50 border border-pink-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-[#C52B75] shadow-xs">
                Registration ID: {lastRegId}
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
              Thank you for registering with Life Vision Society. A confirmation email has been sent to your registered email address with your Registration ID and details.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 pr-10 sm:pr-12">
              <div className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full mb-2 border border-pink-100">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Admission Form • Free Vocational Training</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52] tracking-tight">
                Skill Training Registration Form
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Please fill out all the required details below to complete your training application.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. SELECT TRAINING */}
              <div className="bg-gradient-to-r from-pink-50/80 via-white to-pink-50/80 p-4 sm:p-5 rounded-2xl border border-pink-200/80 space-y-3">
                <label className="block text-xs font-black text-[#6B1D52] tracking-wider flex items-center gap-2 font-serif">
                  <BookOpen className="w-4 h-4 text-[#C52B75]" />
                  <span>1. Select Training Program *</span>
                </label>
                <div className="relative">
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-xs sm:text-sm font-bold border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white text-slate-900 shadow-2xs"
                  >
                    <option value="Tailoring & Stitching Training">Tailoring & Stitching Training (15 Days)</option>
                    <option value="Beautician & Wellness Training">Beautician & Wellness Training (15 Days)</option>
                    <option value="Agriculture & Farming Training">Agriculture & Farming Training (3 Months)</option>
                    <option value="Healthcare Program">Healthcare Program (3 Months)</option>
                    <option value="Tourism & Hospitality Training">Tourism & Hospitality Training (3 Months)</option>
                    <option value="Food & Beverages Training">Food & Beverages Training (3 Months)</option>
                  </select>
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Enter your full name"
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
                      Father / Husband / Guardian Name
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      placeholder="Enter father / husband / guardian name"
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
                      placeholder="+91 94163 62914"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="yourname@gmail.com"
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

              {/* 4. EDUCATIONAL QUALIFICATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 tracking-wider flex items-center gap-2 font-serif border-b border-slate-100 pb-2">
                  <Award className="w-4 h-4 text-[#C52B75]" />
                  <span>4. Educational Qualification</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Highest Qualification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Highest Qualification *
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                    >
                      <option value="8th">8th Pass</option>
                      <option value="10th">10th Pass (Matriculation)</option>
                      <option value="12th">12th Pass (Higher Secondary)</option>
                      <option value="ITI">ITI Certified</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Year of Passing */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      name="passingYear"
                      placeholder="e.g. 2022"
                      value={formData.passingYear}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>

                  {/* Education Board / University */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Board / University
                    </label>
                    <input
                      type="text"
                      name="boardUniversity"
                      placeholder="e.g. BSE Odisha / CHSE"
                      value={formData.boardUniversity}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. CURRENT EMPLOYMENT STATUS & 6. REFERRAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Employment Status */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 font-serif">
                    <Briefcase className="w-3.5 h-3.5 text-[#C52B75]" />
                    <span>5. Current Employment Status *</span>
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                  >
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Employed">Employed</option>
                    <option value="Homemaker">Homemaker</option>
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
                    <option value="Friend/Family">Friend/Family</option>
                    <option value="Community Worker">Community Worker</option>
                    <option value="Training Center">Training Center</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* 7. UPLOAD DOCUMENTS (MAX 5MB) */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-800 tracking-wider flex items-center gap-2 font-serif">
                    <FileCheck className="w-4 h-4 text-[#C52B75]" />
                    <span>7. Upload Documents (Max 5MB per file)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Candidate Photo */}
                  <div className="p-3 bg-[#FFF7F6]/60 rounded-2xl border border-pink-100 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Candidate Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-pink-100 file:text-[#C52B75] hover:file:bg-pink-200 cursor-pointer"
                    />
                    {documents.photoName && (
                      <p className="text-[10px] text-emerald-700 font-bold truncate">✓ {documents.photoName}</p>
                    )}
                    {docErrors.photo && (
                      <p className="text-[10px] text-rose-600 font-bold leading-tight">{docErrors.photo}</p>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="p-3 bg-[#FFF7F6]/60 rounded-2xl border border-pink-100 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Aadhaar Card
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'aadhaar')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-pink-100 file:text-[#C52B75] hover:file:bg-pink-200 cursor-pointer"
                    />
                    {documents.aadhaarName && (
                      <p className="text-[10px] text-emerald-700 font-bold truncate">✓ {documents.aadhaarName}</p>
                    )}
                    {docErrors.aadhaar && (
                      <p className="text-[10px] text-rose-600 font-bold leading-tight">{docErrors.aadhaar}</p>
                    )}
                  </div>

                  {/* Education Marksheet */}
                  <div className="p-3 bg-[#FFF7F6]/60 rounded-2xl border border-pink-100 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Education Marksheet
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'marksheet')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-pink-100 file:text-[#C52B75] hover:file:bg-pink-200 cursor-pointer"
                    />
                    {documents.marksheetName && (
                      <p className="text-[10px] text-emerald-700 font-bold truncate">✓ {documents.marksheetName}</p>
                    )}
                    {docErrors.marksheet && (
                      <p className="text-[10px] text-rose-600 font-bold leading-tight">{docErrors.marksheet}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#C52B75] to-[#A82260] hover:from-[#A82260] hover:to-[#8C1B4E] text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-98 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Training Application</span>
                    <Send className="w-4 h-4" />
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
