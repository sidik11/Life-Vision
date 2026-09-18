import React from 'react';
import { ArrowRight, Heart, ShieldCheck, GraduationCap, Briefcase, Sparkles } from 'lucide-react';

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

// 3D Medical Cross Heart Icon
const Healthcare3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7V13M9 10H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default function TrainingPrograms({ onOpenApply, onOpenDonate, onOpenStudentPlacement, setActiveSection, limit }) {
  const programs = [
    {
      id: 'tailoring',
      targetId: 'tailoring-training',
      title: 'Women Tailoring & Stitching Training',
      icon: SewingMachine3DIcon,
      iconBg: 'bg-gradient-to-br from-pink-500 to-[#C52B75] text-white shadow-pink-500/30',
      image: '/image/Tailoring_training.png',
      badge: 'Free Skill Course',
      description: 'Comprehensive practical tailoring classes covering pattern drafting, garment cutting, dress stitching, and boutique trade skills.',
      courseName: 'Tailoring & Stitching Training'
    },
    {
      id: 'beautician',
      targetId: 'beautician-training',
      title: 'Beautician & Salon Wellness Training',
      icon: BeautyBrush3DIcon,
      iconBg: 'bg-gradient-to-br from-purple-500 to-[#6B1D52] text-white shadow-purple-500/30',
      image: '/image/Beautician.png',
      badge: 'Free Skill Course',
      description: 'Practical skincare routines, facial care, bridal makeup techniques, hair styling, and salon work training for women.',
      courseName: 'Beautician & Wellness Training'
    },
    {
      id: 'agriculture',
      targetId: 'agriculture-training',
      title: 'Sustainable Agriculture Training',
      icon: AgriSprout3DIcon,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-[#006B3C] text-white shadow-emerald-500/30',
      image: '/image/Agriculture.png',
      badge: 'Agri Skill Course',
      description: 'Practical training for farmers in organic agriculture, mushroom cultivation, natural composting, and crop management.',
      courseName: 'Agriculture & Farming Training'
    },
    {
      id: 'healthcare',
      targetId: 'healthcare-programs',
      title: 'Community Healthcare & Nursing Training',
      icon: Healthcare3DIcon,
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/30',
      image: '/image/Healthcare&caregiving.png',
      badge: 'Healthcare Course',
      description: 'Practical training in first aid care, patient caregiving, maternal-child health literacy, and village healthcare assistance.',
      courseName: 'Healthcare Program'
    },
    {
      id: 'tourism',
      targetId: 'tourism-hospitality',
      title: 'Tourism & Hospitality Training',
      icon: Briefcase,
      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-teal-500/30',
      image: '/image/Tourism & hospitality.png',
      badge: 'Hospitality Course',
      description: 'Front office management, guest relations, housekeeping standards, and travel tourism operations.',
      courseName: 'Tourism & Hospitality Training'
    },
    {
      id: 'food',
      targetId: 'food-beverages',
      title: 'Food & Beverages Training',
      icon: Sparkles,
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-orange-500/30',
      image: '/image/Food & Beverages.png',
      badge: 'Culinary Course',
      description: 'Basic culinary arts, food safety & hygiene, beverage serving, catering operations, and kitchen management.',
      courseName: 'Food & Beverages Training'
    }
  ];

  const displayedPrograms = limit ? programs.slice(0, limit) : programs;

  const handleKnowMore = (prog) => {
    if (prog.isStudentAid) {
      if (setActiveSection) setActiveSection('training', 'student-education-aid');
      return;
    }
    if (setActiveSection) {
      setActiveSection('programs', prog.targetId);
    }
  };

  return (
    <section id="about" className="py-14 bg-gradient-to-b from-[#FFF7F6] via-white to-[#FFF7F6]/60 border-b border-pink-100/60 font-sans">
      <div id="training" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Introduction */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center justify-center gap-2 text-[#C52B75]">
            <span className="text-[#C52B75] text-sm font-bold">❖ ❖</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-wide text-[#6B1D52]">
              Our Welfare Causes & Free Training Programs
            </h2>
            <span className="text-[#C52B75] text-sm font-bold">❖ ❖</span>
          </div>

          <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            We offer 100% free skill courses for women, sponsor student tuition fees & scholarships, and provide practical healthcare training courses.
          </p>

          <div className="inline-flex items-center gap-2 bg-pink-50 text-[#C52B75] text-xs sm:text-sm font-bold px-5 py-2 rounded-full border border-pink-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#C52B75]" />
            <span>All training courses are 100% free for needy candidates. Zero hidden fees.</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className={limit === 4 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"}>
          {displayedPrograms.map((prog) => {
            const IconComp = prog.icon;
            return (
              <div 
                key={prog.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-pink-100/80 hover:border-pink-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Picture Banner with 3D Icon Badge */}
                  <div className="h-48 sm:h-52 overflow-hidden relative">
                    <img 
                      src={prog.image} 
                      alt={prog.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />
                    
                    {/* Top Right 3D Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/80 shadow-md">
                      <span className="text-[10px] font-black tracking-wider text-[#6B1D52]">
                        {prog.badge}
                      </span>
                    </div>

                    {/* Bottom Card Title & 3D Icon */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="text-[#FFF7F6] text-xs font-black tracking-wider font-serif drop-shadow-md">
                        {prog.title}
                      </span>
                      <div className={`w-9 h-9 rounded-2xl ${prog.iconBg} flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/30`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-5">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {prog.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleKnowMore(prog)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span>Read Program Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {onOpenDonate && (
                    <button
                      onClick={onOpenDonate}
                      className="bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black py-2.5 px-3 rounded-2xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer text-xs shrink-0"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#C52B75] text-[#C52B75]" />
                      <span>Support</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View More Courses Button */}
        {limit && (
          <div className="text-center pt-10">
            <button
              onClick={() => {
                if (setActiveSection) setActiveSection('training', 'available-courses');
              }}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#C52B75] via-[#A82260] to-[#6B1D52] hover:from-[#A82260] hover:to-[#4A1039] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-pink-300/40 hover:scale-105"
            >
              <span>View More Courses & Initiatives</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
