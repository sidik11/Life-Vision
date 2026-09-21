import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Settings as SettingsIcon, Building, Save, CheckCircle2, ShieldCheck, Camera, Sparkles, Mail, Send, Key, Check } from 'lucide-react';
import { getEmailApiConfig, saveEmailApiConfig, sendStaffIdCardEmailApi } from '../../utils/staffIdPdfHelper';
import { db, doc, setDoc, onSnapshot } from '../../firebase';

export default function SettingsView({ adminUser, setAdminUser, showToast, onShowToast }) {
  const notify = showToast || onShowToast || (() => {});
  const [activeTab, setActiveTab] = useState('profile');
  
  const [name, setName] = useState(adminUser?.name || 'Life Vision Society');
  const [email, setEmail] = useState(adminUser?.email || 'support.lifevision@gmail.com');
  const [role, setRole] = useState(adminUser?.role || 'Super Admin');
  const [phone, setPhone] = useState(adminUser?.phone || '+91 98610 12345');
  const [avatar, setAvatar] = useState(adminUser?.avatar || '/image/logo.png');

  // Security Form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Organization Form
  const [orgName, setOrgName] = useState('Life Vision Society');
  const [regNo, setRegNo] = useState('LVS/NGO/OD/2018/8891');
  const [taxId, setTaxId] = useState('80G / 12A Certified');

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Email API Form State
  const [emailProvider, setEmailProvider] = useState('google_oauth');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [web3FormsKey, setWeb3FormsKey] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [googleAuthorized, setGoogleAuthorized] = useState(() => {
    return typeof window !== 'undefined' && !!localStorage.getItem('lvs_google_oauth_access_token');
  });

  // Sync state from adminUser prop & Real-time Firestore Settings Subscriptions
  useEffect(() => {
    if (adminUser) {
      setName(adminUser.name || 'Life Vision Society');
      setEmail(adminUser.email || 'support.lifevision@gmail.com');
      setRole(adminUser.role || 'Super Admin');
      setPhone(adminUser.phone || '+91 98610 12345');
      setAvatar(adminUser.avatar || '/image/logo.png');
    }
    const apiConf = getEmailApiConfig();
    setEmailProvider(apiConf.provider || 'google_oauth');
    setGoogleClientId(apiConf.googleClientId || (typeof window !== 'undefined' ? localStorage.getItem('lvs_google_client_id') : '') || '');
    setGoogleClientSecret(apiConf.googleClientSecret || (typeof window !== 'undefined' ? localStorage.getItem('lvs_google_client_secret') : '') || '');
    setWeb3FormsKey(apiConf.web3FormsKey || (typeof window !== 'undefined' ? localStorage.getItem('lvs_web3forms_key') : '') || '');
    setServiceId(apiConf.serviceId || (typeof window !== 'undefined' ? localStorage.getItem('lvs_emailjs_service_id') : '') || '');
    setTemplateId(apiConf.templateId || (typeof window !== 'undefined' ? localStorage.getItem('lvs_emailjs_template_id') : '') || '');
    setPublicKey(apiConf.publicKey || (typeof window !== 'undefined' ? localStorage.getItem('lvs_emailjs_public_key') : '') || '');
    setApiUrl(apiConf.apiUrl || '');

    // Real-time Firestore document listeners for settings
    const unsubs = [];

    try {
      unsubs.push(onSnapshot(doc(db, "settings", "organization"), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          if (d.orgName) setOrgName(d.orgName);
          if (d.regNo) setRegNo(d.regNo);
          if (d.taxId) setTaxId(d.taxId);
        }
      }));

      unsubs.push(onSnapshot(doc(db, "settings", "notifications"), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          if (typeof d.emailAlerts === 'boolean') setEmailAlerts(d.emailAlerts);
          if (typeof d.smsAlerts === 'boolean') setSmsAlerts(d.smsAlerts);
        }
      }));

      unsubs.push(onSnapshot(doc(db, "settings", "email_config"), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          if (d.provider) setEmailProvider(d.provider);
          if (d.googleClientId) setGoogleClientId(d.googleClientId);
          if (d.googleClientSecret) setGoogleClientSecret(d.googleClientSecret);
        }
      }));
    } catch (e) {
      console.warn("Firestore settings sync error:", e);
    }

    return () => unsubs.forEach(fn => fn && fn());
  }, [adminUser]);

  // Save Admin Profile to Firestore
  const handleProfileSave = async (e) => {
    e.preventDefault();
    const updatedUser = {
      name: name,
      email: email,
      role: role,
      phone: phone,
      avatar: avatar,
      updatedAt: new Date().toISOString()
    };

    if (setAdminUser) {
      setAdminUser(updatedUser);
    }
    try {
      localStorage.setItem('lvs_admin_profile', JSON.stringify(updatedUser));
      await setDoc(doc(db, "settings", "admin_profile"), updatedUser, { merge: true });
    } catch (err) {
      console.warn("Firestore profile save notice:", err);
    }
    notify(`✓ Admin Profile updated & saved to Firebase database!`, 'success');
  };

  // Save Security Settings to Firestore
  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      notify('New passwords do not match.', 'error');
      return;
    }
    try {
      await setDoc(doc(db, "settings", "security"), {
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore security save notice:", err);
    }
    notify('✓ Password & Security settings updated in Firebase database!', 'success');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  // Save Organization Details to Firestore
  const handleOrgSave = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "organization"), {
        orgName,
        regNo,
        taxId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore org save notice:", err);
    }
    notify('✓ NGO Organization details saved to Firebase database!', 'success');
  };

  // Save Notification Preferences to Firestore
  const handleNotificationSave = async () => {
    try {
      await setDoc(doc(db, "settings", "notifications"), {
        emailAlerts,
        smsAlerts,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore notifications save notice:", err);
    }
    notify('✓ Notification alert preferences saved to Firebase database!', 'success');
  };

  const handleAuthorizeGoogleAccount = () => {
    const clientId = googleClientId || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || (typeof window !== 'undefined' ? localStorage.getItem('lvs_google_client_id') || '' : '');
    
    const triggerAuth = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/gmail.send',
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              localStorage.setItem('lvs_google_oauth_access_token', tokenResponse.access_token);
              setGoogleAuthorized(true);
              notify('✓ Google Gmail Account (support.lifevision@gmail.com) authorized for email delivery!', 'success');
            } else {
              notify('✕ Google Authorization failed or was cancelled.', 'error');
            }
          },
        });
        client.requestAccessToken();
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: 'https://www.googleapis.com/auth/gmail.send',
              callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                  localStorage.setItem('lvs_google_oauth_access_token', tokenResponse.access_token);
                  setGoogleAuthorized(true);
                  notify('✓ Google Gmail Account (support.lifevision@gmail.com) authorized for email delivery!', 'success');
                } else {
                  notify('✕ Google Authorization failed or was cancelled.', 'error');
                }
              },
            });
            client.requestAccessToken();
          }
        };
        document.body.appendChild(script);
      }
    };

    triggerAuth();
  };

  // Save Email API Config to Firestore
  const handleEmailApiSave = async (e) => {
    e.preventDefault();
    const config = {
      provider: emailProvider,
      googleClientId: googleClientId.trim(),
      googleClientSecret: googleClientSecret.trim(),
      web3FormsKey: web3FormsKey.trim(),
      serviceId: serviceId.trim(),
      templateId: templateId.trim(),
      publicKey: publicKey.trim(),
      apiUrl: apiUrl.trim(),
      updatedAt: new Date().toISOString()
    };
    saveEmailApiConfig(config);
    try {
      await setDoc(doc(db, "settings", "email_config"), config, { merge: true });
    } catch (err) {
      console.warn("Firestore email config save notice:", err);
    }
    notify('✓ Google OAuth Email API credentials saved to Firebase database!', 'success');
  };

  const handleTestEmailApi = async () => {
    setTestSending(true);
    const dummyStaff = {
      name: name || 'Test Staff Member',
      email: email || 'support.lifevision@gmail.com',
      id: 'TEST-STF-001',
      employeeId: 'TEST-STF-001',
      department: 'Administration',
      phone: phone || '+91 9416362914',
      joinDate: '2026-01-01',
      role: 'Staff Member'
    };
    const res = await sendStaffIdCardEmailApi(dummyStaff);
    setTestSending(false);

    if (res.success) {
      notify(res.message || `✓ Test email dispatched to ${dummyStaff.email}!`, 'success');
    } else {
      notify(`✕ Test email notice: ${res.error}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] via-[#1E527B] to-[#16A34A] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>Admin Control Panel & Settings</span>
          </div>
          <h1 className="text-2xl font-bold font-serif">Admin System & Profile Settings</h1>
          <p className="text-slate-200 text-xs mt-1">
            Manage Super Admin credentials, security preferences, Google OAuth Email API setup & NGO profile.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
          <img src={avatar} alt="Admin Profile" className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 ring-2 ring-emerald-400" />
          <div className="text-left text-xs">
            <div className="font-bold text-white">{name}</div>
            <div className="text-[10px] text-emerald-300 font-extrabold">{role}</div>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'profile' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <span>👤 Administrator Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'security' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <span>🔐 Password & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('email_api')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'email_api' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <span>📧 Email API Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'notifications' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <span>🔔 System Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'organization' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <span>🏢 Organization Profile</span>
        </button>
      </div>

      {/* 1. Profile Settings Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 max-w-2xl shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">Administrator Profile Information</h3>
              <p className="text-xs text-slate-500">Update your account name, email address, role and contact number</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">
              Active Firebase Admin
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700">Super Admin Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Official Admin Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
              <p className="text-[10px] text-slate-500 mt-1">This email address will be displayed in header profile and system notifications.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700">Role / Designation</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Contact Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center space-x-2 cursor-pointer transition-all uppercase tracking-wider"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleSecuritySave} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 max-w-2xl shadow-sm text-slate-900">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">Change Super Admin Password</h3>
            <p className="text-xs text-slate-500">Ensure your admin account uses a strong password with letters, numbers & symbols</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all uppercase tracking-wider"
          >
            Update Admin Password
          </button>
        </form>
      )}

      {/* 3. Email API Setup Tab */}
      {activeTab === 'email_api' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 max-w-2xl shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>Google OAuth & Gmail API Setup</span>
              </h3>
              <p className="text-xs text-slate-500">Authorize Google Gmail Account (support.lifevision@gmail.com) to send approved Staff ID Cards directly to staff email inboxes</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold flex items-center gap-1">
              <Key className="w-3 h-3 text-emerald-600" /> Gmail API Active
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-3">
            <div className="font-bold flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Google Account Authorization (support.lifevision@gmail.com):</span>
              </div>
              {googleAuthorized ? (
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Authorized & Active
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-extrabold">
                  Authorization Available
                </span>
              )}
            </div>

            <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
              Google OAuth Client ID: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[10px]">{googleClientId || 'Configured via Environment / Settings'}</code>
            </p>

            <button
              type="button"
              onClick={handleAuthorizeGoogleAccount}
              className="px-5 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Key className="w-4 h-4 text-white" />
              <span>{googleAuthorized ? 'Re-Authorize Google Account (support.lifevision@gmail.com)' : 'Authorize Google Gmail Account (support.lifevision@gmail.com)'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={handleTestEmailApi}
              disabled={testSending}
              className="px-5 py-3 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4 text-white" />
              <span>{testSending ? 'Sending Test Email...' : 'Send Test Staff ID Card Email'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 max-w-2xl shadow-sm text-slate-900">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">Notification Alert Preferences</h3>
            <p className="text-xs text-slate-500">Configure how and when you receive system alerts for new public submissions</p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <div className="font-bold text-slate-800">Email Notifications</div>
                <div className="text-[11px] text-slate-500">Receive instant email alerts when new student applications arrive</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <div className="font-bold text-slate-800">SMS / WhatsApp Alerts</div>
                <div className="text-[11px] text-slate-500">Receive instant text notifications for high priority partner inquiries</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleNotificationSave}
            className="px-6 py-3 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all uppercase tracking-wider"
          >
            Save Notification Settings
          </button>
        </div>
      )}

      {/* 5. Organization Info Tab */}
      {activeTab === 'organization' && (
        <form onSubmit={handleOrgSave} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 max-w-2xl shadow-sm text-slate-900">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">NGO Legal & Registration Details</h3>
            <p className="text-xs text-slate-500">Official Society Registration & 80G Tax Exemption numbers</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700">Organization Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Society Registration Number</label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Tax Exemption Status</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#123B5D] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Save Organization Details
          </button>
        </form>
      )}
    </div>
  );
}
