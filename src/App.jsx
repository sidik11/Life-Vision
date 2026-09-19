import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GetInvolvedSection from './components/GetInvolvedSection';
import TrainingPrograms from './components/TrainingPrograms';
import EmploymentJourney from './components/EmploymentJourney';
import ImpactStats from './components/ImpactStats';
import TrustPartnersStories from './components/TrustPartnersStories';
import Footer from './components/Footer';
import ApplyModal from './components/ApplyModal';
import DonateModal from './components/DonateModal';
import VolunteerModal from './components/VolunteerModal';
import CsrPartnerModal from './components/CsrPartnerModal';
import CollaborateModal from './components/CollaborateModal';
import StudentPlacementModal from './components/StudentPlacementModal';
import FloatingCallButton from './components/FloatingCallButton';

// Dedicated Page Views
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import TrainingHubPage from './pages/TrainingHubPage';
import StoriesPage from './pages/StoriesPage';
import ContactPage from './pages/ContactPage';
import DonatePage from './pages/DonatePage';

// Standalone Isolated Admin Panel
import AdminApp from './admin/AdminApp';

import VerifyCertificatePage from './pages/VerifyCertificatePage';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin');
  });

  const [verifyCertCode, setVerifyCertCode] = useState(() => {
    const hash = window.location.hash;
    if (hash.includes('verify-certificate')) {
      const parts = hash.split('verify-certificate/');
      return parts[1] || '';
    }
    return null;
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin'));
      const hash = window.location.hash;
      if (hash.includes('verify-certificate')) {
        const parts = hash.split('verify-certificate/');
        setVerifyCertCode(parts[1] || '');
      } else {
        setVerifyCertCode(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const [activeSection, setActiveSection] = useState('home');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('Tailoring & Stitching Training');
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [isCsrOpen, setIsCsrOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [isStudentPlacementOpen, setIsStudentPlacementOpen] = useState(false);

  const handleOpenApply = (courseName) => {
    if (courseName && typeof courseName === 'string') {
      setSelectedCourse(courseName);
    }
    setIsApplyOpen(true);
  };

  const handleOpenDonate = () => {
    handleSectionChange('donate');
  };

  const handleOpenStudentPlacement = () => {
    setIsStudentPlacementOpen(true);
  };

  const handleSectionChange = (sectionId, targetId) => {
    if (sectionId === 'admin') {
      window.history.pushState({}, '', '/admin');
      setIsAdmin(true);
      return;
    }
    const targetSection = sectionId === 'placement' ? 'training' : (sectionId === 'partners' ? 'about' : sectionId);
    setActiveSection(targetSection);
    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Completely separate isolated Admin Panel view
  if (isAdmin) {
    return <AdminApp />;
  }

  if (verifyCertCode !== null) {
    return (
      <VerifyCertificatePage 
        certCodeFromUrl={verifyCertCode} 
        onBackToHome={() => {
          window.location.hash = '#/';
          setVerifyCertCode(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7F6] text-slate-800 font-sans">
      {/* Single Unified Navigation Bar */}
      <Navbar 
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        onOpenDonate={handleOpenDonate}
        onOpenVolunteer={() => setIsVolunteerOpen(true)}
        onOpenCsr={() => setIsCsrOpen(true)}
        onOpenApply={() => handleOpenApply('Tailoring & Stitching Training')}
        onOpenStudentPlacement={handleOpenStudentPlacement}
      />

      {/* Dynamic Multi-Page Router View */}
      <main className="flex-grow">
        {activeSection === 'home' && (
          <>
            <Hero 
              onOpenDonate={handleOpenDonate}
              onOpenVolunteer={() => setIsVolunteerOpen(true)}
              onOpenStudentPlacement={handleOpenStudentPlacement}
              onOpenApply={() => handleOpenApply('Tailoring & Stitching Training')}
              setActiveSection={handleSectionChange}
            />

            <GetInvolvedSection 
              onOpenDonate={handleOpenDonate}
              onOpenVolunteer={() => setIsVolunteerOpen(true)}
              onOpenCsr={() => setIsCsrOpen(true)}
              onOpenStudentPlacement={handleOpenStudentPlacement}
              onOpenApply={handleOpenApply}
              setActiveSection={handleSectionChange}
            />

            <TrainingPrograms 
              limit={3}
              onOpenApply={handleOpenApply}
              onOpenDonate={handleOpenDonate}
              onOpenStudentPlacement={handleOpenStudentPlacement}
              setActiveSection={handleSectionChange}
            />

            <EmploymentJourney 
              onOpenApply={() => handleOpenApply('Tailoring & Stitching Training')}
              setActiveSection={handleSectionChange}
            />

            <ImpactStats 
              onOpenDonate={handleOpenDonate}
            />

            <TrustPartnersStories 
              setActiveSection={handleSectionChange}
              onOpenApply={() => handleOpenApply('Tailoring & Stitching Training')}
              onOpenCsr={() => setIsCsrOpen(true)}
              onOpenCollab={() => setIsCollabOpen(true)}
            />
          </>
        )}

        {activeSection === 'about' && (
          <AboutPage 
            onOpenApply={handleOpenApply}
            onOpenDonate={handleOpenDonate}
            onOpenCsr={() => setIsCsrOpen(true)}
            onOpenCollab={() => setIsCollabOpen(true)}
            navigateTo={handleSectionChange}
          />
        )}

        {activeSection === 'programs' && (
          <ProgramsPage 
            onOpenApply={handleOpenApply}
            onOpenDonate={handleOpenDonate}
          />
        )}

        {activeSection === 'training' && (
          <TrainingHubPage 
            onOpenApply={handleOpenApply}
            onOpenStudentPlacement={handleOpenStudentPlacement}
          />
        )}

        {(activeSection === 'stories' || activeSection === 'gallery' || activeSection === 'activities' || activeSection === 'impact' || activeSection === 'news' || activeSection === 'events') && (
          <StoriesPage 
            onOpenApply={handleOpenApply}
            onOpenDonate={() => setIsDonateOpen(true)}
          />
        )}

        {activeSection === 'contact' && (
          <ContactPage />
        )}

        {activeSection === 'donate' && (
          <DonatePage onOpenApply={handleOpenApply} />
        )}
      </main>

      {/* Footer */}
      <Footer 
        setActiveSection={handleSectionChange}
      />

      {/* Modals */}
      <ApplyModal 
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        selectedCourse={selectedCourse}
      />

      <DonateModal 
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      <VolunteerModal
        isOpen={isVolunteerOpen}
        onClose={() => setIsVolunteerOpen(false)}
      />

      <CsrPartnerModal
        isOpen={isCsrOpen}
        onClose={() => setIsCsrOpen(false)}
      />

      <CollaborateModal
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
      />

      <StudentPlacementModal
        isOpen={isStudentPlacementOpen}
        onClose={() => setIsStudentPlacementOpen(false)}
      />

      {/* Floating Call & Donate Widgets */}
      <FloatingCallButton onOpenDonate={() => handleSectionChange('donate')} />
    </div>
  );
}
