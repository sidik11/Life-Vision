import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, MapPin, CheckCircle2, Clock, Users, ArrowRight, ShieldCheck, FileText, Award, ChevronLeft, ChevronRight, ChevronDown, GraduationCap, Heart, Sparkles, Send, Briefcase } from 'lucide-react';
import StudentPlacementForm from '../components/StudentPlacementForm';

// 3D Sewing Machine Icon
const SewingMachine3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 19H21V21H3V19Z" fill="currentColor" opacity="0.4" />
    <path d="M5 19V10C5 7.79 6.79 6 9 6H17C18.66 6 20 7.34 20 9V14H15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="11" y="10" width="5" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17.5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 10H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3D Makeup Brush Icon
const BeautyBrush3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5 2.5L21.5 5.5L14 13L11 10L18.5 2.5Z" fill="currentColor" opacity="0.4" />
    <path d="M11 10L4 17C2.5 18.5 2.5 20.5 4 22C5.5 23.5 7.5 23.5 9 22L16 15L11 10Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 3.5L20.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="19" cy="4" r="1.2" fill="currentColor" />
  </svg>
);

// 3D Farm Sprout Icon
const AgriSprout3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22V10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 10C12 5.5 16 3 20 3C20.5 7.5 17.5 11.5 12 12" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14C12 10.5 8 8 4 8C3.5 12 6.5 15.5 12 16" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 3D Medical Cross Icon
const Healthcare3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7V13M9 10H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default function TrainingHubPage({ onOpenApply, onOpenStudentPlacement }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: '/image/youth empowerment.jpg',
      badge: 'Student Education & Scholarship Aid',
      title: 'College Scholarship & Job Placement Aid',
      subtitle: 'Helping poor students pay college fees, providing free study book kits, and connecting graduates with employers for real jobs.'
    },
    {
      image: '/image/Tailoring_training.png',
      badge: 'Women Skill & Sewing Toolkits',
      title: 'Free Tailoring Classes & Sewing Machines',
      subtitle: 'Practical training in garment stitching, blouse cutting, machine operation, and home business guidance for women.'
    },
    {
      image: '/image/Beautician.png',
      badge: 'Beauty & Wellness Academy',
      title: 'Free Beautician & Bridal Makeup Training',
      subtitle: 'Learn skincare, facial massage, bridal makeup, and hair care with a free starter beauty kit for salon jobs.'
    },
    {
      image: '/image/Healthcare&caregiving.png',
      badge: 'Village Health & Welfare',
      title: 'Free Village Doctor Checkup Camps',
      subtitle: 'Bringing free doctor consultations, preventive health advice, and free medicines to rural communities.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const availableCourses = [
    {
      title: 'Women Tailoring Livelihoods',
      image: '/image/Tailoring_training.png',
      icon: SewingMachine3DIcon,
      iconBg: 'bg-gradient-to-br from-pink-500 to-[#C52B75] text-white',
      duration: '15 Days',
      fee: 'Free Course',
      qualification: 'Open for All Women',
      seats: '30 Trainees / Batch',
      desc: '100% free sewing machine practice, blouse cutting, dress stitching, and boutique startup guidance. Graduates get a free sewing machine.',
      courseName: 'Tailoring & Stitching Training'
    },
    {
      title: 'Beautician & Salon Wellness',
      image: '/image/Beautician.png',
      icon: BeautyBrush3DIcon,
      iconBg: 'bg-gradient-to-br from-purple-500 to-[#6B1D52] text-white',
      duration: '15 Days',
      fee: 'Free Course',
      qualification: 'Open for All Women',
      seats: '30 Trainees / Batch',
      desc: 'Facial skincare, bridal makeup, hair styling, and salon work skills, complete with a free starter beauty toolkit.',
      courseName: 'Beautician & Wellness Training'
    },
    {
      title: 'Sustainable Organic Farming',
      image: '/image/Agriculture.png',
      icon: AgriSprout3DIcon,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-[#006B3C] text-white',
      duration: '3 Months',
      fee: 'Free Course',
      qualification: 'Farmers & Rural Youth',
      seats: '30 Trainees / Batch',
      desc: 'Organic crop farming, mushroom growing, natural fertilizer composting, and direct market selling guidance.',
      courseName: 'Agriculture & Farming Training'
    },
    {
      title: 'Community Healthcare & Caregiving',
      image: '/image/Healthcare&caregiving.png',
      icon: Healthcare3DIcon,
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white',
      duration: '3 Months',
      fee: 'Free Course',
      qualification: 'Basic Literacy',
      seats: '30 Trainees / Batch',
      desc: 'First aid care, elder caregiving, mother & child health education, and rural health camp coordination.',
      courseName: 'Healthcare Program'
    },
    {
      title: 'Tourism & Hospitality',
      image: '/image/Tourism & hospitality.png',
      icon: Briefcase,
      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-700 text-white',
      duration: '3 Months',
      fee: 'Free Course',
      qualification: '12th Pass',
      seats: '30 Trainees / Batch',
      desc: 'Front office operations, guest relations management, housekeeping standards, and travel tourism services.',
      courseName: 'Tourism & Hospitality Training'
    },
    {
      title: 'Food & Beverages',
      image: '/image/Food & Beverages.png',
      icon: Sparkles,
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-600 text-white',
      duration: '3 Months',
      fee: 'Free Course',
      qualification: '10th Pass',
      seats: '25 Trainees / Batch',
      desc: 'Culinary arts basics, food preparation, beverage service, hygiene standards, and catering industry training.',
      courseName: 'Food & Beverages Training'
    }
  ];

  const mapStateLocations = [
    { name: 'Odisha', top: '54%', left: '54%' },
    { name: 'Chhattisgarh', top: '48%', left: '46%' },
    { name: 'Jharkhand', top: '42%', left: '55%' },
    { name: 'Bihar', top: '35%', left: '56%' },
    { name: 'West Bengal', top: '45%', left: '62%' },
    { name: 'Assam', top: '34%', left: '74%' },
    { name: 'Madhya Pradesh', top: '46%', left: '40%' },
    { name: 'Rajasthan', top: '35%', left: '26%' },
    { name: 'Haryana', top: '25%', left: '32%' },
    { name: 'Kerala', top: '78%', left: '38%' },
    { name: 'Karnataka', top: '67%', left: '35%' },
    { name: 'Tamil Nadu', top: '76%', left: '43%' },
    { name: 'Arunachal Pradesh', top: '25%', left: '78%' },
    { name: 'Manipur', top: '40%', left: '79%' },
    { name: 'Meghalaya', top: '38%', left: '72%' },
    { name: 'Mizoram', top: '45%', left: '78%' },
    { name: 'Nagaland', top: '33%', left: '79%' },
    { name: 'Tripura', top: '43%', left: '74%' },
    { name: 'Sikkim', top: '30%', left: '65%' }
  ];

  return (
    <div className="bg-[#FFF7F6] min-h-screen py-10 animate-fade-in space-y-16 font-sans">

      {/* Auto-Slide Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[440px] flex flex-col justify-between p-8 sm:p-12 text-white border border-pink-900/40 group">

          <div className="absolute inset-0 z-0">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover object-center transition-all duration-700 transform scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none z-10" />
          </div>

          <button
            onClick={handlePrevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all duration-300 cursor-pointer border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all duration-300 cursor-pointer border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="max-w-3xl space-y-4 relative z-20 transition-all duration-500 pt-2">
            <span className="text-xs font-black text-amber-300 tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md inline-block font-serif">
              {heroSlides[currentSlide].badge}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-md font-serif">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-sm sm:text-base text-pink-100 font-medium leading-relaxed drop-shadow-xs max-w-2xl">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>

          <div className="relative z-20 pt-6 border-t border-white/20 mt-6 flex items-center justify-center">
            <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-md">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx
                    ? 'w-8 bg-amber-400 shadow-md ring-2 ring-amber-300/40'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 1. STUDENT SCHOLARSHIP & PLACEMENT SUPPORT (CLEAR OVERVIEW & APPLY ACTIONS) */}
      <section id="student-education-aid" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-100 shadow-xl space-y-8">
          
          {/* Card Overview Banner */}
          <div className="bg-gradient-to-r from-[#4A1039] via-[#6B1D52] to-[#8C2366] text-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
            
            <div className="space-y-3 max-w-3xl text-center lg:text-left z-10">
              <span className="text-xs font-black text-amber-300 tracking-wider bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5 font-serif">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Student Education & Scholarship Aid</span>
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
                College Scholarship & Job Placement Support
              </h2>

              <p className="text-xs sm:text-sm text-pink-100 font-medium leading-relaxed">
                At Life Vision Society, we help needy students pay college tuition fees, provide free textbooks and study kits, give higher education scholarships, and connect graduates with companies for real jobs.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-pink-200 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" /> Free College Tuition Aid
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" /> Free Books & Study Kits
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" /> Direct Job Placement Support
                </span>
              </div>
            </div>

            {/* Apply Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 z-10 w-full lg:w-auto">
              <button
                onClick={() => {
                  if (onOpenStudentPlacement) onOpenStudentPlacement();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black h-13 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 border border-amber-200"
              >
                <GraduationCap className="w-4 h-4 text-[#C52B75]" />
                <span>Apply for Student Aid Now</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FREE WOMEN VOCATIONAL SKILL TOOLKITS */}
      <section id="available-courses" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C52B75] tracking-wider bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-100 font-serif">
            Free Skill Training & Toolkits
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-wide">
            100% Free Skill Initiatives
          </h2>
          <p className="text-slate-600 text-sm font-medium">
            All practical skill classes are 100% free with work toolkits provided to certified trainees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {availableCourses.map((course, idx) => {
            const CourseIcon = course.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="space-y-4">
                  <div className="h-44 rounded-2xl overflow-hidden relative border border-gray-100 shadow-xs">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-serif font-black text-white tracking-wider drop-shadow-md">
                        {course.title}
                      </span>
                      {CourseIcon && (
                        <div className={`w-8 h-8 rounded-xl ${course.iconBg} flex items-center justify-center shrink-0 shadow-md border border-white/30`}>
                          <CourseIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <span className="absolute top-3 right-3 text-[10px] font-black text-emerald-800 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-200">
                      {course.fee}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {course.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-semibold">
                    <div><span className="text-slate-400 font-normal">Duration: </span>{course.duration}</div>
                    <div><span className="text-slate-400 font-normal">Fee: </span>{course.fee}</div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenApply(course.courseName)}
                  className="w-full bg-gradient-to-r from-[#C52B75] to-[#A82260] hover:opacity-90 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply For Training</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. NGO WELFARE COVERAGE MAP */}
      <section id="training-centers" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C52B75] tracking-wider bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-100 font-serif inline-block uppercase">
            Our Reach & Coverage
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-wide">
            NGO Welfare Reach Across India
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto">
            Our social welfare programs, student scholarships, and health drives actively serve rural and semi-urban communities across India.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-8 border border-pink-100 shadow-md flex items-center justify-center">
          <div className="relative w-full max-w-4xl">
            <img 
              src="/image/map.png" 
              alt="India Map - NGO Welfare Reach" 
              className="w-full h-auto object-contain rounded-2xl drop-shadow-md"
            />

            {mapStateLocations.map((st, idx) => (
              <div 
                key={idx}
                style={{ top: st.top, left: st.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-pink-300 shadow-lg text-[10px] sm:text-xs font-black text-slate-900 hover:scale-115 transition-all cursor-default select-none"
              >
                <img 
                  src="/image/location_pin_3d.png" 
                  alt="3D Location Pin" 
                  className="w-4 h-5 sm:w-5 sm:h-6 object-contain shrink-0 drop-shadow-md" 
                />
                <span className="tracking-tight text-slate-900 font-black whitespace-nowrap">{st.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BENEFICIARY ELIGIBILITY & REQUIREMENTS */}
      <section id="eligibility-requirements" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-pink-100 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 font-serif">
              Who Can Apply?
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-wide">
              Simple Beneficiary Criteria
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              We keep application requirements simple so every needy student and woman can get help easily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#C52B75] mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Students & Women</h3>
              <p className="text-xs text-slate-600 font-medium">Open for needy students and women seeking self-reliance.</p>
            </div>

            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#C52B75] mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">100% Free NGO Aid</h3>
              <p className="text-xs text-slate-600 font-medium">Free education aid & skill toolkits with zero hidden fees.</p>
            </div>

            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#C52B75] mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Job Matchmaking</h3>
              <p className="text-xs text-slate-600 font-medium">Connecting graduates with employers and home business guidance.</p>
            </div>

            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#C52B75] mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Basic Documents</h3>
              <p className="text-xs text-slate-600 font-medium">Aadhaar card copy & 2 photos required for registration.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
