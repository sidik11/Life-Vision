import React, { useState, useEffect } from 'react';
import { Target, Heart, ShieldCheck, Users, Award, BookOpen, UserCheck, Briefcase, ChevronLeft, ChevronRight, Handshake, Star, Flag, TrendingUp, ChevronDown, ChevronUp, Linkedin, Mail, MoreHorizontal, X, Quote, Building2, ArrowRight, MessageCircle } from 'lucide-react';

export default function AboutPage({ onOpenApply, onOpenDonate, onOpenCsr, onOpenCollab, navigateTo }) {
  const [openStep, setOpenStep] = useState(3);
  const [selectedLeader, setSelectedLeader] = useState(null);

  // Leadership Team with updated Founder photo & Dr. Pradip Kumar Sarmah
  const leadershipTeam = [
    {
      id: 'founder',
      name: 'Dr. Aman Kumar',
      designation: 'Founder & Chairperson',
      avatar: '/Team Member/Dr. Aman Kumar.png',
      bio: 'Visionary social leader and founder dedicated to women empowerment, rural development, and ethical trust stewardship across Odisha. With over 15 years of dedicated community service, Dr. Aman Kumar spearheads strategic growth, partner alliances, and social impact programs.',
      quote: 'Empowering underprivileged women and youth is not just our mission — it is our duty to humanity and the foundation of a stronger, self-reliant society.',
      linkedin: 'https://linkedin.com',
      email: 'info.lifevision@gmail.com'
    },
    {
      id: 'pradip',
      name: 'Dr. Pradip Kumar Sarmah',
      designation: 'Executive Director & Advisor',
      avatar: '/Team Member/Dr. Pradip Kumar Sarmah.jpeg',
      bio: 'Senior advisory director guiding strategic partnerships, community health initiatives, and institutional governance across Life Vision Society programs.',
      quote: 'Sustainable social progress requires dedicated field commitment, ethical governance, and empowering communities from the roots.',
      linkedin: 'https://www.linkedin.com/in/dr-pradip-kumar-sarmah-4175343',
      email: 'crd4ev@yahoo.com'
    },
    {
      id: 'ed',
      name: 'MS. Sharda Devi',
      designation: 'Program Director',
      avatar: '/Team Member/Ms. Sharda Devi.jpeg',
      bio: 'Directs daily trust operations, donor relations, financial compliance, and policy execution across regional offices. She works tirelessly to ensure transparent governance and seamless execution of community welfare initiatives.',
      quote: 'Every trained individual represents a transformed family. Complete transparency, dedication, and measurable community impact guide everything we do.',
      linkedin: 'https://linkedin.com',
      email: 'ed@lifevisionsociety.org'
    }
  ];

  // Ground Operational Team
  const operationalTeam = [
    {
      name: 'Vivek Mukherjee',
      role: 'Team Member',
      avatar: '/Team Member/Vivek Mukherjee.jpeg',
      desc: 'Operations team member assisting in beneficiary support and training center logistics.',
      color: 'border-blue-200 bg-blue-50/40'
    },
    {
      name: 'Naresh Mehra',
      role: 'Team Member',
      avatar: '/Team Member/Naresh Mehra.jpeg',
      desc: 'Field operations team member managing project execution, logistics, and beneficiary outreach.',
      color: 'border-pink-200 bg-[#FFF7F6]'
    },
    {
      name: 'Ashok Kumar',
      role: 'Team Member',
      avatar: '/Team Member/Ashok Kumar.png',
      desc: 'Coordinates ground-level activities, village-level mobilization, and community health camp logistics.',
      color: 'border-emerald-200 bg-emerald-50/40'
    },
    {
      name: 'Vipin Arya',
      role: 'Team Member',
      avatar: '/Team Member/Vipin Arya.jpeg',
      desc: 'Ground execution team member managing program operations and field outreach.',
      color: 'border-purple-200 bg-purple-50/40'
    },
    {
      name: 'Bably Kumari',
      role: 'Team Memmber',
      avatar: '/Team Member/Bably Kumari.jpeg',
      desc: 'Dedicated team member supporting community mobilization and skill training coordination.',
      color: 'border-[#C52B75]/20 bg-pink-50/60'
    },
    {
      name: 'Kumar Gaurav',
      role: 'Team Member',
      avatar: '/Team Member/Kumar Gaurav.jpeg',
      desc: 'Handles project planning, resource allocation, milestone tracking, and ground implementation.',
      color: 'border-purple-200 bg-purple-50/40'
    },
    {
      name: 'Kumari Vandana',
      role: 'Team Member',
      avatar: '/Team Member/Kumari Vandana.jpeg',
      desc: 'Manages NGO programs, activity schedules, workshop logistics, and cross-departmental coordination.',
      color: 'border-pink-200 bg-[#FFF7F6]'
    },
    {
      name: 'Ravina yadav',
      role: 'Team Member',
      avatar: '/Team Member/Ravina yadav.jpeg',
      desc: 'Coordinates ground-level activities, village-level mobilization, and community health camp logistics.',
      color: 'border-emerald-200 bg-emerald-50/40'
    }
  ];

  // Unified List of 12 Official Corporate Partner Companies (Removed SSC entries)
  const allPartners = [
    {
      id: 'privir-healthcare',
      name: 'Privir Healthcare Pvt. Ltd.',
      logo: '/company/Privir Healthcare.jpg',
      category: 'Healthcare Partner',
      badgeStyle: 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
      programs: ['Healthcare & Nursing Placements', 'Patient Care Assistant Training', 'Hospital Internships'],
      description: 'Privir Healthcare Pvt. Ltd. collaborates with Life Vision Society to offer clinical practical training, hospital internships, and direct employment placements for certified Healthcare trainees.',
      stats: [{ label: 'Placed Trainees', value: '450+' }, { label: 'Hospitals Linked', value: '12 Facilities' }, { label: 'Placement Rate', value: '92%' }]
    },
    {
      id: 'arvind-ltd',
      name: 'Arvind Ltd.',
      logo: '/company/arvind ltd.png',
      category: 'Textile Partner',
      badgeStyle: 'bg-indigo-100/80 text-indigo-900 border-indigo-300',
      programs: ['Garment Manufacturing', 'Industrial Stitching', 'Quality Assurance'],
      description: 'Arvind Ltd. partners with Life Vision Society for industrial textile skill alignment and direct recruitment of certified tailoring trainees into textile manufacturing facilities.',
      stats: [{ label: 'Placed Trainees', value: '620+' }, { label: 'Industrial Batches', value: '18 Batches' }, { label: 'Placement Rate', value: '88%' }]
    },
    {
      id: 'grion-textoinfra',
      name: 'Grion Textoinfra Pvt. Ltd.',
      logo: '/company/grion textoinfra pvt ltd.jpeg',
      category: 'Industrial Partner',
      badgeStyle: 'bg-blue-100/80 text-blue-900 border-blue-300',
      programs: ['Textile Infrastructure', 'Production Operations', 'Equipment Maintenance'],
      description: 'Grion Textoinfra Pvt. Ltd. supports Life Vision Society with technical training infrastructure and employer placement pipelines in industrial garment units.',
      stats: [{ label: 'Placed Trainees', value: '380+' }, { label: 'Units Linked', value: '6 Plants' }, { label: 'Placement Rate', value: '85%' }]
    },
    {
      id: 'jayavarma-textiles',
      name: 'Jayavarma Textiles Pvt. Ltd.',
      logo: '/company/jayavarma textiles pvt ltd.jpg',
      category: 'Garment Partner',
      badgeStyle: 'bg-rose-100/80 text-rose-900 border-rose-300',
      programs: ['Apparel Assembly', 'Pattern Sewing', 'Export Garment Trades'],
      description: 'Jayavarma Textiles Pvt. Ltd. collaborates for bulk employment placement of certified women tailors in high-capacity garment manufacturing units.',
      stats: [{ label: 'Placed Trainees', value: '510+' }, { label: 'Export Batches', value: '15 Batches' }, { label: 'Placement Rate', value: '90%' }]
    },
    {
      id: 'jindal-worldwide',
      name: 'Jindal Worldwide Ltd.',
      logo: '/company/jindal worldwide ltd.jpg',
      category: 'Industrial Partner',
      badgeStyle: 'bg-amber-100/80 text-amber-900 border-amber-300',
      programs: ['Denim Manufacturing', 'Textile Weaving', 'Industrial Operations'],
      description: 'Jindal Worldwide Ltd. offers industrial apprenticeship and large-scale manufacturing job opportunities for trained vocational graduates.',
      stats: [{ label: 'Placed Trainees', value: '750+' }, { label: 'Manufacturing Hubs', value: '8 Units' }, { label: 'Placement Rate', value: '89%' }]
    },
    {
      id: 'kpr-mill',
      name: 'KPR Mill Ltd.',
      logo: '/company/kpr mill ltd.png',
      category: 'Textile Partner',
      badgeStyle: 'bg-purple-100/80 text-purple-900 border-purple-300',
      programs: ['Yarn & Fabric Processing', 'Garment Stitching', 'Skill Upgradation'],
      description: 'KPR Mill Ltd. recruits skilled women tailors and garment machine operators directly from Life Vision Society training centers.',
      stats: [{ label: 'Placed Trainees', value: '890+' }, { label: 'Mills Linked', value: '10 Facilities' }, { label: 'Placement Rate', value: '94%' }]
    },
    {
      id: 'moskip-textiles',
      name: 'Moskip Textiles',
      logo: '/company/moskip textiles.jpg',
      category: 'Apparel Partner',
      badgeStyle: 'bg-pink-100/80 text-pink-900 border-pink-300',
      programs: ['Fashion Apparel Design', 'Boutique Production', 'Quality Control'],
      description: 'Moskip Textiles provides specialized apparel finishing training and job opportunities for women in garment assembly.',
      stats: [{ label: 'Placed Trainees', value: '310+' }, { label: 'Production Units', value: '4 Centers' }, { label: 'Placement Rate', value: '86%' }]
    },
    {
      id: 'sara-textile',
      name: 'Sara Textile Pvt. Ltd.',
      logo: '/company/sara textile pvt ltd.jpg',
      category: 'Textile Partner',
      badgeStyle: 'bg-pink-50 text-[#C52B75] border-pink-300',
      programs: ['Home Furnishings', 'Sewing Trade', 'Fabric Processing'],
      description: 'Sara Textile Pvt. Ltd. provides corporate placement support for candidates completing vocational tailoring certifications.',
      stats: [{ label: 'Placed Trainees', value: '420+' }, { label: 'Factories Linked', value: '5 Units' }, { label: 'Placement Rate', value: '87%' }]
    },
    {
      id: 'scm-garment',
      name: 'SCM Garment Pvt. Ltd.',
      logo: '/company/scm garment pvt ltd.png',
      category: 'Garment Partner',
      badgeStyle: 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
      programs: ['Knitwear Manufacturing', 'Stitching Lab', 'Garment Inspection'],
      description: 'SCM Garment Pvt. Ltd. partners with Life Vision Society for direct campus recruitment and industrial placement in knitwear assembly.',
      stats: [{ label: 'Placed Trainees', value: '580+' }, { label: 'Garment Units', value: '7 Plants' }, { label: 'Placement Rate', value: '91%' }]
    },
    {
      id: 'shankar-textiles',
      name: 'Shankar Textiles Pvt. Ltd.',
      logo: '/company/shankar textiles pvt ltd.jpg',
      category: 'Textile Partner',
      badgeStyle: 'bg-purple-100/80 text-purple-900 border-purple-300',
      programs: ['Textile Processing', 'Industrial Sewing', 'Quality Control'],
      description: 'Shankar Textiles Pvt. Ltd. provides industrial employment opportunities for certified machine operators and tailors.',
      stats: [{ label: 'Placed Trainees', value: '340+' }, { label: 'Mills Linked', value: '4 Facilities' }, { label: 'Placement Rate', value: '84%' }]
    },
    {
      id: 'sintex-industries',
      name: 'Sintex Industries Ltd.',
      logo: '/company/sintex industries ltd.jpg',
      category: 'Industrial Partner',
      badgeStyle: 'bg-blue-100/80 text-blue-900 border-blue-300',
      programs: ['Yarn Production', 'Industrial Textile Operations', 'Technical Trade'],
      description: 'Sintex Industries Ltd. supports Life Vision Society candidates with industrial training and production floor placements.',
      stats: [{ label: 'Placed Trainees', value: '670+' }, { label: 'Industrial Plants', value: '6 Facilities' }, { label: 'Placement Rate', value: '88%' }]
    },
    {
      id: 'sp-apparels',
      name: 'SP Apparels Ltd.',
      logo: '/company/sp apparels ltd.jpg',
      category: 'Apparel Partner',
      badgeStyle: 'bg-rose-100/80 text-rose-900 border-rose-300',
      programs: ['Export Apparel Stitching', 'Garment Quality Control', 'Production Management'],
      description: 'SP Apparels Ltd. offers direct job placements for women trained in industrial garment stitching and export apparel manufacturing.',
      stats: [{ label: 'Placed Trainees', value: '730+' }, { label: 'Export Units', value: '9 Plants' }, { label: 'Placement Rate', value: '93%' }]
    }
  ];

  // Story Timeline Steps matching user reference design
  const storySteps = [
    {
      id: 1,
      icon: Flag,
      title: "1. How It All Started (2015)",
      desc: "The Trust was established in 2015 with a vision to bring positive change in the lives of underprivileged communities by providing skills, support and opportunities."
    },
    {
      id: 2,
      icon: Users,
      title: "2. Our Early Work (2017)",
      desc: "We began our journey by focusing on awareness programs, education support and basic skill training for women and youth in rural areas."
    },
    {
      id: 3,
      icon: Handshake,
      title: "3. Standing Together During COVID-19 (2020)",
      desc: "During the COVID-19 pandemic, when many families were facing unemployment and distress, we stepped forward to serve the community.",
      bullets: [
        "Distributed food packets and essential supplies",
        "Provided masks, sanitizers and hygiene kits",
        "Organized health awareness and safety camps",
        "Supported daily wage workers and needy families"
      ]
    },
    {
      id: 4,
      icon: BookOpen,
      title: "4. Expanding Skill Development (2021 – 2022)",
      desc: "We expanded our training programs in tailoring, beautician, agriculture, healthcare and digital skills to empower more individuals for better livelihood opportunities."
    },
    {
      id: 5,
      icon: TrendingUp,
      title: "5. Our Journey Today",
      desc: "Today, we have trained thousands of youth and women, helped them become self-reliant and continue working towards building a stronger and empowered community."
    },
    {
      id: 6,
      icon: Target,
      title: "6. Looking Ahead",
      desc: "Our mission continues with a commitment to reach more lives, create more opportunities and build a brighter, self-reliant future for all."
    }
  ];

  const [missionIndex, setMissionIndex] = useState(0);
  const [visionIndex, setVisionIndex] = useState(0);

  // 3 Photo slots for OUR MISSION Slider
  const missionSlides = [
    {
      image: '/image/women empowerment.jpg',
      title: 'Women Empowerment & Vocational Skills',
      caption: 'Providing hands-on vocational skill training to empower women with financial independence and practical trade skills.'
    },
    {
      image: '/image/skill devlopement.png',
      title: 'Self-Reliance & Entrepreneurship',
      caption: 'Fostering self-reliance and entrepreneurship through professional vocational skills and small business incubation.'
    },
    {
      image: '/image/women Empower.png',
      title: 'Sustainable Rural Livelihoods',
      caption: 'Supporting rural youth and families with sustainable agricultural livelihoods and market-aligned training.'
    }
  ];

  // 6 Photo slots for OUR VISION Slider
  const visionSlides = [
    {
      image: '/image/community health welfare.png',
      title: 'Healthy & Resilient Communities',
      caption: 'Creating healthy, resilient communities through preventive healthcare literacy and community medical camps.'
    },
    {
      image: '/image/placement.png',
      title: 'Dignified & Independent Futures',
      caption: 'Connecting certified candidates with employer networks for stable employment and long-term career growth.'
    },
    {
      image: '/image/Independent Entrepreneurs.jpg',
      title: 'Widespread Skill Hub Network',
      caption: 'Establishing widespread vocational training hubs to bridge the rural-urban employment gap.'
    },
    {
      image: '/image/Entrepreneurship Support.jpg',
      title: 'Micro-Business & Startup Guidance',
      caption: 'Providing equipment procurement assistance and government loan documentation under MSME & PMEGP schemes.'
    },
    {
      image: '/image/livelehood.jpg',
      title: 'Employment & Sustainable Income',
      caption: 'Building market-oriented job placement pipelines for sustainable family income across Odisha.'
    },
    {
      image: '/image/youth empowerment.jpg',
      title: 'Youth Digital & Workplace Readiness',
      caption: 'Empowering young men and women with digital literacy, communication skills, and workplace readiness.'
    }
  ];

  const toggleStep = (id) => {
    setOpenStep((prev) => (prev === id ? null : id));
  };

  // Mission Slider Auto-slide (4s)
  useEffect(() => {
    const timer = setInterval(() => {
      setMissionIndex((prev) => (prev + 1) % missionSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [missionSlides.length]);

  // Vision Slider Auto-slide (4.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setVisionIndex((prev) => (prev + 1) % visionSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [visionSlides.length]);

  return (
    <div className="bg-[#FFF7F6] min-h-screen py-10 animate-fade-in font-sans space-y-16">

      {/* Page Banner Header (Single Image - Full Size) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden min-h-[380px] lg:min-h-[420px] flex flex-col justify-between border border-pink-900/40">

          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/image/about pic.png"
              alt="Life Vision About Hero"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent z-10 pointer-events-none" />
          </div>

          {/* Banner Content */}
          <div className="max-w-4xl space-y-4 relative z-20">
            <span className="text-xs font-black text-pink-200 tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xs font-serif inline-block">
              About Our Organization
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight drop-shadow-md">
              Life Vision Society
            </h1>
            <p className="text-pink-200 font-bold text-lg sm:text-xl drop-shadow-xs font-serif">
              Empowering Women, Inspiring Change
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-pink-100/90 leading-relaxed pt-2 font-medium max-w-3xl drop-shadow-xs">
              We believe every woman has a dream. Our mission is to provide the support, resources and opportunities they need to lead confident, independent and fulfilling lives, while offering vocational skill training open to both women and men.
            </p>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* 1. OUR STORY SECTION */}
        <section id="our-story" className="scroll-mt-28 bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-pink-100/80 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            {/* Left Column: Timeline Accordion Stepper (5 / 12 cols on desktop) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-extrabold text-[#C52B75] tracking-wider">
                  Our Story
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#6B1D52] leading-tight mt-1">
                  A Journey of Empowerment & Social Change
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-3">
                  We are a non-profit trust working for the empowerment of youth and women through skill development, education, healthcare and sustainable livelihood programs.
                </p>
              </div>

              {/* Interactive Vertical Timeline List */}
              <div className="relative pl-6 space-y-5 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C52B75]/30">
                {storySteps.map((step) => {
                  const StepIcon = step.icon;
                  const isOpen = openStep === step.id;

                  return (
                    <div key={step.id} className="relative flex items-start gap-4 group">
                      {/* Node Icon */}
                      <div
                        onClick={() => toggleStep(step.id)}
                        className={`-ml-6 w-9 h-9 rounded-full ${isOpen
                          ? 'bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white shadow-md ring-4 ring-pink-100'
                          : 'bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white'
                          } flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 z-10`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>

                      {/* Accordion Content */}
                      <div className="flex-1 bg-[#FFF7F6] rounded-2xl p-3.5 border border-pink-100 hover:border-pink-300 transition-colors">
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="w-full flex items-center justify-between text-left font-extrabold text-xs sm:text-sm text-slate-900 hover:text-[#C52B75] transition-colors cursor-pointer"
                        >
                          <span className="font-serif tracking-tight">{step.title}</span>
                          <ChevronDown className={`w-4 h-4 text-[#C52B75] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="mt-2.5 pt-2 border-t border-pink-200/60 text-xs text-slate-600 font-medium leading-relaxed animate-fade-in space-y-2">
                            <p>{step.desc}</p>
                            {step.bullets && (
                              <ul className="space-y-1.5 pt-1 pl-1 font-semibold text-slate-700">
                                {step.bullets.map((b, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C52B75] mt-1.5 shrink-0" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Photo Grid Collage (Clean Dedicated Images) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Top Large Featured Image */}
              <div className="rounded-3xl overflow-hidden shadow-lg border border-pink-100 relative group h-64 sm:h-72 lg:h-80">
                <img
                  src="/image/women empowerment.jpg"
                  alt="Women Empowerment Program"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Middle Row (2 images side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-md border border-pink-100 relative group h-44 sm:h-48">
                  <img
                    src="/image/skill devlopement.png"
                    alt="Skill Development Training"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="rounded-2xl overflow-hidden shadow-md border border-pink-100 relative group h-44 sm:h-48">
                  <img
                    src="/image/community health welfare.png"
                    alt="Community Health & Welfare"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Bottom Row (2 images side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-md border border-pink-100 relative group h-44 sm:h-48">
                  <img
                    src="/image/placement.png"
                    alt="Career & Placement Assistance"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="rounded-2xl overflow-hidden shadow-md border border-pink-100 relative group h-44 sm:h-48">
                  <img
                    src="/image/join with us.png"
                    alt="Vocational Skill Training Hub"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 2. VISION & MISSION SECTION */}
        <section id="vision-mission" className="scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* OUR MISSION CARD (Rich Brand Crimson-Pink Color Theme) */}
            <div className="bg-gradient-to-br from-white via-[#FFF7F6] to-pink-50/60 rounded-3xl p-6 sm:p-8 shadow-md border-2 border-pink-200/80 flex flex-col justify-between space-y-6 font-sans">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C52B75] to-[#6B1D52] text-white flex items-center justify-center shadow-md">
                    <Target className="w-7 h-7" />
                  </div>
                  <span className="text-2xs font-extrabold text-[#C52B75] tracking-wider bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
                    Core Purpose
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-wide">
                  Our Mission
                </h2>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                  To empower <strong className="text-[#C52B75]">women and underserved communities</strong> through quality, job-oriented skill training and meaningful employment opportunities. We aim to build skills, confidence, <strong className="text-[#C52B75]">self-reliance, and financial independence</strong>, helping individuals create sustainable livelihoods and a better future.
                </p>
              </div>

              {/* Mission Auto-Sliding Photo Carousel (3 Photos) */}
              <div className="space-y-3 pt-2 border-t border-pink-200/60">
                <div className="relative rounded-2xl overflow-hidden shadow-md h-52 sm:h-60 group border-2 border-pink-200/80">
                  {missionSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === missionIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}

                  {/* Indicator Dots */}
                  <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-2">
                    {missionSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMissionIndex(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${missionIndex === idx ? 'w-8 bg-[#C52B75] ring-2 ring-white shadow-md' : 'w-2.5 bg-white/70 hover:bg-white'
                          }`}
                        aria-label={`Mission slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Below Photo Caption / Description Box */}
                <div className="bg-[#FFF7F6] p-4 rounded-2xl border border-pink-200/80 shadow-2xs space-y-1">
                  <h4 className="text-xs font-black text-[#C52B75] tracking-wide font-serif">
                    {missionSlides[missionIndex].title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {missionSlides[missionIndex].caption}
                  </p>
                </div>
              </div>
            </div>

            {/* OUR VISION CARD (Rich Brand Deep Mulberry Color Theme) */}
            <div className="bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 rounded-3xl p-6 sm:p-8 shadow-md border-2 border-purple-200/80 flex flex-col justify-between space-y-6 font-sans">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B1D52] to-[#4A1039] text-white flex items-center justify-center shadow-md">
                    <Award className="w-7 h-7" />
                  </div>
                  <span className="text-2xs font-extrabold text-[#6B1D52] tracking-wider bg-purple-100/80 px-3 py-1 rounded-full border border-purple-200">
                    Long-Term Impact
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-wide">
                  Our Vision
                </h2>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                  To empower <strong className="text-[#6B1D52]">women and communities</strong> through skill development, education, and employment opportunities. Build a <strong className="text-[#6B1D52]">self-reliant and inclusive society</strong> where everyone can create a better future.
                </p>
              </div>

              {/* Vision Auto-Sliding Photo Carousel (6 Photos) */}
              <div className="space-y-3 pt-2 border-t border-purple-200/60">
                <div className="relative rounded-2xl overflow-hidden shadow-md h-52 sm:h-60 group border-2 border-purple-200/80">
                  {visionSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === visionIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}

                  {/* Indicator Dots */}
                  <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-2">
                    {visionSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setVisionIndex(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${visionIndex === idx ? 'w-8 bg-[#6B1D52] ring-2 ring-white shadow-md' : 'w-2.5 bg-white/70 hover:bg-white'
                          }`}
                        aria-label={`Vision slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Below Photo Caption / Description Box */}
                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-1">
                  <h4 className="text-xs font-black text-[#6B1D52] tracking-wide font-serif">
                    {visionSlides[visionIndex].title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {visionSlides[visionIndex].caption}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2.5 GOVERNANCE & 80G TRUST STATUS */}
        <section id="governance-status" className="scroll-mt-28 bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-pink-100 space-y-6 font-sans">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200 inline-block font-serif">
              Legal Compliance & Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#6B1D52] tracking-wide">
              Trust Registrations & Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Life Vision Society operates with complete financial auditability, legal compliance, and governance standards under Indian public charitable trust laws.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#C52B75] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">80G Tax Benefit</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                50% tax exemption for individual and corporate donors under Section 80G of Income Tax Act.
              </p>
            </div>

            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6B1D52] flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">12A Non-Profit Trust</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Registered non-profit charitable trust status ensuring all funds serve public welfare.
              </p>
            </div>

            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Handshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">CSR-1 Compliant</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Registered with MCA for implementing corporate Schedule VII CSR initiatives.
              </p>
            </div>

            <div className="bg-[#FFF7F6] p-5 rounded-2xl border border-pink-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">NGO Darpan Registered</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Listed on NITI Aayog's NGO Darpan portal for government and public partnerships.
              </p>
            </div>
          </div>
        </section>

        {/* 3. LEADERSHIP SECTION (EXACTLY 3 KEY LEADERS: FOUNDER, EXECUTIVE DIRECTOR, PROGRAM DIRECTOR) */}
        <section id="leadership" className="scroll-mt-28 bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-purple-100 space-y-8 font-sans">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#6B1D52] tracking-wider bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
              Trust Leadership & Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#6B1D52] tracking-wide">
              Leadership
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Senior directors and visionaries guiding major strategic decisions, ethical governance, and social vision. Hover over any member photo and click the three dots to view their full bio & details!
            </p>
          </div>

          {/* 3 Leadership Circle Members Grid (Clean layout: Circle, Name, Designation & Social Media) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 max-w-5xl mx-auto">
            {leadershipTeam.map((leader) => {
              const isSelected = selectedLeader?.id === leader.id;
              return (
                <div
                  key={leader.id}
                  className="text-center flex flex-col items-center justify-between space-y-4 group py-2"
                >
                  <div className="space-y-4 flex flex-col items-center w-full">
                    {/* Enlarged Circle Image Avatar Container (No 3-Dots Overlay) */}
                    <div
                      onClick={() => setSelectedLeader(leader)}
                      className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-pink-200 group-hover:border-[#C52B75] shadow-md cursor-pointer transition-all duration-300 transform group-hover:scale-105 shrink-0"
                    >
                      <img
                        src={leader.avatar}
                        alt={leader.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Below Circle: Designation & Name */}
                    <div className="space-y-1 w-full text-center">
                      <span className="text-xs font-black text-[#C52B75] tracking-wider block font-serif">
                        {leader.designation}
                      </span>
                      <h3 className="text-xl font-serif font-black text-slate-900 leading-tight">
                        {leader.name}
                      </h3>
                    </div>
                  </div>

                  {/* View Message Button */}
                  <div className="flex items-center justify-center pt-1 w-full">
                    <button
                      onClick={() => setSelectedLeader(leader)}
                      className="text-xs font-extrabold text-[#C52B75] hover:text-white bg-pink-50 hover:bg-[#C52B75] px-4 py-2 rounded-full border border-pink-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>View Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLEAN POPUP MODAL FOR LEADERSHIP MEMBER MESSAGE (NO SCROLLBAR, NO CLOSE BUTTON AT BOTTOM) */}
          {selectedLeader && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 relative shadow-2xl animate-fade-in border border-pink-100 font-sans">

                {/* Top Right Close Icon */}
                <button
                  onClick={() => setSelectedLeader(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pink-50 text-slate-600 hover:bg-pink-100 hover:text-[#C52B75] flex items-center justify-center transition-colors cursor-pointer border border-pink-200"
                  aria-label="Close message"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header Info */}
                <div className="flex items-center gap-4 border-b border-pink-100 pb-4 pr-8">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-3 border-[#C52B75] shadow-md shrink-0">
                    <img
                      src={selectedLeader.avatar}
                      alt={selectedLeader.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-[#C52B75] tracking-wider bg-pink-100/80 px-3 py-0.5 rounded-full border border-pink-200 inline-block font-serif">
                      {selectedLeader.designation}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900 leading-tight">
                      {selectedLeader.name}
                    </h3>
                    <p className="text-xs text-purple-900 font-extrabold tracking-wide">
                      Life Vision Society Leadership
                    </p>
                  </div>
                </div>

                {/* Visionary Statement / Message Box */}
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50/50 p-4 rounded-2xl border border-purple-200/80 space-y-1.5 relative">
                  <div className="flex items-center gap-2 text-[#6B1D52]">
                    <Quote className="w-4 h-4 text-[#C52B75] shrink-0" />
                    <span className="text-xs font-black font-serif tracking-wide uppercase">Member Visionary Message</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 italic font-semibold leading-relaxed pl-2.5 border-l-2 border-[#C52B75]">
                    "{selectedLeader.quote}"
                  </p>
                </div>

                {/* Member Description / Bio */}
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase font-serif">Leadership Role & Background</h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-[#FFF7F6] p-3.5 rounded-2xl border border-pink-100">
                    {selectedLeader.bio}
                  </p>
                </div>

                {/* Modal Footer Close Button */}
                <div className="pt-2 border-t border-pink-100 flex justify-end">
                  <button
                    onClick={() => setSelectedLeader(null)}
                    className="px-6 py-2 rounded-full bg-[#C52B75] hover:bg-[#6B1D52] text-white font-extrabold text-xs transition-colors shadow-2xs cursor-pointer tracking-wider"
                  >
                    Close Message
                  </button>
                </div>

              </div>
            </div>
          )}
        </section>

        {/* 4. OUR TEAM SECTION (GROUND OPERATIONAL & FIELD EXECUTION) */}
        <section id="our-team" className="scroll-mt-28 bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-pink-100 space-y-8 font-sans">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200">
              Operational & Field Execution
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#6B1D52] tracking-wide">
              Our Team
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Dedicated operational managers, coordinators, and field executives working directly on the ground to manage NGO programs, mobilize communities, and support beneficiaries.
            </p>
          </div>

          {/* 7 Operational Team Circle Profile Cards Grid (Designed like Leadership members without 3-dots / view profile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-4">
            {operationalTeam.map((member, idx) => (
              <div
                key={idx}
                className="text-center flex flex-col items-center justify-between space-y-4 group py-2"
              >
                <div className="space-y-4 flex flex-col items-center w-full">
                  {/* Circle Image Avatar Container (Matching Leadership Circle Size) */}
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-pink-200 group-hover:border-[#C52B75] shadow-md transition-all duration-300 transform group-hover:scale-105 shrink-0 flex items-center justify-center bg-gradient-to-br from-[#C52B75] via-[#6B1D52] to-[#4A1039]">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white space-y-0.5">
                        <span className="text-2xl sm:text-3xl font-serif font-black tracking-wider drop-shadow-md">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Below Circle: Role, Name & Description */}
                  <div className="space-y-1.5 w-full text-center">
                    <span className="text-xs font-black text-[#C52B75] tracking-wider block font-serif">
                      {member.role}
                    </span>
                    <h3 className="text-lg font-serif font-black text-slate-900 leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1 px-1">
                      {member.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PARTNERS SECTION (UNIFIED COMPANY LOGO GRID WITH CLICKABLE POPUP DETAILS) */}
        <section id="partners" className="scroll-mt-28 bg-[#FFF7F6]/50 rounded-3xl p-6 sm:p-10 shadow-md border border-pink-100 space-y-10 font-sans">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#C52B75] flex items-center justify-center shadow-xs mx-auto mb-1">
              <Handshake className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200 inline-block">
              Collaborations & CSR
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#6B1D52] tracking-wide pt-1">
              Our Partners
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              We collaborate with leading companies, institutions, and community partners to create sustainable social impact and empower communities.
            </p>
          </div>

          {/* Unified 20 Company Logo Grid (Purely for Display & Visibility - Non-clickable) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allPartners.map((company) => (
              <div
                key={company.id}
                className="p-3 transition-all text-center flex flex-col justify-between items-center group cursor-pointer"
              >
                {/* Circular Partner Logo Container */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-3 border-pink-200 group-hover:border-[#C52B75] flex items-center justify-center p-3 shadow-md group-hover:scale-105 transition-all mb-3 overflow-hidden shrink-0 mx-auto">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-contain rounded-full filter drop-shadow-xs"
                  />
                </div>

                {/* Company Name */}
                <h3 className="text-xs font-bold text-slate-800 leading-tight pt-3">
                  {company.name}
                </h3>

                {/* Category Badge */}
                <span className={`text-[10px] ${company.badgeStyle} px-2.5 py-0.5 rounded-full border mt-2.5 block font-bold`}>
                  {company.category}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom "Partner With Us for Social Impact" CTA Card */}
          <div className="bg-gradient-to-r from-[#FFF7F6] via-pink-50/70 to-purple-50/70 rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-md flex flex-col lg:flex-row items-center justify-between gap-6 font-sans">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C52B75] to-[#6B1D52] text-white flex items-center justify-center shadow-md shrink-0">
                <Handshake className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52]">
                  Partner With Us for Social Impact
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                  Join us in creating opportunities, empowering communities, and building a more inclusive and sustainable future.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full lg:w-auto">
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={onOpenCsr}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Become a CSR Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-500 mt-1.5">
                  For companies & CSR organizations
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <button
                  onClick={onOpenCollab}
                  className="w-full sm:w-auto bg-white hover:bg-pink-50 text-[#6B1D52] border-2 border-[#6B1D52] font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>Collaborate With Us</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-500 mt-1.5">
                  For institutions, NGOs, volunteers & community partners
                </span>
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs font-extrabold text-[#C52B75] tracking-wider">
              ♡ Together, we can create a better tomorrow.
            </p>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-[#4A1039] via-[#6B1D52] to-[#8C2366] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-2xl font-serif font-black">Ready to Support Our Cause?</h3>
            <p className="text-xs sm:text-sm text-pink-100 font-medium mt-1">Apply for training or support our community initiatives today.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenApply('Tailoring Training')}
              className="bg-white text-[#6B1D52] font-black px-6 py-3 rounded-full text-xs sm:text-sm hover:bg-pink-50 transition-all shadow-md cursor-pointer"
            >
              Apply for Training
            </button>
            <button
              onClick={onOpenDonate}
              className="bg-gradient-to-r from-[#D53F8C] to-[#C52B75] text-white font-black px-6 py-3 rounded-full text-xs sm:text-sm hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              Donate Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
