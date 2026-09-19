import React, { useState, useEffect } from 'react';
import { ArrowRight, Quote, ShieldCheck, FileText, PieChart, Users, Building2, ChevronLeft, ChevronRight, Handshake, Award, MapPin } from 'lucide-react';

export default function TrustPartnersStories({ setActiveSection, onOpenApply, onOpenCsr, onOpenCollab }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const stories = [
    {
      quote: "The free practical tailoring course taught me garment construction, pattern drafting, and sewing machine operation. Equipped with certification, I opened my own fashion boutique in Saheed Nagar, Bhubaneswar.",
      name: "Sunita Sahu",
      role: "Tailoring & Garment Making",
      location: "Bhubaneswar, Odisha",
      image: "/success story/trailoring.jpg"
    },
    {
      quote: "Joining Life Vision Society's beautician program gave me professional makeup skills, hands-on salon practice, and direct job placement support. Today I work as a senior salon stylist in Cuttack.",
      name: "Priya Ranjita Das",
      role: "Beautician & Personal Care",
      location: "Cuttack, Odisha",
      image: "/success story/beauty.jpg"
    },
    {
      quote: "The practical F&B service training, table setup modules, and hospitality communication classes at Life Vision Society secured my placement as a Food & Beverage Service Assistant in a premier hotel.",
      name: "Deepika Kumari",
      role: "Food & Beverage Service Assistant",
      location: "Bhubaneswar, Odisha",
      image: "/success story/f&b.jpg"
    },
    {
      quote: "Learning sewing machine maintenance alongside garment design was a complete game changer for me. Life Vision Society turned me into a self-reliant stitching center owner taking regular bulk orders.",
      name: "Rasmita Behera",
      role: "Tailoring & Garment Making",
      location: "Khordha, Odisha",
      image: "/success story/success story.jpg"
    },
    {
      quote: "Life Vision Society's housekeeping and facility management training prepared me with professional cleaning standards, guest hygiene, and operations management as a hospitality supervisor.",
      name: "Manasi Nayak",
      role: "Housekeeping & Facility Management",
      location: "Puri, Odisha",
      image: "/success story/house keeping.jpg"
    },
    {
      quote: "The hands-on practical training in skincare, bridal styling, and salon sanitation gave me the exact skills needed to start my own beauty parlor in Balasore and earn a dignified income.",
      name: "Archana Sahoo",
      role: "Beautician & Personal Care",
      location: "Balasore, Odisha",
      image: "/success story/betician.jpg"
    }
  ];

  // Auto-slide carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % stories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [stories.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handlePartnerWithUs = () => {
    if (setActiveSection) {
      setActiveSection('about', 'partners');
    }
  };

  const handleHomeCompanyClick = () => {
    if (setActiveSection) {
      setActiveSection('about', 'partners');
    }
  };

  // 12 Official Partner Companies from company folder
  const officialPartners = [
    { 
      name: 'Privir Healthcare Pvt. Ltd.', 
      logo: '/company/Privir Healthcare.jpg', 
      badge: 'Healthcare Partner',
      badgeColor: 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
    },
    { 
      name: 'Arvind Ltd.', 
      logo: '/company/arvind ltd.png', 
      badge: 'Textile Partner',
      badgeColor: 'bg-indigo-100/80 text-indigo-900 border-indigo-300'
    },
    { 
      name: 'Grion Textoinfra Pvt. Ltd.', 
      logo: '/company/grion textoinfra pvt ltd.jpeg', 
      badge: 'Industrial Partner',
      badgeColor: 'bg-blue-100/80 text-blue-900 border-blue-300'
    },
    { 
      name: 'Jayavarma Textiles Pvt. Ltd.', 
      logo: '/company/jayavarma textiles pvt ltd.jpg', 
      badge: 'Garment Partner',
      badgeColor: 'bg-rose-100/80 text-rose-900 border-rose-300'
    },
    { 
      name: 'Jindal Worldwide Ltd.', 
      logo: '/company/jindal worldwide ltd.jpg', 
      badge: 'Industrial Partner',
      badgeColor: 'bg-amber-100/80 text-amber-900 border-amber-300'
    },
    { 
      name: 'KPR Mill Ltd.', 
      logo: '/company/kpr mill ltd.png', 
      badge: 'Textile Partner',
      badgeColor: 'bg-purple-100/80 text-purple-900 border-purple-300'
    },
    { 
      name: 'Moskip Textiles', 
      logo: '/company/moskip textiles.jpg', 
      badge: 'Apparel Partner',
      badgeColor: 'bg-pink-100/80 text-pink-900 border-pink-300'
    },
    { 
      name: 'Sara Textile Pvt. Ltd.', 
      logo: '/company/sara textile pvt ltd.jpg', 
      badge: 'Textile Partner',
      badgeColor: 'bg-pink-50 text-[#C52B75] border-pink-300'
    },
    { 
      name: 'SCM Garment Pvt. Ltd.', 
      logo: '/company/scm garment pvt ltd.png', 
      badge: 'Garment Partner',
      badgeColor: 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
    },
    { 
      name: 'Shankar Textiles Pvt. Ltd.', 
      logo: '/company/shankar textiles pvt ltd.jpg', 
      badge: 'Textile Partner',
      badgeColor: 'bg-purple-100/80 text-purple-900 border-purple-300'
    },
    { 
      name: 'Sintex Industries Ltd.', 
      logo: '/company/sintex industries ltd.jpg', 
      badge: 'Industrial Partner',
      badgeColor: 'bg-blue-100/80 text-blue-900 border-blue-300'
    },
    { 
      name: 'SP Apparels Ltd.', 
      logo: '/company/sp apparels ltd.jpg', 
      badge: 'Apparel Partner',
      badgeColor: 'bg-rose-100/80 text-rose-900 border-rose-300'
    }
  ];

  return (
    <section id="partners" className="py-12 bg-[#FFF7F6] border-b border-pink-100/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SINGLE LINE 2-PART LAYOUT: OUR PARTNERS (LEFT 50%) & SUCCESS STORIES (RIGHT 50%) */}
        <div id="gallery" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* LEFT PART: OUR PARTNERS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-pink-100/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#C52B75] tracking-widest bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 inline-block font-serif">
                  Corporate & Industrial Alliances
                </span>
                <button
                  onClick={handlePartnerWithUs}
                  className="text-xs font-bold text-[#C52B75] hover:text-[#6B1D52] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Partner With Us →</span>
                </button>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52] tracking-wide">
                  Our Corporate Partners
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  We collaborate with leading textile, garment, industrial and healthcare enterprise partners to deliver vocational training & direct job placements.
                </p>
              </div>

              {/* Grid of Exactly 4 Prominent Corporate Partner Logos with Large Circles & High-Visibility Images */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-3">
                {officialPartners.slice(0, 4).map((p, idx) => (
                  <div 
                    key={idx} 
                    onClick={handleHomeCompanyClick}
                    className="p-1 transition-all text-center flex flex-col items-center justify-between group cursor-pointer"
                  >
                    {/* Extra Large Circular Partner Logo Container */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-white border-3 border-pink-200 group-hover:border-[#C52B75] flex items-center justify-center p-3 shadow-md group-hover:scale-105 transition-all mb-3 overflow-hidden shrink-0 mx-auto">
                      <img 
                        src={p.logo} 
                        alt={p.name} 
                        className="w-full h-full object-contain rounded-full filter drop-shadow-xs"
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-[#C52B75] transition-colors line-clamp-2">
                      {p.name}
                    </h4>
                    <span className={`text-[9px] sm:text-[10px] ${p.badgeColor} border font-extrabold px-2.5 py-0.5 rounded-full mt-1.5 inline-block`}>
                      {p.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePartnerWithUs}
              className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>View all partners</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT PART: SUCCESS STORIES */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-pink-100/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#C52B75] tracking-widest bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 inline-block font-serif">
                  Trainee Testimonials
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handlePrev}
                    className="p-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#6B1D52] transition-colors cursor-pointer border border-pink-200"
                    aria-label="Previous story"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#6B1D52] transition-colors cursor-pointer border border-pink-200"
                    aria-label="Next story"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52] tracking-wide flex items-center gap-2">
                  <Quote className="w-5 h-5 text-[#C52B75]" />
                  <span>Success Stories</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  Real skills create real opportunities. Our participants are building confidence and financial independence.
                </p>
              </div>

              {/* Story Testimonial Box */}
              <div className="bg-[#FFF7F6] p-4 sm:p-5 rounded-2xl border border-pink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={stories[currentSlide].image}
                      alt={stories[currentSlide].name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#C52B75] shadow-xs shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-serif font-black text-[#6B1D52]">
                        {stories[currentSlide].name}
                      </h4>
                      <span className="text-2xs font-bold text-[#C52B75] bg-pink-100/80 px-2.5 py-0.5 rounded-full border border-pink-200 inline-block mt-0.5">
                        {stories[currentSlide].role}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1 font-serif">
                    <MapPin className="w-3 h-3 text-[#C52B75]" />
                    <span>{stories[currentSlide].location}</span>
                  </span>
                </div>

                <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-serif pt-1">
                  "{stories[currentSlide].quote}"
                </blockquote>
              </div>
            </div>

            <button
              onClick={() => {
                if (setActiveSection) setActiveSection('stories');
              }}
              className="w-full bg-[#FFF7F6] hover:bg-pink-100/60 text-[#6B1D52] font-black text-xs sm:text-sm py-3.5 px-5 rounded-full border border-pink-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>View All Success Stories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
