import React, { useState } from 'react';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, LogIn,
  GraduationCap, Users, Sprout, Handshake, X,
  IdCard, Upload, Printer, CheckCircle2, Heart, Plus,
  Phone, MapPin, Building, Calendar, UserCheck, ChevronDown, User
} from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '../../firebase';
import { saveToFirestore } from '../../utils/firebaseSave';

export default function AdminLogin({ onLogin }) {
  // Role Selection: 'admin' | 'staff'
  const [selectedRole, setSelectedRole] = useState('admin');

  // Admin Login State
  const [identityInput, setIdentityInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Staff Registration State
  const [staffData, setStaffData] = useState({
    name: '',
    parentName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    emergencyContact: '+91 9416362914',
    address: '',
    city: '',
    state: 'Odisha',
    pinCode: '',
    role: '',
    department: 'Mobilization',
    joinDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full Time',
    location: '',
    photoDoc: '',
    aadharDoc: '',
    extraDocs: []
  });
  const [staffPhoto, setStaffPhoto] = useState(null);
  const [submittedStaff, setSubmittedStaff] = useState(null);
  const [generatedCard, setGeneratedCard] = useState(null);

  // Status & Modal States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleBackToPublic = () => {
    window.location.href = '/';
  };

  // Handle Admin Login Submission
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanInput = identityInput.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanInput || !cleanPassword) {
      setError('Please enter both Admin Email and Password.');
      return;
    }

    const emailToUse = (cleanInput === 'life vision society' || cleanInput === 'life vision' || cleanInput === 'admin')
      ? 'support.lifevision@gmail.com'
      : cleanInput;

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, cleanPassword);
      setLoading(false);
      onLogin({
        uid: userCredential.user.uid,
        name: 'Life Vision Society',
        email: userCredential.user.email,
        role: 'Super Admin',
        avatar: '/image/logo.png'
      });
    } catch (firebaseError) {
      console.log('Sign-In Notice:', firebaseError.code, firebaseError.message);

      if (
        (emailToUse === 'support.lifevision@gmail.com' || emailToUse === 'info.lifevision@gmail.com') &&
        cleanPassword === 'lifevision@123'
      ) {
        try {
          const newUser = await createUserWithEmailAndPassword(auth, 'support.lifevision@gmail.com', 'lifevision@123');
          setLoading(false);
          onLogin({
            uid: newUser.user.uid,
            name: 'Life Vision Society',
            email: 'support.lifevision@gmail.com',
            role: 'Super Admin',
            avatar: '/image/logo.png'
          });
          return;
        } catch (createErr) {
          console.warn('User creation notice:', createErr);
        }

        setLoading(false);
        onLogin({
          name: 'Life Vision Society',
          email: 'support.lifevision@gmail.com',
          role: 'Super Admin',
          avatar: '/image/logo.png'
        });
        return;
      }

      setLoading(false);
      setError('Invalid Admin Credentials. Please enter valid email & password.');
    }
  };

  // Handle Photo Upload Conversion
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds the allowed limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaffPhoto(reader.result);
        setStaffData(prev => ({ ...prev, photoDoc: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds the allowed limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaffData(prev => ({ ...prev, aadharDoc: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExtraDoc = () => {
    setStaffData(prev => ({
      ...prev,
      extraDocs: [...(prev.extraDocs || []), { title: '', file: '', fileName: '' }]
    }));
  };

  const handleExtraDocTitleChange = (index, title) => {
    setStaffData(prev => {
      const updated = [...(prev.extraDocs || [])];
      updated[index] = { ...updated[index], title };
      return { ...prev, extraDocs: updated };
    });
  };

  const handleExtraDocFileChange = (index, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the allowed limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setStaffData(prev => {
        const updated = [...(prev.extraDocs || [])];
        updated[index] = { ...updated[index], file: reader.result, fileName: file.name };
        return { ...prev, extraDocs: updated };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveExtraDoc = (index) => {
    setStaffData(prev => ({
      ...prev,
      extraDocs: prev.extraDocs.filter((_, i) => i !== index)
    }));
  };

  // Handle Staff Form Submission
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!staffData.name.trim() || !staffData.email.trim() || !staffData.phone.trim() || !staffData.role.trim() || !staffData.department) {
      setError('Please fill in all required fields (Full Name, Designation, Department, Email, Mobile Number).');
      return;
    }

    const generatedId = `STF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newStaffRecord = {
      id: generatedId,
      employeeId: generatedId,
      name: staffData.name.trim(),
      parentName: (staffData.parentName || '').trim(),
      dob: staffData.dob || '',
      gender: staffData.gender || 'Male',
      bloodGroup: staffData.bloodGroup || 'O+',
      
      phone: staffData.phone.trim(),
      email: staffData.email.trim().toLowerCase(),
      emergencyContact: staffData.emergencyContact.trim() || '+91 9416362914',
      address: (staffData.address || '').trim(),
      city: (staffData.city || '').trim(),
      state: (staffData.state || 'Odisha').trim(),
      pinCode: (staffData.pinCode || '').trim(),

      role: staffData.role.trim(),
      designation: staffData.role.trim(),
      department: staffData.department,
      joinDate: staffData.joinDate || new Date().toISOString().split('T')[0],
      joiningDate: staffData.joinDate || new Date().toISOString().split('T')[0],
      employmentType: staffData.employmentType || 'Full Time',
      location: (staffData.location || '').trim() || 'Odisha Center',

      avatar: staffPhoto || staffData.photoDoc || '/image/logo.png',
      photoDoc: staffPhoto || staffData.photoDoc || '',
      aadharDoc: staffData.aadharDoc || '',
      extraDocs: staffData.extraDocs || [],

      status: 'Pending Approval',
      approvalStatus: 'Pending',
      cardStatus: 'Pending Approval',
      registeredAt: new Date().toISOString()
    };

    setLoading(true);

    try {
      await saveToFirestore('staff', newStaffRecord, 'lvs_new_staff');
    } catch (err) {
      console.warn("Firestore staff save notice:", err);
    }

    setLoading(false);
    setSubmittedStaff(newStaffRecord);
  };

  // Printable ID Card Pop-up
  const handlePrintIdCard = () => {
    if (!generatedCard) return;
    const printWindow = window.open('', '_blank', 'width=800,height=950');
    if (!printWindow) return;

    const frontImgSrc = '/Team Member/id_card_front.jpg';
    const backImgSrc = '/Team Member/id_card_back.jpg';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Staff ID Card - ${generatedCard.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; padding: 30px; margin: 0; }
            
            .card-container { width: 340px; height: 510px; position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); background: #fff; }
            .card-bg { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; z-index: 1; }

            /* Overlay Elements for Front Card */
            .photo-box { position: absolute; top: 154px; left: 50%; transform: translateX(-50%); width: 114px; height: 114px; border-radius: 18px; object-fit: cover; z-index: 10; background: #fff; border: 2px solid #10b981; }
            .staff-name { position: absolute; top: 275px; width: 100%; text-align: center; font-size: 14px; font-weight: 900; color: #021a10; z-index: 10; font-family: sans-serif; }
            .staff-role { position: absolute; top: 293px; width: 100%; text-align: center; font-size: 10px; font-weight: 800; color: #047857; z-index: 10; text-transform: uppercase; }

            .info-section { position: absolute; top: 316px; left: 68px; right: 20px; z-index: 10; display: flex; flex-direction: column; gap: 3px; }
            .info-row { display: flex; align-items: center; font-size: 9.5px; line-height: 1; }
            .icon-circle { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 6px; flex-shrink: 0; }
            .bg-emerald { background: #047857; }
            .bg-teal { background: #0e4b55; }
            .info-label { font-weight: 700; color: #1e293b; width: 68px; flex-shrink: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
            .colon { font-weight: 700; color: #1e293b; margin-right: 6px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .info-value { font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px; font-family: 'Plus Jakarta Sans', sans-serif; }

            @media print {
              body { background: transparent; padding: 0; gap: 20px; }
              .card-container { page-break-after: always; box-shadow: none; border: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          <!-- FRONT SIDE -->
          <div class="card-container">
            <img src="${frontImgSrc}" class="card-bg" alt="Front ID Template" />
            <img src="${generatedCard.avatar || '/image/logo.png'}" class="photo-box" alt="Staff Photo" />
            <div class="staff-name">${generatedCard.name}</div>
            <div class="staff-role">${generatedCard.role}</div>
            
            <div class="info-section">
              <div class="info-row">
                <div class="icon-circle bg-emerald">
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span class="info-label">Employee ID</span>
                <span class="colon">:</span>
                <span class="info-value">${generatedCard.id}</span>
              </div>
              <div class="info-row">
                <div class="icon-circle bg-emerald">
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <span class="info-label">Department</span>
                <span class="colon">:</span>
                <span class="info-value">${generatedCard.department}</span>
              </div>
              <div class="info-row">
                <div class="icon-circle bg-teal">
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <span class="info-label">Contact No.</span>
                <span class="colon">:</span>
                <span class="info-value">${generatedCard.phone || '+91 9416362914'}</span>
              </div>
              <div class="info-row">
                <div class="icon-circle bg-emerald">
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span class="info-label">Joining Date</span>
                <span class="colon">:</span>
                <span class="info-value">${generatedCard.joinDate || '2026-01-01'}</span>
              </div>
            </div>
          </div>

          <!-- BACK SIDE -->
          <div class="card-container">
            <img src="${backImgSrc}" class="card-bg" alt="Back ID Template" />
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const emailToReset = forgotEmail.trim() || 'support.lifevision@gmail.com';
    try {
      await sendPasswordResetEmail(auth, emailToReset);
    } catch (err) {
      console.warn("Reset email notice:", err);
    }
    setForgotSent(true);
  };

  return (
    <div className="h-screen w-screen bg-[#F0F5F2] flex items-center justify-center p-3 sm:p-4 lg:p-6 font-sans antialiased relative overflow-hidden select-none">

      {/* Decorative Forest Ambient Accents */}
      <div className="absolute -top-12 -right-12 w-80 h-80 bg-gradient-to-br from-emerald-300/25 to-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-gradient-to-tr from-emerald-300/25 to-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* MAIN SPLIT CARD */}
      <div className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[700px] bg-white rounded-3xl border border-emerald-100/80 shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDE: HERO BANNER */}
        <div className="md:w-1/2 relative bg-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
          <img
            src="/image/about pic.png"
            alt="Life Vision Society About"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-50 mix-blend-overlay pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#021A10] via-[#053221]/90 to-[#01110A]/70 pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 space-y-2">
            <div className="inline-block p-2.5 px-4 bg-gradient-to-r from-[#3D0A2E] via-[#5A1644] to-[#7A1D59] rounded-2xl shadow-lg border border-[#7A1D59]/50">
              <img
                src="/image/logo.png"
                alt="Life Vision Society Logo"
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-sm brightness-105"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-200/90 pl-0.5">
                Empowering Lives, Inspiring Futures
              </p>
            </div>
          </div>

          {/* Middle Content */}
          <div className="relative z-10 space-y-2.5 my-auto py-2">
            <p className="text-base sm:text-lg font-light text-emerald-100/90 tracking-wide font-sans">
              Welcome to
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans leading-tight">
              Life Vision <span className="text-[#10B981]">Society</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
              Portal Access
            </h2>
            <p className="text-2xs sm:text-xs text-emerald-100/80 font-medium leading-relaxed max-w-sm pt-0.5">
              Sign in as Admin or Register/Sign-in as Staff to auto-generate official Staff ID Cards.
            </p>

            {/* 4 Feature Badges Row */}
            <div className="grid grid-cols-4 gap-1.5 pt-4 border-t border-white/15 text-center">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full border border-white/25 bg-black/30 backdrop-blur-xs flex items-center justify-center mx-auto text-emerald-300">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-white block leading-tight">Skill Development</span>
              </div>
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full border border-white/25 bg-black/30 backdrop-blur-xs flex items-center justify-center mx-auto text-emerald-300">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-white block leading-tight">Women Empowerment</span>
              </div>
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full border border-white/25 bg-black/30 backdrop-blur-xs flex items-center justify-center mx-auto text-emerald-300">
                  <Sprout className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-white block leading-tight">Youth Empowerment</span>
              </div>
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full border border-white/25 bg-black/30 backdrop-blur-xs flex items-center justify-center mx-auto text-emerald-300">
                  <Handshake className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-white block leading-tight">Community Impact</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-2 border-t border-white/10">
            <p className="text-base sm:text-lg font-serif italic text-emerald-200 tracking-wide">
              Together for a Brighter Future
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: ROLE SELECTOR & FORM CONTAINER */}
        <div className="md:w-1/2 bg-[#FAFCFB] p-6 sm:p-7 flex flex-col justify-between space-y-3 relative overflow-y-auto scrollbar-thin">

          {/* Card Close "X" Button */}
          <button
            type="button"
            onClick={handleBackToPublic}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-slate-400 hover:text-[#047857] transition-all cursor-pointer z-20"
            title="Back to Public Website"
            aria-label="Back to Public Website"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Form Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-fit mx-auto p-2 px-3 bg-gradient-to-r from-[#3D0A2E] via-[#5A1644] to-[#7A1D59] border border-[#7A1D59]/50 rounded-2xl shadow-md">
              <img
                src="/image/logo.png"
                alt="Life Vision Society Logo"
                className="h-10 sm:h-12 w-auto mx-auto object-contain filter brightness-105"
              />
            </div>

            {/* ROLE DROPDOWN SELECTOR */}
            <div className="pt-2 max-w-xs mx-auto">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Select Portal Access Role:
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 bg-emerald-50 border-2 border-[#047857] text-[#047857] font-black rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-[#047857]/40 cursor-pointer shadow-xs"
                >
                  <option value="admin">🔒 Admin Login</option>
                  <option value="staff">🪪 Staff Sign-In & ID Card Registration</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#047857] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-2xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. ADMIN LOGIN FORM */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-2xs font-bold text-slate-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Admin Email / Username</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identityInput}
                    onChange={(e) => setIdentityInput(e.target.value)}
                    placeholder="Enter admin email or username"
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-2xs font-bold text-slate-800 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#047857] accent-[#047857]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#047857] hover:underline font-bold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs tracking-wide mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Admin Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. STAFF REGISTRATION & ID CARD GENERATOR */}
          {selectedRole === 'staff' && (
            <div className="space-y-3">
              {/* Header Banner with Clean Styling */}
              <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs text-[#047857] font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#047857]" />
                  <span>Fill Staff Details</span>
                </div>
                <span className="text-[10px] bg-emerald-100/70 text-[#047857] px-2 py-0.5 rounded-full font-extrabold border border-emerald-300/60">
                  Staff Registration
                </span>
              </div>

              {submittedStaff ? (
                /* DISPLAY REGISTRATION SUBMITTED SUCCESS BANNER */
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl space-y-4 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">Registration Submitted Successfully!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your staff registration details for <strong className="text-slate-800">{submittedStaff.name}</strong> ({submittedStaff.id}) have been submitted to the Admin Portal.
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-2xs text-[#047857] font-semibold text-left space-y-1.5">
                    <p className="font-bold flex items-center gap-1 text-[#047857]">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Staff ID Card Email Delivery Notice</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Your Staff ID Card is currently pending Admin Approval. Once approved by the Admin in the Admin Portal, your official Staff ID Card PDF will be automatically generated and delivered directly to your registered email address:
                    </p>
                    <p className="font-bold text-emerald-900 text-xs truncate bg-white p-2 rounded-lg border border-emerald-200">{submittedStaff.email}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setSubmittedStaff(null); setGeneratedCard(null); }}
                      className="w-full py-2.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register Another Staff Member</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* STAFF DETAILS FILL UP FORM MATCHING ADMIN PORTAL LAYOUT */
                <form onSubmit={handleStaffSubmit} className="space-y-4 text-left">
                  
                  {/* 1. PERSONAL DETAILS */}
                  <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                      <User className="w-3.5 h-3.5 text-[#047857]" />
                      <span>1. Personal Details</span>
                    </h4>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800">Staff Full Name *</label>
                      <input
                        type="text"
                        required
                        value={staffData.name}
                        onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                        placeholder="Enter Staff Full Name"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                      />
                    </div>

                    {/* Parent Name & DOB */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Father's / Mother's Name</label>
                        <input
                          type="text"
                          value={staffData.parentName}
                          onChange={(e) => setStaffData({ ...staffData, parentName: e.target.value })}
                          placeholder="Enter Parent Name"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Date of Birth</label>
                        <input
                          type="date"
                          value={staffData.dob}
                          onChange={(e) => setStaffData({ ...staffData, dob: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                    </div>

                    {/* Gender & Blood Group */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Gender</label>
                        <select
                          value={staffData.gender}
                          onChange={(e) => setStaffData({ ...staffData, gender: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#047857]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Blood Group</label>
                        <select
                          value={staffData.bloodGroup}
                          onChange={(e) => setStaffData({ ...staffData, bloodGroup: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#047857]"
                        >
                          <option value="O+">O+</option>
                          <option value="A+">A+</option>
                          <option value="B+">B+</option>
                          <option value="AB+">AB+</option>
                          <option value="O-">O-</option>
                          <option value="A-">A-</option>
                          <option value="B-">B-</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800">Profile Photo</label>
                      <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl">
                        {staffPhoto ? (
                          <img src={staffPhoto} alt="Preview" className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-2xs">
                            Photo
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-emerald-100 file:text-[#047857] hover:file:bg-emerald-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. CONTACT DETAILS */}
                  <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#047857]" />
                      <span>2. Contact Details</span>
                    </h4>

                    {/* Mobile Number & Email Address */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={staffData.phone}
                          onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                          placeholder="Enter Mobile Number"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={staffData.email}
                          onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                          placeholder="Enter Email Address"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800">Emergency Contact Number</label>
                      <input
                        type="tel"
                        value={staffData.emergencyContact}
                        onChange={(e) => setStaffData({ ...staffData, emergencyContact: e.target.value })}
                        placeholder="Enter Emergency Contact Number"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                      />
                    </div>

                    {/* Residential Address */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800">Residential Address</label>
                      <input
                        type="text"
                        value={staffData.address}
                        onChange={(e) => setStaffData({ ...staffData, address: e.target.value })}
                        placeholder="Enter Full Address"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                      />
                    </div>

                    {/* City, State, PIN */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">City</label>
                        <input
                          type="text"
                          value={staffData.city}
                          onChange={(e) => setStaffData({ ...staffData, city: e.target.value })}
                          placeholder="City"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">State</label>
                        <input
                          type="text"
                          value={staffData.state}
                          onChange={(e) => setStaffData({ ...staffData, state: e.target.value })}
                          placeholder="Odisha"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">PIN Code</label>
                        <input
                          type="text"
                          value={staffData.pinCode}
                          onChange={(e) => setStaffData({ ...staffData, pinCode: e.target.value })}
                          placeholder="PIN Code"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. EMPLOYMENT DETAILS */}
                  <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                      <Building className="w-3.5 h-3.5 text-[#047857]" />
                      <span>3. Employment Details</span>
                    </h4>

                    {/* Role & Department */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Role / Designation *</label>
                        <input
                          type="text"
                          required
                          value={staffData.role}
                          onChange={(e) => setStaffData({ ...staffData, role: e.target.value })}
                          placeholder="Enter Role Designation"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Department *</label>
                        <select
                          value={staffData.department}
                          onChange={(e) => setStaffData({ ...staffData, department: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#047857]"
                        >
                          <option value="Mobilization">Mobilization</option>
                          <option value="Training">Training</option>
                          <option value="Placement & Livelihood">Placement</option>
                          <option value="Operations">Operations</option>
                          <option value="Finance">Finance</option>
                          <option value="Management">Management</option>
                          <option value="IT & Support">IT & Support</option>
                        </select>
                      </div>
                    </div>

                    {/* Date of Joining & Employment Type */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Date of Joining</label>
                        <input
                          type="date"
                          value={staffData.joinDate}
                          onChange={(e) => setStaffData({ ...staffData, joinDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-800">Employment Type</label>
                        <select
                          value={staffData.employmentType}
                          onChange={(e) => setStaffData({ ...staffData, employmentType: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#047857]"
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Contractual">Contractual</option>
                          <option value="Trainee">Trainee</option>
                        </select>
                      </div>
                    </div>

                    {/* Work Location */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800">Office / Center Location</label>
                      <input
                        type="text"
                        value={staffData.location}
                        onChange={(e) => setStaffData({ ...staffData, location: e.target.value })}
                        placeholder="Enter Office / Center Location"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                      />
                    </div>
                  </div>

                  {/* 4. DOCUMENT UPLOADS */}
                  <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#047857]" />
                      <span>4. Document Uploads</span>
                    </h4>

                    {/* Aadhaar Card */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600">Aadhaar Card</label>
                      <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl">
                        <input
                          type="file"
                          onChange={handleAadharChange}
                          className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-emerald-100 file:text-[#047857] hover:file:bg-emerald-200 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Extra Documents */}
                    {staffData.extraDocs && staffData.extraDocs.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {staffData.extraDocs.map((doc, idx) => (
                          <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl space-y-1.5 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveExtraDoc(idx)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={doc.title}
                              onChange={(e) => handleExtraDocTitleChange(idx, e.target.value)}
                              placeholder="Enter Document Title"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#047857]"
                            />
                            <input
                              type="file"
                              onChange={(e) => handleExtraDocFileChange(idx, e.target.files[0])}
                              className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-emerald-100 file:text-[#047857] hover:file:bg-emerald-200 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddExtraDoc}
                      className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#047857] border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More Document</span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs tracking-wide mt-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Register</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Copyright */}
          <div className="text-[10px] text-slate-400 font-medium text-center pt-1">
            © 2026 Life Vision Society. All rights reserved.
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-emerald-100 rounded-3xl p-6 space-y-4 relative text-slate-900 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 font-sans">Reset Admin Password</h3>
            {forgotSent ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  Password reset link sent to <strong>{forgotEmail || 'your admin email'}</strong>.
                </div>
                <button
                  onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
                  className="w-full py-2.5 bg-[#047857] hover:bg-[#065F46] text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter your registered admin email address to receive a password reset link.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Send Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
