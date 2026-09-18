import React, { useState, useEffect } from 'react';
import { Users, Scissors, Sparkles, Sprout, HeartPulse, Briefcase, Rocket, ShieldCheck, CheckCircle2, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Heart, Handshake } from 'lucide-react';

// 3D Sewing Machine Icon
const SewingMachine3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 19H21V21H3V19Z" fill="currentColor" opacity="0.4" />
    <path d="M5 19V10C5 7.79 6.79 6 9 6H17C18.66 6 20 7.34 20 9V14H15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="11" y="10" width="5" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17.5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 13H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3D Makeup Brush Icon
const BeautyBrush3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5 2.5L21.5 5.5L14 13L11 10L18.5 2.5Z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// 3D Healthcare Icon
const Healthcare3DIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7V13M9 10H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default function ProgramsPage({ onOpenApply, onOpenDonate }) {
  const [heroIndex, setHeroIndex] = useState(0);

  const heroImages = [
    '/image/women empowerment.jpg',
    '/image/livelehood.jpg',
    '/image/Entrepreneurship Support.jpg',
    '/image/youth empowerment.jpg',
    '/image/Tailoring_training.png',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const initiativesList = [
    {
      id: 'women-empowerment',
      icon: ShieldCheck,
      title: 'Women Empowerment & Financial Autonomy',
      subtitle: 'Self-Help Groups, Skill Sponsorship & Leadership',
      color: 'bg-gradient-to-br from-pink-500 to-[#C52B75] text-white shadow-pink-500/30',
      image: '/image/women empowerment.jpg',
      problem: 'Many rural women lack financial independence, formal trade skills, and leadership opportunities, keeping them dependent.',
      solution: 'We organize community self-help groups, fund 100% free tailoring and artisan training, and mentor women to build sustainable home micro-businesses.',
      points: ['Self-Help Group (SHG) Mentorship', '100% Sponsored Skill Toolkits', 'Gender Rights & Awareness Drives', 'Micro-Loan & Subsidy Assistance'],
      hasApply: true,
      courseName: 'Tailoring & Stitching Training'
    },
    {
      id: 'tailoring-training',
      icon: SewingMachine3DIcon,
      title: 'Women Vocational Tailoring Livelihoods',
      iconBg: 'Sewing Lab & Boutique Incubation',
      color: 'bg-gradient-to-br from-pink-600 to-[#6B1D52] text-white shadow-pink-600/30',
      image: '/image/Tailoring_training.png',
      problem: 'Underprivileged women often cannot afford private tailoring institute fees, preventing them from earning a respectable livelihood.',
      solution: 'Life Vision Society provides free sewing machines, industrial stitching practice, pattern cutting, and boutique startup mentorship.',
      points: ['100% Free Hands-on Sewing Practice', 'Industrial Machine Operations', 'Garment Pattern Drafting', 'Self-Employment Boutique Setup'],
      hasApply: true,
      courseName: 'Tailoring & Stitching Training'
    },
    {
      id: 'beautician-training',
      icon: BeautyBrush3DIcon,
      title: 'Beautician & Salon Wellness Initiative',
      iconBg: 'Professional Skincare & Bridal Academy',
      color: 'bg-gradient-to-br from-purple-500 to-[#6B1D52] text-white shadow-purple-500/30',
      image: '/image/Beautician.png',
      problem: 'Commercial beauty courses are cost-prohibitive for young women from low-income families seeking salon jobs or home parlors.',
      solution: 'Our NGO supplies complete beauty toolkits, professional skincare modules, and placement assistance with commercial salons.',
      points: ['Bridal & Event Makeup Techniques', 'Professional Skincare & Demos', 'Salon Hygiene Standards', 'Commercial Salon Placements'],
      hasApply: true,
      courseName: 'Beautician & Wellness Training'
    },
    {
      id: 'healthcare-programs',
      icon: Healthcare3DIcon,
      title: 'Rural Healthcare & Community Medical Camps',
      iconBg: 'Free Medical Camps & Caregiver Training',
      color: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/30',
      image: '/image/Healthcare&caregiving.png',
      problem: 'Remote villages often lack basic health checkups, preventive medical advice, and maternal healthcare awareness.',
      solution: 'We organize free doctor consultation camps, distribute hygiene kits, and train community health aides for home caregiving.',
      points: ['Free Medical Doctor Camps', 'Maternal & Child Hygiene Drives', 'Home Health Aide Skills', 'Essential Medicine Distribution'],
      courseName: 'Healthcare Program'
    },
    {
      id: 'agriculture-training',
      icon: AgriSprout3DIcon,
      title: 'Sustainable Agriculture & Organic Livelihoods',
      iconBg: 'Agri-Welfare & Farmers Mentorship',
      color: 'bg-gradient-to-br from-emerald-500 to-[#006B3C] text-white shadow-emerald-500/30',
      image: '/image/Agriculture.png',
      problem: 'Small farming households face declining soil health, high fertilizer costs, and lack of value-added crop techniques.',
      solution: 'We train farmers and rural women in organic bio-fertilizers, mushroom cultivation, vermicomposting, and direct market linkage.',
      points: ['Mushroom Farming & Harvest', 'Organic Bio-Fertilizers', 'Kitchen Gardens for Nutrition', 'Direct Market Produce Sales'],
      hasApply: true,
      courseName: 'Agriculture & Farming Training'
    },
    {
      id: 'youth-empowerment',
      icon: Users,
      title: 'Youth Digital Literacy & Career Readiness',
      iconBg: 'Digital Readiness & Placement Support',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
      image: '/image/youth empowerment.jpg',
      problem: 'Unemployed rural youth lack computer literacy and soft skills required for modern service-sector jobs.',
      solution: 'We offer basic digital skills workshops, interview coaching, communication training, and employer matchmaking drives.',
      points: ['Computer & Digital Literacy', 'Soft Skills & Spoken English', 'Interview & Resume Workshops', 'Job & Apprenticeship Matching']
    }
  ];

  return (
    <div className="bg-[#FFF7F6] min-h-screen py-10 animate-fade-in font-sans space-y-16">

      {/* Page Banner Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden min-h-[380px] lg:min-h-[420px] flex flex-col justify-between border border-pink-900/40">

          {/* Background Images Carousel */}
          <div className="absolute inset-0 z-0">
            {heroImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === heroIndex ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={img}
                  alt={`Initiatives Hero Slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent z-10 pointer-events-none" />
          </div>

          {/* Carousel Arrows */}
          <button
            onClick={() => setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all duration-300 cursor-pointer border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setHeroIndex((prev) => (prev + 1) % heroImages.length)}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md transition-all duration-300 cursor-pointer border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Banner Content */}
          <div className="max-w-4xl space-y-4 relative z-20">
            <span className="text-xs font-black text-pink-200 tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xs font-serif inline-block">
              Our Causes & Welfare Initiatives
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight drop-shadow-md">
              Community Welfare Initiatives
            </h1>
            <p className="text-pink-200 font-bold text-lg sm:text-xl drop-shadow-xs font-serif">
              Creating Measurable Social Impact across Rural & Semi-Urban India
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-pink-100/90 leading-relaxed pt-2 font-medium max-w-3xl drop-shadow-xs">
              Every initiative at Life Vision Society addresses a core social challenge—providing fully-sponsored skill toolkits, healthcare drives, and dignified livelihood support.
            </p>
          </div>

          <div className="relative z-20 flex items-center justify-center pt-6 border-t border-white/20 mt-6">
            <div className="flex items-center justify-center gap-2.5">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${heroIndex === idx ? 'w-10 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  aria-label={`Jump to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {initiativesList.map((item, idx) => {
          const IconComp = item.icon;
          const isImageLeft = idx % 2 === 0;

          return (
            <section
              key={item.id}
              id={item.id}
              className="scroll-mt-28 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-pink-100/80 shadow-md hover:shadow-lg transition-all space-y-6 font-sans"
            >
              <div className={`flex flex-col lg:flex-row ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>

                {/* Picture Column */}
                <div className="w-full lg:w-1/2 shrink-0">
                  <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-pink-100 group h-64 sm:h-80 lg:h-[340px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                      <span className="text-xs font-serif font-black tracking-wider bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/30">
                        {item.title}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shadow-lg border border-white/40 transform group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-5 h-5 text-white filter drop-shadow-xs" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Column */}
                <div className="w-full lg:w-1/2 space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shrink-0 border border-white/40 shadow-lg`}>
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#C52B75] tracking-wider block font-serif">
                          {item.subtitle}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-wide leading-tight">
                          {item.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Problem vs Intervention */}
                  <div className="space-y-3 bg-[#FFF7F6] p-4 rounded-2xl border border-pink-100/80 shadow-2xs">
                    <div>
                      <span className="text-[11px] font-black text-[#C52B75] tracking-wider uppercase block font-serif">The Social Challenge</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">{item.problem}</p>
                    </div>
                    <div className="pt-2 border-t border-pink-200/60">
                      <span className="text-[11px] font-black text-[#6B1D52] tracking-wider uppercase block font-serif">Our NGO Intervention</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">{item.solution}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold tracking-wider text-slate-900 flex items-center gap-1.5 font-serif">
                      <BookOpen className="w-4 h-4 text-[#C52B75]" />
                      <span>Initiative Pillars & Key Outcomes</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.points.map((pt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-pink-100 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-[#C52B75] shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-3">
                    {onOpenDonate && (
                      <button
                        onClick={onOpenDonate}
                        className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 border border-amber-200"
                      >
                        <Heart className="w-4 h-4 fill-[#C52B75] text-[#C52B75]" />
                        <span>Support Cause</span>
                      </button>
                    )}

                    {item.hasApply && onOpenApply && (
                      <button
                        onClick={() => onOpenApply(item.courseName)}
                        className="bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <span>Apply For Training</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            </section>
          );
        })}
      </div>

    </div>
  );
}
