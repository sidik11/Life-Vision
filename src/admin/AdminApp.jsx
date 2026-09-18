import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from '../firebase';
import AdminLogin from './components/AdminLogin';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Toast from './components/Common/Toast';

// Views
import DashboardView from './views/DashboardView';
import TrainingAppsView from './views/TrainingAppsView';
import AppDetailsModal from './views/AppDetailsModal';
import TrainingProgramsView from './views/TrainingProgramsView';
import TrainingCentersView from './views/TrainingCentersView';
import BatchesView from './views/BatchesView';
import StudentsView from './views/StudentsView';
import AttendanceView from './views/AttendanceView';
import AssessmentView from './views/AssessmentView';
import CertificatesView from './views/CertificatesView';
import PlacementView from './views/PlacementView';
import PartnersView from './views/PartnersView';
import VolunteersView from './views/VolunteersView';
import DonationsView from './views/DonationsView';
import SuccessStoriesView from './views/SuccessStoriesView';
import ContentCmsView from './views/ContentCmsView';
import DocumentsView from './views/DocumentsView';
import NotificationsView from './views/NotificationsView';
import UsersRolesView from './views/UsersRolesView';
import SettingsView from './views/SettingsView';
import StaffView from './views/StaffView';
import ReportsView from './views/ReportsView';

// Real Data fetched directly from Public Website
import { 
  initialApplications, initialPrograms, initialCenters, 
  initialBatches, initialStudents, initialCertificates, 
  initialPlacements, initialPartners, initialVolunteers, 
  initialDonations, initialStories, initialDocuments, 
  initialAdminUsers 
} from './mockData';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lvs_admin_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Life Vision Society',
      email: 'support.lifevision@gmail.com',
      role: 'Super Admin',
      phone: '+91 98610 12345',
      avatar: '/image/logo.png'
    };
  });

  const handleUpdateAdminUser = (updatedData) => {
    setAdminUser(prev => {
      const nextUser = typeof updatedData === 'function' ? updatedData(prev) : { ...prev, ...updatedData };
      try {
        localStorage.setItem('lvs_admin_profile', JSON.stringify(nextUser));
      } catch (e) {}
      return nextUser;
    });
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Datasets State initialized ONLY with Real Public Website Submissions
  const [applications, setApplications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_applications') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [placements, setPlacements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_placements') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [partners, setPartners] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_partners') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [donations, setDonations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_donations') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [contacts, setContacts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_contacts') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [volunteers, setVolunteers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_volunteers') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [stories, setStories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_stories') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [programs, setPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem('lvs_submitted_programs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialPrograms;
  });

  const handleAddProgram = (newProg) => {
    setPrograms((prev) => {
      const updated = [newProg, ...prev];
      try {
        localStorage.setItem('lvs_submitted_programs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`New NQR Qualification Pack (${newProg.qpCode || newProg.name}) created successfully!`, 'success');
  };

  const [centers, setCenters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_centers') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [batches, setBatches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_batches') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [students, setStudents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_students') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [certificates, setCertificates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_certificates') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [documents, setDocuments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lvs_submitted_documents') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);

  // Selected Item Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  // Real-time synchronization with Firebase Firestore for Training Applications
  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, "training_applications"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreApps = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));

        setApplications(prev => {
          // Merge Firestore apps with any local-only submissions
          const firestoreIds = new Set(firestoreApps.map(a => a.id));
          const localOnly = prev.filter(a => !firestoreIds.has(a.id));
          const merged = [...firestoreApps, ...localOnly];
          try {
            localStorage.setItem('lvs_submitted_applications', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }, (error) => {
        console.warn("Firestore training_applications sync notice:", error);
      });
    } catch (err) {
      console.warn("Firestore setup notice:", err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync state with window event listeners for real public submissions
  useEffect(() => {
    const handleNewApplication = (e) => {
      if (e.detail) {
        setApplications((prev) => {
          const exists = prev.some(a => a.id === e.detail.id);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
        showToast(`New Application received from ${e.detail.fullName || e.detail.name || 'Student'}!`, 'info');
      }
    };

    const handleNewContact = (e) => {
      if (e.detail) {
        setContacts((prev) => [e.detail, ...prev]);
        showToast(`New Contact Inquiry from ${e.detail.name || 'Visitor'}!`, 'info');
      }
    };

    const handleNewDonation = (e) => {
      if (e.detail) {
        setDonations((prev) => [e.detail, ...prev]);
        showToast(`New Donation received from ${e.detail.donor || 'Donor'} (${e.detail.amount})!`, 'success');
      }
    };

    const handleNewPartner = (e) => {
      if (e.detail) {
        setPartners((prev) => [e.detail, ...prev]);
        showToast(`New Partner Application from ${e.detail.orgName || 'Organization'}!`, 'info');
      }
    };

    const handleNewPlacement = (e) => {
      if (e.detail) {
        setPlacements((prev) => [e.detail, ...prev]);
        showToast(`New Placement Request for ${e.detail.student || 'Trainee'}!`, 'info');
      }
    };

    const handleNewVolunteer = (e) => {
      if (e.detail) {
        setVolunteers((prev) => [e.detail, ...prev]);
        showToast(`New Volunteer Application from ${e.detail.name || 'Volunteer'}!`, 'info');
      }
    };

    window.addEventListener('lvs_new_application', handleNewApplication);
    window.addEventListener('lvs_new_contact', handleNewContact);
    window.addEventListener('lvs_new_donation', handleNewDonation);
    window.addEventListener('lvs_new_partner', handleNewPartner);
    window.addEventListener('lvs_new_placement', handleNewPlacement);
    window.addEventListener('lvs_new_volunteer', handleNewVolunteer);

    return () => {
      window.removeEventListener('lvs_new_application', handleNewApplication);
      window.removeEventListener('lvs_new_contact', handleNewContact);
      window.removeEventListener('lvs_new_donation', handleNewDonation);
      window.removeEventListener('lvs_new_partner', handleNewPartner);
      window.removeEventListener('lvs_new_placement', handleNewPlacement);
      window.removeEventListener('lvs_new_volunteer', handleNewVolunteer);
    };
  }, []);

  const handleLogin = (user) => {
    let userToUse = user;
    try {
      const saved = localStorage.getItem('lvs_admin_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        userToUse = { ...user, ...parsed };
      } else {
        localStorage.setItem('lvs_admin_profile', JSON.stringify(user));
      }
    } catch (e) {}
    setAdminUser(userToUse);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${userToUse.name}! Connected to Life Vision Society Admin.`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Logged out successfully.', 'info');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            applications={applications} 
            placements={placements}
            partners={partners}
            donations={donations}
            contacts={contacts}
            programs={programs}
            centers={centers}
            batches={batches}
            students={students}
            onNavigate={(tab) => setActiveTab(tab)}
            onViewApp={(app) => setSelectedApp(app)}
          />
        );

      // 📚 TRAINING
      case 'programs':
        return (
          <TrainingProgramsView 
            programs={programs} 
            setPrograms={setPrograms} 
            onAddProgram={handleAddProgram} 
            applications={applications}
            setApplications={setApplications}
            onViewApp={(app) => setSelectedApp(app)}
            showToast={showToast} 
          />
        );
      case 'centers':
        return <TrainingCentersView centers={centers} setCenters={setCenters} showToast={showToast} />;
      case 'batches':
        return <BatchesView batches={batches} setBatches={setBatches} showToast={showToast} />;
      case 'students':
      case 'trainers':
        return <StudentsView students={students} setStudents={setStudents} showToast={showToast} filter={activeTab} />;
      case 'attendance':
        return <AttendanceView batches={batches} students={students} showToast={showToast} />;
      case 'assessments':
        return <AssessmentView students={students} showToast={showToast} />;
      case 'certificates':
        return <CertificatesView certificates={certificates} setCertificates={setCertificates} students={students} showToast={showToast} />;
      case 'training-reports':
        return <ReportsView activeSubTab="report-training" showToast={showToast} />;

      // 💼 PLACEMENT
      case 'placement':
      case 'placement-overview':
      case 'students-seeking-jobs':
      case 'job-opportunities':
      case 'interviews':
      case 'selected-students':
      case 'employed-students':
      case 'self-employed':
        return <PlacementView placements={placements} setPlacements={setPlacements} showToast={showToast} activeSubTab={activeTab} />;
      case 'placement-reports':
        return <ReportsView activeSubTab="report-placement" showToast={showToast} />;

      // 🤝 PARTNERS
      case 'partners':
      case 'all-partners':
      case 'csr-partners':
      case 'corporate-partners':
      case 'training-partners':
      case 'employment-partners':
      case 'ngo-partners':
      case 'gov-partners':
      case 'partner-applications':
        return <PartnersView partners={partners} setPartners={setPartners} showToast={showToast} activeSubTab={activeTab} />;

      // 💰 DONATIONS
      case 'donations':
      case 'donation-overview':
      case 'all-donations':
      case 'successful-donations':
      case 'pending-donations':
      case 'failed-donations':
      case 'campaigns':
      case 'donation-receipts':
        return <DonationsView donations={donations} setDonations={setDonations} showToast={showToast} activeSubTab={activeTab} />;

      // ⭐ SUCCESS STORIES
      case 'stories':
      case 'all-stories':
      case 'add-success-story':
      case 'featured-stories':
      case 'draft-stories':
      case 'published-stories':
        return <SuccessStoriesView stories={stories} setStories={setStories} showToast={showToast} activeSubTab={activeTab} />;

      // 👥 STAFF MEMBERS
      case 'staff':
      case 'all-staff':
      case 'add-staff':
      case 'staff-id-cards':
      case 'staff-attendance':
      case 'leave-management':
      case 'staff-documents':
      case 'staff-departments':
      case 'staff-reports':
        return <StaffView activeSubTab={activeTab} showToast={showToast} />;

      // 🙋 VOLUNTEERS
      case 'volunteers':
      case 'all-volunteers':
      case 'volunteer-new-apps':
      case 'active-volunteers':
      case 'volunteer-projects':
      case 'volunteer-reports':
        return <VolunteersView volunteers={volunteers} setVolunteers={setVolunteers} showToast={showToast} activeSubTab={activeTab} />;

      // 📩 APPLICATIONS
      case 'applications':
      case 'app-training':
      case 'app-partner':
      case 'app-volunteer':
      case 'app-contact':
        return (
          <TrainingAppsView 
            applications={applications} 
            setApplications={setApplications}
            onViewApp={(app) => setSelectedApp(app)}
            onDeleteApp={async (appId) => {
              if (window.confirm('Are you sure you want to delete this candidate application?')) {
                const targetApp = applications.find(a => a.id === appId);
                setApplications(prev => {
                  const updated = prev.filter(a => a.id !== appId);
                  try {
                    localStorage.setItem('lvs_submitted_applications', JSON.stringify(updated));
                  } catch (e) {}
                  return updated;
                });
                
                if (targetApp && targetApp.firestoreId) {
                  try {
                    await deleteDoc(doc(db, "training_applications", targetApp.firestoreId));
                  } catch (err) {
                    console.warn("Firebase document delete notice:", err);
                  }
                }
                showToast('Candidate application deleted.', 'info');
              }
            }}
            showToast={showToast}
            activeTab={activeTab}
          />
        );

      // 📰 CONTENT
      case 'content':
      case 'content-news-blog':
      case 'content-events':
      case 'content-gallery':
      case 'content-homepage':
      case 'content-website-sections':
        return <ContentCmsView showToast={showToast} activeSubTab={activeTab} />;

      // 📊 REPORTS
      case 'reports':
      case 'report-training':
      case 'report-student':
      case 'report-placement':
      case 'report-staff':
      case 'report-partner':
      case 'report-donation':
      case 'report-impact':
        return <ReportsView activeSubTab={activeTab} showToast={showToast} />;

      // ⚙️ ADMINISTRATION
      case 'administration':
      case 'admin-users-roles':
        return <UsersRolesView adminUsers={adminUsers} setAdminUsers={setAdminUsers} showToast={showToast} />;
      case 'admin-notifications':
        return <NotificationsView showToast={showToast} />;
      case 'admin-documents':
        return <DocumentsView documents={documents} setDocuments={setDocuments} showToast={showToast} />;
      case 'settings':
      case 'admin-settings':
        return <SettingsView adminUser={adminUser} setAdminUser={handleUpdateAdminUser} showToast={showToast} />;
      case 'admin-activity-logs':
        return <NotificationsView showToast={showToast} activeSubTab="logs" />;

      default:
        return (
          <DashboardView 
            applications={applications} 
            placements={placements}
            partners={partners}
            donations={donations}
            contacts={contacts}
            programs={programs}
            centers={centers}
            batches={batches}
            students={students}
            onNavigate={(tab) => setActiveTab(tab)}
            onViewApp={(app) => setSelectedApp(app)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F6F4] text-slate-800 font-sans overflow-hidden select-none">
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Admin Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <TopHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          setMobileOpen={setMobileOpen}
          user={adminUser} 
          onLogout={handleLogout}
          unreadCount={applications.filter(a => a.status === 'Pending' || a.status === 'Unread' || a.status === 'New').length}
        />

        {/* View Dynamic Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F6F4]">
          {renderActiveView()}
        </main>
      </div>

      {/* Modal Application Viewer */}
      {selectedApp && (
        <AppDetailsModal 
          application={selectedApp} 
          onClose={() => setSelectedApp(null)} 
          onUpdateStatus={async (id, newStatus, step) => {
            const targetApp = applications.find(a => a.id === id);
            const updatedStep = step !== undefined ? step : (targetApp?.timelineStep || 1);

            setApplications(prev => {
              const updated = prev.map(a => a.id === id ? { ...a, status: newStatus, timelineStep: updatedStep } : a);
              try {
                localStorage.setItem('lvs_submitted_applications', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            setSelectedApp(prev => prev && prev.id === id ? { ...prev, status: newStatus, timelineStep: updatedStep } : null);

            if (targetApp && targetApp.firestoreId) {
              try {
                await updateDoc(doc(db, "training_applications", targetApp.firestoreId), {
                  status: newStatus,
                  timelineStep: updatedStep
                });
              } catch (err) {
                console.warn("Firebase document update notice:", err);
              }
            }
            showToast(`Application ${id} status updated to ${newStatus}`);
          }}
          onAssignBatch={async (id, batch) => {
            const targetApp = applications.find(a => a.id === id);
            setApplications(prev => {
              const updated = prev.map(a => a.id === id ? { ...a, preferredBatch: batch, timelineStep: 5 } : a);
              try {
                localStorage.setItem('lvs_submitted_applications', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            setSelectedApp(prev => prev && prev.id === id ? { ...prev, preferredBatch: batch, timelineStep: 5 } : null);

            if (targetApp && targetApp.firestoreId) {
              try {
                await updateDoc(doc(db, "training_applications", targetApp.firestoreId), {
                  preferredBatch: batch,
                  timelineStep: 5
                });
              } catch (err) {
                console.warn("Firebase batch update notice:", err);
              }
            }
            showToast(`Batch ${batch} assigned to candidate ${id}`);
          }}
        />
      )}

    </div>
  );
}
