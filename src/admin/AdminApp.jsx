import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { db, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from '../firebase';
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
import StaffView from './views/StaffView';
import TrainersView from './views/TrainersView';
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('lvs_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
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

  // Datasets State fetched directly from Cloud Firebase Firestore Database
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [partners, setPartners] = useState([]);
  const [donations, setDonations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stories, setStories] = useState([]);
  const [programs, setPrograms] = useState(initialPrograms);

  const handleAddProgram = (newProg) => {
    setPrograms((prev) => [newProg, ...prev]);
    showToast(`New NQR Qualification Pack (${newProg.qpCode || newProg.name}) created successfully!`, 'success');
  };

  const [centers, setCenters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [documents, setDocuments] = useState(initialDocuments);

  // Firestore Direct CRUD Handlers
  const handleAddCenter = async (newCenter) => {
    try {
      const cleanItem = JSON.parse(JSON.stringify(newCenter));
      await addDoc(collection(db, "training_centers"), cleanItem);
      showToast(`Training Centre ${newCenter.name} saved to Firebase!`, 'success');
    } catch (e) {
      console.warn("Firestore add center error:", e);
      setCenters(prev => [newCenter, ...prev]);
    }
  };

  const handleUpdateCenter = async (updatedCenter) => {
    try {
      const cleanItem = JSON.parse(JSON.stringify(updatedCenter));
      const target = centers.find(c => c.id === updatedCenter.id || c.firestoreId === updatedCenter.firestoreId);
      if (target && target.firestoreId) {
        await updateDoc(doc(db, "training_centers", target.firestoreId), cleanItem);
      } else {
        await addDoc(collection(db, "training_centers"), cleanItem);
      }
      showToast(`Training Centre ${updatedCenter.name} updated!`, 'success');
    } catch (e) {
      console.warn("Firestore update center error:", e);
    }
  };

  const handleDeleteCenter = async (centerId) => {
    try {
      const target = centers.find(c => c.id === centerId || c.firestoreId === centerId);
      if (target && target.firestoreId) {
        await deleteDoc(doc(db, "training_centers", target.firestoreId));
        showToast(`Training Centre deleted.`, 'info');
      } else {
        setCenters(prev => prev.filter(c => c.id !== centerId));
      }
    } catch (e) {
      console.warn("Firestore delete center error:", e);
    }
  };

  const handleAddBatch = async (newBatch) => {
    try {
      const cleanItem = JSON.parse(JSON.stringify(newBatch));
      await addDoc(collection(db, "batches"), cleanItem);
      showToast(`Batch ${newBatch.id} created successfully!`, 'success');
    } catch (e) {
      console.warn("Firestore add batch error:", e);
      setBatches(prev => [newBatch, ...prev]);
    }
  };

  const handleUpdateBatch = async (updatedBatch) => {
    try {
      const cleanItem = JSON.parse(JSON.stringify(updatedBatch));
      const target = batches.find(b => b.id === updatedBatch.id || b.firestoreId === updatedBatch.firestoreId);
      if (target && target.firestoreId) {
        await updateDoc(doc(db, "batches", target.firestoreId), cleanItem);
      } else {
        await addDoc(collection(db, "batches"), cleanItem);
      }
      showToast(`Batch ${updatedBatch.id} updated!`, 'success');
    } catch (e) {
      console.warn("Firestore update batch error:", e);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    try {
      const target = batches.find(b => b.id === batchId || b.firestoreId === batchId);
      if (target && target.firestoreId) {
        await deleteDoc(doc(db, "batches", target.firestoreId));
        showToast(`Batch deleted.`, 'info');
      } else {
        setBatches(prev => prev.filter(b => b.id !== batchId));
      }
    } catch (e) {
      console.warn("Firestore delete batch error:", e);
    }
  };

  const handleSetTrainers = (val) => {
    setTrainers(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      (async () => {
        try {
          if (next.length < prev.length) {
            const deleted = prev.filter(p => !next.some(n => n.id === p.id));
            for (const item of deleted) {
              if (item.firestoreId) await deleteDoc(doc(db, "trainers", item.firestoreId));
            }
          } else if (next.length > prev.length) {
            const added = next.filter(n => !n.firestoreId && !prev.some(p => p.id === n.id));
            for (const item of added) {
              const cleanItem = JSON.parse(JSON.stringify(item));
              await addDoc(collection(db, "trainers"), cleanItem);
            }
          } else {
            for (const item of next) {
              const prevItem = prev.find(p => p.id === item.id);
              if (prevItem && JSON.stringify(prevItem) !== JSON.stringify(item) && item.firestoreId) {
                const cleanItem = JSON.parse(JSON.stringify(item));
                await updateDoc(doc(db, "trainers", item.firestoreId), cleanItem);
              }
            }
          }
        } catch (e) { console.warn("Firestore trainers sync notice:", e); }
      })();
      return next;
    });
  };

  const handleSetStudents = (val) => {
    setStudents(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      (async () => {
        try {
          if (next.length < prev.length) {
            const deleted = prev.filter(p => !next.some(n => n.id === p.id));
            for (const item of deleted) {
              if (item.firestoreId) await deleteDoc(doc(db, "students", item.firestoreId));
            }
          } else if (next.length > prev.length) {
            const added = next.filter(n => !n.firestoreId && !prev.some(p => p.id === n.id));
            for (const item of added) {
              const cleanItem = JSON.parse(JSON.stringify(item));
              await addDoc(collection(db, "students"), cleanItem);
            }
          } else {
            for (const item of next) {
              const prevItem = prev.find(p => p.id === item.id);
              if (prevItem && JSON.stringify(prevItem) !== JSON.stringify(item) && item.firestoreId) {
                const cleanItem = JSON.parse(JSON.stringify(item));
                await updateDoc(doc(db, "students", item.firestoreId), cleanItem);
              }
            }
          }
        } catch (e) { console.warn("Firestore students sync notice:", e); }
      })();
      return next;
    });
  };

  const handleSetCertificates = (val) => {
    setCertificates(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      (async () => {
        try {
          if (next.length > prev.length) {
            const added = next.filter(n => !n.firestoreId && !prev.some(p => (p.certNo && p.certNo === n.certNo) || p.id === n.id));
            for (const item of added) {
              const cleanItem = JSON.parse(JSON.stringify(item));
              await addDoc(collection(db, "certificates"), cleanItem);
            }
          } else if (next.length < prev.length) {
            const deleted = prev.filter(p => !next.some(n => n.certNo === p.certNo || n.id === p.id));
            for (const item of deleted) {
              if (item.firestoreId) await deleteDoc(doc(db, "certificates", item.firestoreId));
            }
          }
        } catch (e) { console.warn("Firestore certificates sync notice:", e); }
      })();
      return next;
    });
  };

  const handleSaveAttendance = async (attendanceRecord) => {
    try {
      const cleanItem = JSON.parse(JSON.stringify(attendanceRecord));
      await addDoc(collection(db, "attendance"), cleanItem);
      showToast(`Attendance for batch ${attendanceRecord.batch} saved to database!`, 'success');
    } catch (e) {
      console.warn("Firestore attendance save notice:", e);
    }
  };

  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);

  // Selected Item Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [firestoreNotCreated, setFirestoreNotCreated] = useState(false);

  // Real-time synchronization with Firebase Firestore Database (Direct Cloud DB -> Admin Portal)
  useEffect(() => {
    const unsubscribes = [];

    const handleFirestoreError = (error, context) => {
      console.warn(`Firestore ${context} sync notice:`, error);
      if (error?.code === 'not-found' || error?.message?.includes('NOT_FOUND') || error?.message?.includes('Code: 5')) {
        setFirestoreNotCreated(true);
      }
    };

    // 1. Applications (training_applications)
    try {
      const q = collection(db, "training_applications");
      const unsub = onSnapshot(q, (snapshot) => {
        setFirestoreNotCreated(false);
        const firestoreApps = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));

        setApplications(prev => {
          const map = new Map();
          [...firestoreApps, ...prev].forEach(item => {
            if (item && item.id) map.set(item.id, { ...map.get(item.id), ...item });
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.applicationDate || 0).getTime();
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.applicationDate || 0).getTime();
            return timeB - timeA;
          });
          return merged;
        });
      }, (error) => handleFirestoreError(error, 'training_applications'));
      unsubscribes.push(unsub);
    } catch (err) {
      console.warn("Firestore setup notice:", err);
    }

    // 2. Donations (donations)
    try {
      const q = collection(db, "donations");
      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreDonations = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));
        firestoreDonations.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || 0).getTime();
          return timeB - timeA;
        });
        setDonations(firestoreDonations);
      }, (error) => console.warn("Firestore donations sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 3. Contacts (contacts)
    try {
      const q = collection(db, "contacts");
      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreContacts = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));
        firestoreContacts.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || 0).getTime();
          return timeB - timeA;
        });
        setContacts(firestoreContacts);
      }, (error) => console.warn("Firestore contacts sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 4. Volunteers (volunteers)
    try {
      const q = collection(db, "volunteers");
      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreVolunteers = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));
        firestoreVolunteers.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.applicationDate || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.applicationDate || 0).getTime();
          return timeB - timeA;
        });
        setVolunteers(firestoreVolunteers);
      }, (error) => console.warn("Firestore volunteers sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 5. Partners (partners)
    try {
      const q = collection(db, "partners");
      const unsub = onSnapshot(q, (snapshot) => {
        const firestorePartners = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));
        firestorePartners.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.dateJoined || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.dateJoined || 0).getTime();
          return timeB - timeA;
        });
        setPartners(firestorePartners);
      }, (error) => console.warn("Firestore partners sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 6. Placements (placements)
    try {
      const q = collection(db, "placements");
      const unsub = onSnapshot(q, (snapshot) => {
        const firestorePlacements = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          firestoreId: docSnap.id
        }));
        firestorePlacements.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.joiningDate || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.joiningDate || 0).getTime();
          return timeB - timeA;
        });
        setPlacements(firestorePlacements);
      }, (error) => console.warn("Firestore placements sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 7. Training Centers (training_centers)
    try {
      const q = collection(db, "training_centers");
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), firestoreId: docSnap.id }));
        setCenters(items);
      }, (error) => console.warn("Firestore training_centers sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 8. Batches (batches)
    try {
      const q = collection(db, "batches");
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), firestoreId: docSnap.id }));
        setBatches(items);
      }, (error) => console.warn("Firestore batches sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 9. Trainers (trainers)
    try {
      const q = collection(db, "trainers");
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), firestoreId: docSnap.id }));
        setTrainers(items);
      }, (error) => console.warn("Firestore trainers sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 10. Students (students)
    try {
      const q = collection(db, "students");
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), firestoreId: docSnap.id }));
        setStudents(items);
      }, (error) => console.warn("Firestore students sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 11. Certificates (certificates)
    try {
      const q = collection(db, "certificates");
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), firestoreId: docSnap.id }));
        setCertificates(items);
      }, (error) => console.warn("Firestore certificates sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    // 12. Attendance (attendance)
    try {
      const q = collection(db, "attendance");
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), firestoreId: docSnap.id }));
        setAttendance(items);
      }, (error) => console.warn("Firestore attendance sync notice:", error));
      unsubscribes.push(unsub);
    } catch (err) {}

    return () => {
      unsubscribes.forEach(unsub => unsub && unsub());
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
        setContacts((prev) => {
          const exists = prev.some(item => (item.id && item.id === e.detail.id) || (item.firestoreId && item.firestoreId === e.detail.firestoreId));
          if (exists) return prev;
          return [e.detail, ...prev];
        });
        showToast(`New Contact Inquiry from ${e.detail.name || 'Visitor'}!`, 'info');
      }
    };

    const handleNewDonation = (e) => {
      if (e.detail) {
        setDonations((prev) => {
          const exists = prev.some(item => (item.id && item.id === e.detail.id) || (item.firestoreId && item.firestoreId === e.detail.firestoreId));
          if (exists) return prev;
          return [e.detail, ...prev];
        });
        showToast(`New Donation received from ${e.detail.donor || 'Donor'} (${e.detail.amount})!`, 'success');
      }
    };

    const handleNewPartner = (e) => {
      if (e.detail) {
        setPartners((prev) => {
          const exists = prev.some(item => (item.id && item.id === e.detail.id) || (item.firestoreId && item.firestoreId === e.detail.firestoreId));
          if (exists) return prev;
          return [e.detail, ...prev];
        });
        showToast(`New Partner Application from ${e.detail.orgName || 'Organization'}!`, 'info');
      }
    };

    const handleNewPlacement = (e) => {
      if (e.detail) {
        setPlacements((prev) => {
          const exists = prev.some(item => (item.id && item.id === e.detail.id) || (item.firestoreId && item.firestoreId === e.detail.firestoreId));
          if (exists) return prev;
          return [e.detail, ...prev];
        });
        showToast(`New Placement Request for ${e.detail.student || 'Trainee'}!`, 'info');
      }
    };

    const handleNewVolunteer = (e) => {
      if (e.detail) {
        setVolunteers((prev) => {
          const exists = prev.some(item => (item.id && item.id === e.detail.id) || (item.firestoreId && item.firestoreId === e.detail.firestoreId));
          if (exists) return prev;
          return [e.detail, ...prev];
        });
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
      localStorage.setItem('lvs_admin_auth', 'true');
    } catch (e) {}
    setAdminUser(userToUse);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${userToUse.name}! Connected to Life Vision Society Admin.`, 'success');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('lvs_admin_auth');
    } catch (e) {}
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
        return (
          <TrainingCentersView 
            centers={centers} 
            batches={batches}
            students={students}
            onAddCenter={handleAddCenter} 
            onUpdateCenter={handleUpdateCenter}
            onDeleteCenter={handleDeleteCenter}
            showToast={showToast} 
          />
        );
      case 'batches':
        return (
          <BatchesView 
            batches={batches} 
            centers={centers} 
            trainers={trainers} 
            students={students} 
            attendance={attendance}
            certificates={certificates}
            onAddBatch={handleAddBatch}
            onUpdateBatch={handleUpdateBatch}
            onDeleteBatch={handleDeleteBatch}
            showToast={showToast} 
          />
        );
      case 'trainers':
        return <TrainersView trainers={trainers} setTrainers={handleSetTrainers} centers={centers} batches={batches} showToast={showToast} />;
      case 'students':
        return <StudentsView students={students} setStudents={handleSetStudents} centers={centers} batches={batches} showToast={showToast} filter={activeTab} />;
      case 'attendance':
        return <AttendanceView batches={batches} centers={centers} students={students} setStudents={handleSetStudents} attendance={attendance} onSaveAttendance={handleSaveAttendance} showToast={showToast} />;
      case 'assessments':
        return <AssessmentView batches={batches} centers={centers} students={students} setStudents={handleSetStudents} showToast={showToast} />;
      case 'certificates':
        return <CertificatesView certificates={certificates} setCertificates={handleSetCertificates} students={students} showToast={showToast} />;
      case 'training-reports':
        return <ReportsView centers={centers} batches={batches} students={students} trainers={trainers} certificates={certificates} activeSubTab="report-training" showToast={showToast} />;

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
          {firestoreNotCreated && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-start space-x-3 text-xs shadow-xs animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-amber-950">Action Required: Cloud Firestore Database Not Initialized</h4>
                <p>
                  Cloud Firestore has not been created yet in your Firebase Console project (<code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">life-vision-society</code>).
                  Because the database is missing in Firebase, form submissions currently fallback to local browser storage and cannot sync across different devices.
                </p>
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="font-bold text-amber-900">How to Fix (Takes 30 Seconds):</p>
                  <ol className="list-decimal ml-4 mt-1 space-y-1 text-amber-800">
                    <li>Open <a href="https://console.firebase.google.com/project/life-vision-society/firestore" target="_blank" rel="noreferrer" className="underline font-bold text-amber-700 hover:text-amber-900">Firebase Console &gt; Cloud Firestore</a>.</li>
                    <li>Click <strong>"Create database"</strong>.</li>
                    <li>Select location (e.g. <code>asia-south1 (Mumbai)</code> or <code>us-central</code>).</li>
                    <li>Select <strong>Start in test mode</strong> (or allow read/write in Rules tab).</li>
                  </ol>
                  <p className="mt-2 text-emerald-800 font-semibold">
                    Once created, refresh this page and all forms will automatically save to the cloud database and sync across all devices!
                  </p>
                </div>
              </div>
            </div>
          )}
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

            setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, timelineStep: updatedStep } : a));
            setSelectedApp(prev => prev && prev.id === id ? { ...prev, status: newStatus, timelineStep: updatedStep } : null);

            if (targetApp) {
              if (newStatus === 'Selected' || newStatus === 'Approved' || newStatus === 'Shortlisted') {
                handleSetStudents(prev => {
                  const alreadyStudent = prev.some(s => s.phone === targetApp.mobile || s.name === targetApp.name);
                  if (alreadyStudent) return prev;
                  const nextIdNum = String(prev.length + 1).padStart(4, '0');
                  const newStudentObj = {
                    id: `LVS-STUDENT-2026-${nextIdNum}`,
                    name: targetApp.name || 'Student Candidate',
                    photo: targetApp.photo || '/success_story.jpg',
                    gender: targetApp.gender || 'Female',
                    dob: targetApp.dob || '',
                    phone: targetApp.mobile || targetApp.phone || '',
                    email: targetApp.email || '',
                    address: targetApp.address || targetApp.district || 'Odisha',
                    course: targetApp.course || 'Tailoring & Stitching',
                    center: targetApp.preferredCenter || 'Bhubaneswar LVS Skill Center',
                    batch: targetApp.preferredBatch || 'BATCH-2026-T1',
                    attendance: '100%',
                    status: 'Enrolled',
                    assessmentScore: 'Pending',
                    certificateStatus: 'In Progress',
                    placementStatus: 'Enrolled',
                    enrollmentDate: new Date().toISOString().split('T')[0]
                  };
                  return [newStudentObj, ...prev];
                });
              }
            }

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
            setApplications(prev => prev.map(a => a.id === id ? { ...a, preferredBatch: batch, timelineStep: 5 } : a));
            setSelectedApp(prev => prev && prev.id === id ? { ...prev, preferredBatch: batch, timelineStep: 5 } : null);

            if (targetApp) {
              handleSetStudents(prev => {
                const alreadyStudent = prev.some(s => s.phone === targetApp.mobile || s.name === targetApp.name);
                if (alreadyStudent) {
                  return prev.map(s => (s.phone === targetApp.mobile || s.name === targetApp.name) ? { ...s, batch } : s);
                }
                const nextIdNum = String(prev.length + 1).padStart(4, '0');
                const newStudentObj = {
                  id: `LVS-STUDENT-2026-${nextIdNum}`,
                  name: targetApp.name || 'Student Candidate',
                  photo: targetApp.photo || '/success_story.jpg',
                  gender: targetApp.gender || 'Female',
                  phone: targetApp.mobile || targetApp.phone || '',
                  email: targetApp.email || '',
                  course: targetApp.course || 'Tailoring & Stitching',
                  center: targetApp.preferredCenter || 'Bhubaneswar LVS Skill Center',
                  batch: batch,
                  attendance: '100%',
                  status: 'Enrolled',
                  assessmentScore: 'Pending',
                  certificateStatus: 'In Progress',
                  placementStatus: 'Enrolled',
                  enrollmentDate: new Date().toISOString().split('T')[0]
                };
                return [newStudentObj, ...prev];
              });
            }

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
