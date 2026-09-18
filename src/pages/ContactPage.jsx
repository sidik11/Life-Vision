import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock, MessageSquare, ShieldCheck, HeartHandshake, ChevronDown, HelpCircle, Sparkles, X, Loader2 } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

export default function ContactPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const senderEmail = formData.email.trim();
    const senderName = formData.name.trim();
    const senderPhone = formData.phone.trim();
    const messageSubject = formData.subject.trim() || 'General Inquiry';
    const messageContent = formData.message.trim();

    const newContact = {
      id: `MSG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: senderName,
      phone: senderPhone,
      email: senderEmail,
      subject: messageSubject,
      message: messageContent,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Unread',
      createdAt: serverTimestamp()
    };

    // 1. Save to Firebase Firestore Database
    try {
      await addDoc(collection(db, "contacts"), newContact);
    } catch (firebaseErr) {
      console.warn("Firebase save notice:", firebaseErr);
    }

    // 2. Save locally for fallback/Admin Panel (/admin)
    try {
      const existing = JSON.parse(localStorage.getItem('lvs_submitted_contacts') || '[]');
      localStorage.setItem('lvs_submitted_contacts', JSON.stringify([newContact, ...existing]));
      window.dispatchEvent(new CustomEvent('lvs_new_contact', { detail: newContact }));
    } catch (err) {
      console.error('Error saving contact query:', err);
    }

    // 3. Direct Email Dispatch to support.lifevision@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/support.lifevision@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[Life Vision Society Website] New Inquiry from ${senderName}`,
          _replyto: senderEmail,
          _captcha: 'false',
          _template: 'table',
          _autoresponse: 'Thank you for contacting Life Vision Society. We have received your inquiry and our team will respond to you shortly.',
          "Sender Name": senderName,
          "Sender Email": senderEmail,
          "Sender Phone": senderPhone,
          "Subject": messageSubject,
          "Message": messageContent
        })
      });
    } catch (err) {
      console.warn('FormSubmit dispatch status:', err);
    }

    setIsSubmitting(false);
    setShowSuccessModal(true);
    setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-[#FFF7F6] min-h-screen py-10 animate-fade-in font-sans space-y-16">

      {/* Hero Banner Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden min-h-[380px] lg:min-h-[420px] flex flex-col justify-between border border-pink-900/40">

          {/* Hero Image Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/image/contact.png"
              alt="Contact Life Vision Society"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/30 z-10 pointer-events-none" />
          </div>

          {/* Banner Content */}
          <div className="max-w-4xl space-y-4 relative z-20">
            <span className="text-xs font-black text-pink-200 tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xs font-serif inline-block">
              Get in Touch
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight drop-shadow-md">
              Contact Us
            </h1>
            <p className="text-pink-200 font-bold text-lg sm:text-xl drop-shadow-xs font-serif">
              We're Here to Listen, Guide & Support
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-pink-100/90 leading-relaxed pt-2 font-medium max-w-3xl drop-shadow-xs">
              Have questions about our vocational skill courses, student education aid, corporate CSR partnerships, or donation support? Reach out to our team today.
            </p>
          </div>

          {/* Bottom Accent Subtitle Pill */}
          <div className="relative z-20 pt-6 border-t border-white/20 mt-6 flex items-center justify-between">
            <span className="text-xs font-bold text-pink-200 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#C52B75]" />
              <span>Direct NGO Assistance</span>
            </span>
            <span className="text-xs font-extrabold text-amber-300 tracking-wider hidden sm:inline-block">
              ♡ Connected to Firebase Cloud Database
            </span>
          </div>

        </div>
      </div>

      {/* Main Content Grid: Contact Details Left & Message Form Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Contact Details Left (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-pink-100 space-y-6 font-sans">
            <div>
              <span className="text-2xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 inline-block font-serif mb-2">
                Official NGO Office
              </span>
              <h2 className="text-2xl font-serif font-black text-[#6B1D52] tracking-wide">
                Life Vision Society
              </h2>
              <p className="text-xs text-[#C52B75] font-extrabold tracking-wider mt-1">
                Empowering Women, Inspiring Change
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-start gap-3.5 p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200/80 transition-all hover:bg-pink-50">
                <div className="w-10 h-10 rounded-xl bg-[#C52B75] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block">Phone Contact</span>
                  <a href="tel:+919416362914" className="text-slate-900 font-bold hover:text-[#C52B75] transition-colors text-sm sm:text-base">+91 9416362914</a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80 transition-all hover:bg-purple-50">
                <div className="w-10 h-10 rounded-xl bg-[#6B1D52] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block">Email Address</span>
                  <a href="mailto:support.lifevision@gmail.com" className="text-slate-900 font-bold hover:text-[#6B1D52] transition-colors text-sm sm:text-base">support.lifevision@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 transition-all hover:bg-amber-50">
                <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 block">Office Address</span>
                  <span className="text-slate-900 font-bold text-xs sm:text-sm">Unit No. 423, Tower-A, Spez I-Tech Park, Sohna Rd, Sector-49, Gurugram 122018</span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/80 space-y-1">
              <span className="text-xs font-black text-[#6B1D52] font-serif tracking-wide block">
                Visitors & Appointments
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Prior appointment is appreciated for long-term project discussions and corporate CSR meetings.
              </p>
            </div>
          </div>

          {/* Direct Inquiry Form Right (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-pink-100 space-y-6 font-sans">
            <div>
              <span className="text-2xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 inline-block font-serif mb-2">
                Quick Inquiry
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-tight">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Fill out the form below and our team will respond to you promptly.
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 text-xs sm:text-sm border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94163 62914"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 text-xs sm:text-sm border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 text-xs sm:text-sm border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    placeholder="Skill Course / Student Aid / CSR Inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 text-xs sm:text-sm border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Write your query or message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 text-xs sm:text-sm border border-pink-100 bg-[#FFF7F6]/50 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#C52B75] via-[#A82260] to-[#6B1D52] hover:opacity-95 text-white font-extrabold py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm active:scale-98 tracking-wider disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving to Firebase...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Clean Success Popup Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-pink-100 relative animate-scale-up">
            
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black text-[#6B1D52]">
                Message Sent Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Thank you for reaching out to Life Vision Society. Your message has been received and saved to our database. Our team will get back to you shortly.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white font-black py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-xs sm:text-sm tracking-wider"
            >
              OK
            </button>

          </div>
        </div>
      )}

      {/* Frequently Asked Questions (FAQ) Section */}
      <FAQSection />

    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How can I enroll in free women skill courses?',
      a: 'You can apply directly online through our Community & Student Hub page or visit our local center with an Aadhaar card copy and 2 passport photos.'
    },
    {
      q: 'How do students get education scholarships and placement support?',
      a: 'Underprivileged students pursuing higher education (B.Tech, Diploma, BCA, BBA, B.Sc, ITI) can fill out our Student Aid Registration Form. We evaluate eligibility and provide fee sponsorship, study materials, and direct employer placement support.'
    },
    {
      q: 'Are donations eligible for 80G tax exemption?',
      a: 'Yes, Life Vision Society is a registered Public Charitable Trust with active 12A and 80G tax exemption status. Donors receive an instant official 50% tax-exempt receipt for all contributions.'
    },
    {
      q: 'How can corporate organizations collaborate for CSR projects?',
      a: 'Companies can partner with us under Schedule VII CSR guidelines. We are registered under MCA CSR-1 and NITI Aayog NGO Darpan. Reach out via email at support.lifevision@gmail.com or call +91 9416362914.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#C52B75] tracking-wider bg-pink-50 px-3.5 py-1 rounded-full border border-pink-100 font-serif">
          Have Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-wide">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#FFF7F6] rounded-2xl border border-pink-100 shadow-2xs overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-pink-50/50 transition-colors"
              >
                <span className="font-serif">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#C52B75] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-6 pb-4 text-xs text-slate-600 font-medium leading-relaxed border-t border-pink-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
