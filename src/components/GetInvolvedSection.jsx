import React from 'react';
import { Heart, GraduationCap, ArrowRight, ShieldCheck, Sparkles, HeartPulse } from 'lucide-react';

export default function GetInvolvedSection({ onOpenDonate, onOpenVolunteer, onOpenCsr, setActiveSection }) {
  const pillars = [
    {
      id: 'donate',
      badge: 'Immediate Help',
      subtitle: '80G Tax Exemption',
      title: 'Sponsor & Donate',
      desc: 'Your donation directly funds free vocational courses for women, study materials for students, and healthcare training. Get an instant 50% tax deduction under Section 80G.',
      actionText: 'Donate Now',
      icon: Heart,
      iconBg: 'bg-pink-100 text-[#C52B75]',
      borderHover: 'hover:border-[#C52B75]',
      buttonBg: 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black',
      onClick: onOpenDonate
    },
    {
      id: 'student-aid',
      badge: 'Student Education',
      subtitle: 'Scholarships & Books',
      title: 'Student Study & Job Placement',
      desc: 'We help needy students pay college fees, receive free textbooks, get scholarships, and connect with employers for real jobs after graduation.',
      actionText: 'Explore Student Aid',
      icon: GraduationCap,
      iconBg: 'bg-purple-100 text-[#6B1D52]',
      borderHover: 'hover:border-[#6B1D52]',
      buttonBg: 'bg-gradient-to-r from-[#6B1D52] to-[#4A1039] text-white',
      onClick: () => {
        if (setActiveSection) setActiveSection('training', 'student-education-aid');
      }
    },
    {
      id: 'women-work',
      badge: 'Self-Reliance',
      subtitle: 'Free Skill Courses',
      title: 'Women Skill Development',
      desc: 'We offer 100% free tailoring and beautician training courses to women, helping them build practical trade skills to earn independently.',
      actionText: 'Explore Women Aid',
      icon: Sparkles,
      iconBg: 'bg-[#FFF7F6] text-[#C52B75]',
      borderHover: 'hover:border-[#C52B75]',
      buttonBg: 'bg-gradient-to-r from-[#C52B75] to-[#A82260] text-white',
      onClick: () => {
        if (setActiveSection) setActiveSection('training', 'available-courses');
      }
    },
    {
      id: 'health-welfare',
      badge: 'Healthcare Training',
      subtitle: 'Healthcare Courses',
      title: 'Community Healthcare Training',
      desc: 'Practical training in first aid care, elder caregiving, maternal-child health literacy, and village healthcare assistance.',
      actionText: 'Volunteer for Drives',
      icon: HeartPulse,
      iconBg: 'bg-emerald-100 text-emerald-800',
      borderHover: 'hover:border-emerald-500',
      buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-800 text-white',
      onClick: onOpenVolunteer
    }
  ];

  return (
    <section className="py-16 bg-[#FFF7F6] border-b border-pink-100/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center justify-center gap-2 text-[#C52B75]">
            <span className="text-sm font-bold">❖ ❖</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-wide text-[#6B1D52]">
              Four Ways We Change Lives
            </h2>
            <span className="text-sm font-bold">❖ ❖</span>
          </div>

          <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            At Life Vision Society, we support poor students with education, offer free skill courses for women, provide practical healthcare training, and welcome kind-hearted donors.
          </p>

          <div className="inline-flex items-center gap-2 bg-white text-[#6B1D52] text-xs font-bold px-4 py-1.5 rounded-full border border-pink-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#C52B75]" />
            <span>Registered Non-Profit NGO Trust with 80G Tax Exemption (50% Tax Relief)</span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((pillar) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={`bg-white rounded-3xl p-6 border border-pink-100/90 shadow-md ${pillar.borderHover} hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center shadow-xs border border-white/60 group-hover:scale-105 transition-transform`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase bg-pink-50 text-[#6B1D52] px-2.5 py-1 rounded-full border border-pink-100">
                      {pillar.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xs font-extrabold text-[#C52B75] tracking-widest uppercase block mb-0.5">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-lg font-serif font-black text-slate-900 group-hover:text-[#6B1D52] transition-colors">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <button
                  onClick={pillar.onClick}
                  className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${pillar.buttonBg}`}
                >
                  <span>{pillar.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
