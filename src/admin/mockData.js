// Life Vision Society - Real Data Store extracted directly from Public Website

export const initialApplications = [
  {
    id: "APP-LVS-2026-001",
    name: "Sunita Sahu",
    photo: "/success_story.jpg",
    gender: "Female",
    age: 24,
    dob: "2002-05-14",
    mobile: "+91 98610 12345",
    email: "sunita.sahu@gmail.com",
    address: "At/PO Saheed Nagar, Ward 12",
    district: "Bhubaneswar",
    state: "Odisha",
    pincode: "751007",
    qualification: "12th Pass",
    institution: "Bhubaneswar Girls High School",
    passingYear: "2021",
    course: "Tailoring & Stitching",
    preferredCenter: "Bhubaneswar LVS Skill Center",
    preferredBatch: "BATCH-2026-T1 (Morning)",
    applicationDate: "2026-08-28",
    status: "Selected",
    location: "Bhubaneswar, Odisha",
    timelineStep: 4,
    documents: {
      idProof: "Aadhaar Card (Verified)",
      educationCertificate: "12th Marksheet",
      photo: "Passport Photo",
      other: "Income Certificate"
    }
  },
  {
    id: "APP-LVS-2026-002",
    name: "Priya Ranjita Das",
    photo: "/beautician_training.jpg",
    gender: "Female",
    age: 23,
    dob: "2003-08-20",
    mobile: "+91 97780 54321",
    email: "priya.ranjita@yahoo.com",
    address: "Plot 402, CDA Sector 9",
    district: "Cuttack",
    state: "Odisha",
    pincode: "753014",
    qualification: "BA Graduate",
    institution: "Shailabala Women's College Cuttack",
    passingYear: "2023",
    course: "Beautician & Wellness",
    preferredCenter: "Cuttack Main Skill Hub",
    preferredBatch: "BATCH-2026-B1 (Afternoon)",
    applicationDate: "2026-08-26",
    status: "Selected",
    location: "Cuttack, Odisha",
    timelineStep: 5,
    documents: {
      idProof: "Aadhaar Card (Verified)",
      educationCertificate: "BA Degree",
      photo: "Passport Photo",
      other: "Character Cert"
    }
  },
  {
    id: "APP-LVS-2026-003",
    name: "Minati Nayak",
    photo: "/tailoring_training.jpg",
    gender: "Female",
    age: 27,
    dob: "1999-01-10",
    mobile: "+91 94370 88990",
    email: "minati.nayak@gmail.com",
    address: "Village Nimapada, Block 3",
    district: "Puri",
    state: "Odisha",
    pincode: "752106",
    qualification: "10th Pass",
    institution: "Nimapada High School",
    passingYear: "2016",
    course: "Tailoring & Stitching",
    preferredCenter: "Puri Rural Skill Hub",
    preferredBatch: "BATCH-2026-T2 (Morning)",
    applicationDate: "2026-08-25",
    status: "Shortlisted",
    location: "Puri District, Odisha",
    timelineStep: 3,
    documents: {
      idProof: "Voter ID Card",
      educationCertificate: "10th Marksheet",
      photo: "Passport Photo",
      other: "BPL Ration Card"
    }
  },
  {
    id: "APP-LVS-2026-004",
    name: "Rasmita Behera",
    photo: "/hero_training.png",
    gender: "Female",
    age: 26,
    dob: "2000-11-05",
    mobile: "+91 91240 66778",
    email: "rasmita.behera@gmail.com",
    address: "Jatni Block, Main Road",
    district: "Khordha",
    state: "Odisha",
    pincode: "752050",
    qualification: "12th Pass",
    institution: "Jatni College",
    passingYear: "2019",
    course: "Tailoring & Stitching",
    preferredCenter: "Khordha Vocational Hub",
    preferredBatch: "BATCH-2026-T3 (Evening)",
    applicationDate: "2026-08-24",
    status: "Under Review",
    location: "Khordha, Odisha",
    timelineStep: 2,
    documents: {
      idProof: "Aadhaar Card",
      educationCertificate: "12th Certificate",
      photo: "Passport Photo",
      other: "Residence Proof"
    }
  },
  {
    id: "APP-LVS-2026-005",
    name: "Kalyani Swain",
    photo: "/health_checkup.jpg",
    gender: "Female",
    age: 30,
    dob: "1996-03-22",
    mobile: "+91 99370 11223",
    email: "kalyani.swain@outlook.com",
    address: "Berhampur Rural Cluster",
    district: "Ganjam",
    state: "Odisha",
    pincode: "760001",
    qualification: "Graduate (B.Sc)",
    institution: "Berhampur University",
    passingYear: "2018",
    course: "Healthcare & Caregiving",
    preferredCenter: "Ganjam Community Care Hub",
    preferredBatch: "BATCH-2026-H1 (Full Day)",
    applicationDate: "2026-08-22",
    status: "New",
    location: "Ganjam District, Odisha",
    timelineStep: 1,
    documents: {
      idProof: "Aadhaar Card",
      educationCertificate: "B.Sc Degree",
      photo: "Passport Photo",
      other: "SHG Leader Letter"
    }
  }
];

export const initialPrograms = [
  {
    id: "tailoring",
    name: "Tailoring & Stitching",
    slug: "tailoring-training",
    category: "Sewing Lab",
    sector: "Apparel, Made-ups & Home Furnishing",
    qpCode: "AMH/Q1947",
    nsqfLevel: "Level 4",
    duration: "300 Hours (3 Months)",
    theoryHours: "80 Hours",
    practicalHours: "160 Hours",
    ojtHours: "60 Hours",
    qualification: "8th Pass / 10th Pass",
    batchSize: "30 Students",
    activeBatches: 14,
    students: 420,
    status: "Active",
    image: "/image/Tailoring_training.png",
    description: "Learn practical tailoring, pattern drafting, boutique finishing, and sewing machine maintenance for self-employment."
  },
  {
    id: "beautician",
    name: "Beautician & Wellness",
    slug: "beautician-training",
    category: "Makeup Academy",
    sector: "Beauty & Wellness",
    qpCode: "BWS/Q0101",
    nsqfLevel: "Level 3",
    duration: "280 Hours (3 Months)",
    theoryHours: "70 Hours",
    practicalHours: "150 Hours",
    ojtHours: "60 Hours",
    qualification: "10th Pass",
    batchSize: "25 Students",
    activeBatches: 10,
    students: 310,
    status: "Active",
    image: "/image/Beautician.png",
    description: "Develop practical beauty, skincare, bridal makeup brush techniques, and wellness skills for salon employment."
  },
  {
    id: "agriculture",
    name: "Agriculture & Farming",
    slug: "agriculture-training",
    category: "Agri Livelihood",
    sector: "Agriculture",
    qpCode: "AGR/Q4801",
    nsqfLevel: "Level 4",
    duration: "200 Hours (2 Months)",
    theoryHours: "50 Hours",
    practicalHours: "110 Hours",
    ojtHours: "40 Hours",
    qualification: "8th Pass",
    batchSize: "30 Students",
    activeBatches: 8,
    students: 240,
    status: "Active",
    image: "/image/Agriculture.png",
    description: "Gain practical skills in organic farming, mushroom cultivation, vermicomposting, and sustainable agri-techniques."
  },
  {
    id: "healthcare",
    name: "Healthcare & Caregiving",
    slug: "healthcare-programs",
    category: "Health Camps",
    sector: "Healthcare",
    qpCode: "HCS/Q5101",
    nsqfLevel: "Level 4",
    duration: "400 Hours (4 Months)",
    theoryHours: "100 Hours",
    practicalHours: "200 Hours",
    ojtHours: "100 Hours",
    qualification: "10th Pass / 12th Pass",
    batchSize: "25 Students",
    activeBatches: 12,
    students: 360,
    status: "Active",
    image: "/image/Healthcare&caregiving.png",
    description: "Acquire essential health literacy, first-aid assistance, home patient caregiving, and community camp coordination."
  },
  {
    id: "tourism",
    name: "Tourism & Hospitality",
    slug: "tourism-hospitality",
    category: "Hospitality Hub",
    sector: "Tourism & Hospitality",
    qpCode: "THC/Q0301",
    nsqfLevel: "Level 4",
    duration: "320 Hours (3 Months)",
    theoryHours: "90 Hours",
    practicalHours: "170 Hours",
    ojtHours: "60 Hours",
    qualification: "12th Pass",
    batchSize: "30 Students",
    activeBatches: 6,
    students: 180,
    status: "Active",
    image: "/image/Tourism & hospitality.png",
    description: "Master front office management, guest relations, housekeeping standards, and travel tourism operations."
  },
  {
    id: "food",
    name: "Food & Beverages",
    slug: "food-beverages",
    category: "Culinary Arts",
    sector: "Food Processing",
    qpCode: "FIC/Q0101",
    nsqfLevel: "Level 3",
    duration: "300 Hours (3 Months)",
    theoryHours: "80 Hours",
    practicalHours: "160 Hours",
    ojtHours: "60 Hours",
    qualification: "10th Pass",
    batchSize: "25 Students",
    activeBatches: 5,
    students: 150,
    status: "Active",
    image: "/image/Food & Beverages.png",
    description: "Develop commercial culinary skills, food safety protocols, catering management, bakery fundamentals, and beverage services."
  }
];

export const initialCenters = [
  {
    id: "CTR-OD-01",
    name: "Cuttack Main Skill Hub",
    location: "Cuttack, Odisha",
    courses: ["Tailoring & Stitching", "Beautician & Wellness", "Healthcare"],
    capacity: 500,
    activeStudents: 410,
    status: "Active",
    contactPerson: "Dr. Sunita Sharma (+91 98610 00001)"
  },
  {
    id: "CTR-OD-02",
    name: "Bhubaneswar LVS Skill Center",
    location: "Bhubaneswar, Odisha",
    courses: ["Tailoring", "Tourism & Hospitality", "Food & Beverages"],
    capacity: 400,
    activeStudents: 340,
    status: "Active",
    contactPerson: "Priya Ranjita Das (+91 97780 00002)"
  },
  {
    id: "CTR-OD-03",
    name: "Puri Rural Skill Hub",
    location: "Puri District, Odisha",
    courses: ["Agriculture & Farming", "Tailoring"],
    capacity: 300,
    activeStudents: 260,
    status: "Active",
    contactPerson: "Minati Nayak (+91 94370 00003)"
  },
  {
    id: "CTR-OD-04",
    name: "Khordha Vocational Hub",
    location: "Khordha, Odisha",
    courses: ["Tailoring & Stitching", "Beautician"],
    capacity: 250,
    activeStudents: 210,
    status: "Active",
    contactPerson: "Rasmita Behera (+91 91240 00004)"
  },
  {
    id: "CTR-OD-05",
    name: "Ganjam Community Care Hub",
    location: "Ganjam District, Odisha",
    courses: ["Healthcare & Caregiving", "Agriculture"],
    capacity: 300,
    activeStudents: 250,
    status: "Active",
    contactPerson: "Kalyani Swain (+91 99370 00005)"
  }
];

export const initialBatches = [
  {
    id: "BATCH-2026-T1",
    course: "Tailoring & Stitching",
    center: "Bhubaneswar LVS Skill Center",
    trainer: "Sunita Sahu",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    students: 35,
    capacity: 35,
    status: "Completed"
  },
  {
    id: "BATCH-2026-B1",
    course: "Beautician & Wellness",
    center: "Cuttack Main Skill Hub",
    trainer: "Priya Ranjita Das",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    students: 30,
    capacity: 30,
    status: "Active"
  },
  {
    id: "BATCH-2026-A1",
    course: "Agriculture & Farming",
    center: "Puri Rural Skill Hub",
    trainer: "Dr. Ramesh Chandra",
    startDate: "2026-08-01",
    endDate: "2026-10-01",
    students: 28,
    capacity: 30,
    status: "Active"
  },
  {
    id: "BATCH-2026-H1",
    course: "Healthcare & Caregiving",
    center: "Ganjam Community Care Hub",
    trainer: "Kalyani Swain",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    students: 25,
    capacity: 30,
    status: "Upcoming"
  }
];

export const initialStudents = [
  {
    id: "LVS-OD-101",
    photo: "/success_story.jpg",
    name: "Sunita Sahu",
    course: "Tailoring & Stitching",
    batch: "BATCH-2026-T1",
    center: "Bhubaneswar LVS Skill Center",
    attendance: "96%",
    status: "Active",
    phone: "+91 98610 12345",
    assessmentScore: "94/100 (Pass)",
    certificateStatus: "Issued",
    placementStatus: "Self-Employed (Fashion Boutique)"
  },
  {
    id: "LVS-OD-102",
    photo: "/beautician_training.jpg",
    name: "Priya Ranjita Das",
    course: "Beautician & Wellness",
    batch: "BATCH-2026-B1",
    center: "Cuttack Main Skill Hub",
    attendance: "98%",
    status: "Active",
    phone: "+91 97780 54321",
    assessmentScore: "96/100 (Pass)",
    certificateStatus: "Issued",
    placementStatus: "Employed (Senior Salon Stylist)"
  },
  {
    id: "LVS-OD-103",
    photo: "/tailoring_training.jpg",
    name: "Minati Nayak",
    course: "Tailoring & Stitching",
    batch: "BATCH-2026-T2",
    center: "Puri Rural Skill Hub",
    attendance: "92%",
    status: "Active",
    phone: "+91 94370 88990",
    assessmentScore: "88/100 (Pass)",
    certificateStatus: "Eligible",
    placementStatus: "Self-Employed (Apparel Business)"
  },
  {
    id: "LVS-OD-104",
    photo: "/hero_training.png",
    name: "Rasmita Behera",
    course: "Tailoring & Stitching",
    batch: "BATCH-2026-T3",
    center: "Khordha Vocational Hub",
    attendance: "90%",
    status: "Active",
    phone: "+91 91240 66778",
    assessmentScore: "85/100 (Pass)",
    certificateStatus: "Eligible",
    placementStatus: "Self-Employed (Stitching Center)"
  },
  {
    id: "LVS-OD-105",
    photo: "/health_checkup.jpg",
    name: "Kalyani Swain",
    course: "Healthcare & Caregiving",
    batch: "BATCH-2026-H1",
    center: "Ganjam Community Care Hub",
    attendance: "95%",
    status: "Enrolled",
    phone: "+91 99370 11223",
    assessmentScore: "Pending",
    certificateStatus: "In Progress",
    placementStatus: "Community Health Leader"
  }
];

export const initialCertificates = [
  {
    certNo: "LVS-CERT-2026-OD-881",
    student: "Priya Ranjita Das",
    studentId: "LVS-OD-102",
    course: "Beautician & Wellness Specialist",
    batch: "BATCH-2026-B1",
    issueDate: "2026-08-15",
    grade: "Grade A+ (96%)",
    status: "Issued",
    verifyCode: "VER-OD-881"
  },
  {
    certNo: "LVS-CERT-2026-OD-882",
    student: "Sunita Sahu",
    studentId: "LVS-OD-101",
    course: "Tailoring & Boutique Management",
    batch: "BATCH-2026-T1",
    issueDate: "2026-08-01",
    grade: "Grade A+ (94%)",
    status: "Issued",
    verifyCode: "VER-OD-882"
  },
  {
    certNo: "LVS-CERT-2026-OD-883",
    student: "Minati Nayak",
    studentId: "LVS-OD-103",
    course: "Garment Construction & Stitching",
    batch: "BATCH-2026-T2",
    issueDate: "2026-08-20",
    grade: "Grade A (88%)",
    status: "Generated",
    verifyCode: "VER-OD-883"
  }
];

export const initialPlacements = [
  {
    id: "PLC-OD-01",
    student: "Priya Ranjita Das",
    course: "Beautician & Wellness",
    trainingCompleted: "Yes (Cert #881)",
    placementStatus: "Employed",
    employer: "Cuttack Premium Beauty Salon",
    jobRole: "Senior Salon Stylist",
    location: "Cuttack, Odisha",
    joiningDate: "2026-08-10",
    salary: "₹18,500 / month"
  },
  {
    id: "PLC-OD-02",
    student: "Sunita Sahu",
    course: "Tailoring & Stitching",
    trainingCompleted: "Yes (Cert #882)",
    placementStatus: "Self-Employed",
    employer: "Sunita Fashion Boutique (Self)",
    jobRole: "Boutique Owner & Entrepreneur",
    location: "Bhubaneswar, Odisha",
    joiningDate: "2026-08-05",
    salary: "₹25,000 / month (Profit)"
  },
  {
    id: "PLC-OD-03",
    student: "Minati Nayak",
    course: "Tailoring & Stitching",
    trainingCompleted: "Yes (Cert #883)",
    placementStatus: "Self-Employed",
    employer: "Rural Apparel Stitching Unit",
    jobRole: "Apparel Micro-Entrepreneur",
    location: "Puri District, Odisha",
    joiningDate: "2026-08-15",
    salary: "₹16,000 / month"
  },
  {
    id: "PLC-OD-04",
    student: "Rasmita Behera",
    course: "Tailoring & Stitching",
    trainingCompleted: "Yes",
    placementStatus: "Self-Employed",
    employer: "Khordha Sewing Center",
    jobRole: "Stitching Center Owner",
    location: "Khordha, Odisha",
    joiningDate: "2026-08-20",
    salary: "₹17,500 / month"
  }
];

export const initialPartners = [
  {
    id: "PRT-OD-01",
    orgName: "Privir Healthcare Pvt. Ltd.",
    contactPerson: "Dr. Alok Verma",
    email: "contact@privirhealthcare.com",
    partnerType: "Healthcare Partner",
    logo: "/company/Privir Healthcare.jpg",
    location: "Odisha / Pan-India",
    dateJoined: "2024-01-15",
    status: "Active",
    grantAmount: "Placement & Training Partner"
  },
  {
    id: "PRT-OD-02",
    orgName: "Beautician Wellness SSC (B&WSSC)",
    contactPerson: "Smt. Sunita Rao",
    email: "info@bwssc.in",
    partnerType: "Sector Skill Council",
    logo: "/company/Beautician SSC.png",
    location: "New Delhi / Odisha",
    dateJoined: "2023-11-10",
    status: "Active",
    programsSupported: 1
  },
  {
    id: "PRT-OD-03",
    orgName: "Handicrafts & Carpet SSC (HCSSC)",
    contactPerson: "Mr. Rajesh Sharma",
    email: "info@hcssc.in",
    partnerType: "Sector Skill Council",
    logo: "/company/Handicrafts & Carpet SSC.jpg",
    location: "New Delhi / Odisha",
    dateJoined: "2024-02-01",
    status: "Active",
    programsSupported: 2
  },
  {
    id: "PRT-OD-04",
    orgName: "Healthcare SSC (HSSC)",
    contactPerson: "Dr. K.V. Subbarao",
    email: "contact@hssc.in",
    partnerType: "Sector Skill Council",
    logo: "/company/Healthcare SSC.jpg",
    location: "New Delhi / Odisha",
    dateJoined: "2023-08-15",
    status: "Active",
    programsSupported: 1
  },
  {
    id: "PRT-OD-05",
    orgName: "Apparel SSC (AMHSSC)",
    contactPerson: "Mr. Vikramjit Singh",
    email: "info@sscamh.in",
    partnerType: "Sector Skill Council",
    logo: "/company/Apparel SSC.jpg",
    location: "New Delhi / Odisha",
    dateJoined: "2023-05-10",
    status: "Active",
    programsSupported: 1
  }
];

export const initialVolunteers = [
  {
    id: "VOL-OD-101",
    name: "Dr. Meera Iyer",
    location: "Cuttack, Odisha",
    skills: "Community Health, Preventive Medicine",
    interest: "Healthcare Trainee Guest Lectures & Camps",
    applicationDate: "2026-08-25",
    status: "Assigned"
  },
  {
    id: "VOL-OD-102",
    name: "Rohan Gupta",
    location: "Bhubaneswar, Odisha",
    skills: "Spoken English, Soft Skills, IT",
    interest: "Student Mentorship & Mock Interviews",
    applicationDate: "2026-08-20",
    status: "Approved"
  }
];

export const initialDonations = [];

export const initialStories = [
  {
    id: "STOR-01",
    name: "Sunita Sahu",
    program: "Tailoring & Garment Making",
    location: "Bhubaneswar, Odisha",
    photo: "/success story/trailoring.jpg",
    quote: "The free practical tailoring course taught me garment construction, pattern drafting, and sewing machine operation.",
    story: "Equipped with certification and business basics from LVS, Sunita opened her own fashion boutique in Saheed Nagar, Bhubaneswar.",
    outcome: "Fashion Boutique Entrepreneur earning ₹25,000/month",
    status: "Published"
  },
  {
    id: "STOR-02",
    name: "Priya Ranjita Das",
    program: "Beautician & Personal Care",
    location: "Cuttack, Odisha",
    photo: "/success story/beauty.jpg",
    quote: "Joining Life Vision Society's beautician program gave me professional makeup skills, hands-on salon practice, and direct job placement support.",
    story: "Priya completed 3 months of hands-on salon training at Cuttack hub. Today she works as a senior salon stylist earning a dignified monthly income.",
    outcome: "Senior Salon Stylist in Cuttack earning ₹18,500/month",
    status: "Published"
  },
  {
    id: "STOR-03",
    name: "Deepak Kumar Mohanta",
    program: "Food & Beverage Service Assistant",
    location: "Bhubaneswar, Odisha",
    photo: "/success story/success story 1.jpg",
    quote: "The practical F&B service training, table setup modules, and hospitality communication classes secured my placement.",
    story: "Deepak completed the certified F&B course and was placed at a leading hotel in Bhubaneswar as a Food & Beverage Service Assistant.",
    outcome: "F&B Service Executive at Hotel earning ₹17,000/month",
    status: "Published"
  },
  {
    id: "STOR-04",
    name: "Rasmita Behera",
    program: "Tailoring & Garment Making",
    location: "Khordha, Odisha",
    photo: "/success story/success story.jpg",
    quote: "Learning sewing machine maintenance alongside garment design was a complete game changer for me.",
    story: "Life Vision Society turned Rasmita into a self-reliant stitching center owner taking regular bulk orders.",
    outcome: "Stitching Center Owner in Khordha",
    status: "Published"
  },
  {
    id: "STOR-05",
    name: "Manasi Nayak",
    program: "Housekeeping & Facility Operations",
    location: "Puri, Odisha",
    photo: "/success story/house keeping.jpg",
    quote: "Life Vision Society's housekeeping training prepared me with professional cleaning standards, guest hygiene, and operations management.",
    story: "Manasi was hired as a hospitality housekeeping supervisor at a beachfront resort in Puri.",
    outcome: "Hospitality & Housekeeping Supervisor earning ₹19,000/month",
    status: "Published"
  },
  {
    id: "STOR-06",
    name: "Archana Sahoo",
    program: "Beautician & Personal Care",
    location: "Balasore, Odisha",
    photo: "/success story/betician.jpg",
    quote: "The hands-on practical training in skincare, bridal styling, and salon sanitation gave me the exact skills needed to start my own beauty parlor.",
    story: "Archana opened her own beauty salon in Balasore market, providing employment to 2 junior beauticians.",
    outcome: "Independent Salon Owner earning ₹22,000/month",
    status: "Published"
  }
];

export const initialDocuments = [
  {
    id: "DOC-OD-01",
    title: "Annual Impact & Audit Report 2024-25",
    category: "Annual Reports",
    fileSize: "4.8 MB",
    uploadDate: "2026-05-10",
    access: "Public",
    status: "Published"
  },
  {
    id: "DOC-OD-02",
    title: "FCRA & 80G Tax Exemption Certificates",
    category: "Audit Reports",
    fileSize: "1.2 MB",
    uploadDate: "2026-01-15",
    access: "Public",
    status: "Published"
  }
];

export const initialAdminUsers = [
  {
    id: "USR-OD-01",
    name: "Dr. Sunita Sharma",
    email: "admin@lifevisionsociety.org",
    role: "Super Admin",
    status: "Active",
    lastLogin: "Today, 10:15 AM"
  },
  {
    id: "USR-OD-02",
    name: "Priya Ranjita Das",
    email: "priya.training@lifevisionsociety.org",
    role: "Training Manager",
    status: "Active",
    lastLogin: "Yesterday, 04:30 PM"
  }
];
