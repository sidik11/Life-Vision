import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Filter, Eye, Trash2, X, Phone, Mail, 
  MapPin, Calendar, FileText, CheckCircle2, MessageSquare, Clock, User, Award, 
  Printer, Check, RefreshCw, ExternalLink, GraduationCap, Building, Upload, ShieldCheck, AlertCircle
} from 'lucide-react';
import ActionPopover from '../components/Common/ActionPopover';
import { db, doc, updateDoc, deleteDoc } from '../../firebase';

// Predefined Indian States and UTs with their respective Districts
const INDIA_STATES_AND_DISTRICTS = {
  "Odisha": [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)",
    "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
    "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur (Sonepur)", "Sundargarh"
  ],
  "Andhra Pradesh": [
    "Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna",
    "Kurnool", "Nandyal", "NTR", "Palnadu", "Prakasam", "Srikakulam",
    "Sri Potti Sriramulu Nellore", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari"
  ],
  "Arunachal Pradesh": [
    "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Itanagar Capital Complex",
    "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley",
    "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang",
    "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
  ],
  "Assam": [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang",
    "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi",
    "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj",
    "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao",
    "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
    "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas",
    "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan",
    "Supaul", "Vaishali", "West Champaran"
  ],
  "Chhattisgarh": [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur",
    "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa",
    "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund",
    "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur",
    "Raigarh", "Raipur", "Rajnandgaon", "Sarangarh-Bilaigarh", "Sakti", "Sukma", "Surajpur", "Surguja"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Gujarat": [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
    "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath",
    "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada",
    "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat",
    "Surendranagar", "Tapi", "Vadodara", "Valsad"
  ],
  "Haryana": [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar",
    "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal",
    "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti",
    "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
  ],
  "Jharkhand": [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
    "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar",
    "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Saraikela Kharsawan",
    "Simdega", "West Singhbhum"
  ],
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar",
    "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
    "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar",
    "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru",
    "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"
  ],
  "Kerala": [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
    "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul",
    "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas",
    "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur",
    "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur",
    "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore",
    "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh",
    "Ujjain", "Umaria", "Vidisha"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhaji Nagar (Aurangabad)", "Beed",
    "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
    "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur",
    "Nanded", "Nandurbar", "Nashik", "Dharashiv (Osmanabad)", "Palghar", "Parbhani", "Pune",
    "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam",
    "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong",
    "Tengnoupal", "Thoubal", "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills",
    "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills",
    "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei",
    "Mamit", "Saiha", "Saitual", "Serchhip"
  ],
  "Nagaland": [
    "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon",
    "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"
  ],
  "Punjab": [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur",
    "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa",
    "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)",
    "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner",
    "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh",
    "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli",
    "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar",
    "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
  ],
  "Sikkim": [
    "Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"
  ],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
    "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram",
    "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
    "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai",
    "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", "Jangaon",
    "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam",
    "Kumuram Bheem", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri",
    "Mulugu", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla",
    "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya",
    "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki",
    "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli",
    "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad",
    "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur",
    "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat",
    "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow",
    "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur",
    "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli",
    "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli",
    "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
  ],
  "Uttarakhand": [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital",
    "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling",
    "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda",
    "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
    "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
  ],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Dadra and Nagar Haveli"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

export default function PlacementView({ 
  placements = [], 
  setPlacements, 
  adminUser = {}, 
  showToast, 
  onShowToast 
}) {
  const notify = showToast || onShowToast || (() => {});

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supportTypeFilter, setSupportTypeFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All State');
  const [districtFilter, setDistrictFilter] = useState('All District');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Detail States
  const [viewingItem, setViewingItem] = useState(null);
  const [printingItem, setPrintingItem] = useState(null);

  // Admin Remark State inside Viewing Modal
  const [newRemarkText, setNewRemarkText] = useState('');

  // Document Viewer Modal State
  const [activeDocPreview, setActiveDocPreview] = useState(null); // { title, url, isImage }

  // Exact 9 Statuses as requested in Requirements 8 & 10
  const STATUS_OPTIONS = [
    'New Application',
    'Under Verification',
    'Verified',
    'Eligible for Support',
    'Support in Process',
    'Support Provided',
    'Not Eligible',
    'Rejected',
    'Closed'
  ];

  // Derive Dynamic Filter Lists from Firebase Data & Predefined Indian Dictionary
  const uniqueSupportTypes = Array.from(
    new Set(placements.map(p => p.supportType || p.preferredJobRole || p.jobRole).filter(Boolean))
  );

  const predefinedStates = Object.keys(INDIA_STATES_AND_DISTRICTS);
  const dataStates = placements.map(p => p.state).filter(Boolean);
  const allStateOptions = Array.from(new Set([...predefinedStates, ...dataStates])).sort();

  // Dynamic Districts based on selected State
  let availableDistricts = [];
  if (stateFilter === 'All State' || !stateFilter) {
    const allDictDistricts = Object.values(INDIA_STATES_AND_DISTRICTS).flat();
    const dataDistricts = placements.map(p => p.district).filter(Boolean);
    availableDistricts = Array.from(new Set([...allDictDistricts, ...dataDistricts])).sort();
  } else {
    const dictDistrictsForState = INDIA_STATES_AND_DISTRICTS[stateFilter] || [];
    const dataDistrictsForState = placements.filter(p => p.state === stateFilter).map(p => p.district).filter(Boolean);
    availableDistricts = Array.from(new Set([...dictDistrictsForState, ...dataDistrictsForState])).sort();
  }

  // Helper to normalize status for counting & filtering
  const getNormalizedStatus = (item) => {
    const raw = item.status || item.placementStatus || 'New Application';
    if (raw === 'Applied' || raw === 'Pending' || raw === 'New') return 'New Application';
    return raw;
  };

  // Dynamic Summary Cards Stats Calculation
  const getStatusCount = (statusName) => {
    return placements.filter(p => getNormalizedStatus(p) === statusName).length;
  };

  const summaryCards = [
    { label: 'Total Applications', count: placements.length, bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800', filterVal: 'All' },
    { label: 'New Application', count: getStatusCount('New Application'), bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', filterVal: 'New Application' },
    { label: 'Under Verification', count: getStatusCount('Under Verification'), bg: 'bg-[#FFF7F6]', text: 'text-[#6B1D52]', border: 'border-pink-200', filterVal: 'Under Verification' },
    { label: 'Verified', count: getStatusCount('Verified'), bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', filterVal: 'Verified' },
    { label: 'Eligible for Support', count: getStatusCount('Eligible for Support'), bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', filterVal: 'Eligible for Support' },
    { label: 'Support in Process', count: getStatusCount('Support in Process'), bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', filterVal: 'Support in Process' },
    { label: 'Support Provided', count: getStatusCount('Support Provided'), bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300', filterVal: 'Support Provided' },
    { label: 'Not Eligible', count: getStatusCount('Not Eligible'), bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', filterVal: 'Not Eligible' },
    { label: 'Rejected', count: getStatusCount('Rejected'), bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', filterVal: 'Rejected' },
    { label: 'Closed', count: getStatusCount('Closed'), bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', filterVal: 'Closed' }
  ];

  // Filter Applications
  const filteredApplications = placements.filter(p => {
    const term = searchQuery.toLowerCase().trim();
    
    const nameMatch = (p.studentName || p.student || p.fullName || p.name || '').toLowerCase().includes(term);
    const appIdMatch = (p.id || p.applicationId || p.firestoreId || '').toLowerCase().includes(term);
    const phoneMatch = (p.phone || p.mobile || '').toLowerCase().includes(term);
    const emailMatch = (p.email || '').toLowerCase().includes(term);

    const matchesSearch = !term || nameMatch || appIdMatch || phoneMatch || emailMatch;

    const normStatus = getNormalizedStatus(p);
    const matchesStatus = statusFilter === 'All' || normStatus === statusFilter;
    
    const supportTypeVal = p.supportType || p.preferredJobRole || p.jobRole || '';
    const matchesSupportType = supportTypeFilter === 'All' || supportTypeVal === supportTypeFilter;

    const matchesState = stateFilter === 'All State' || (p.state || '') === stateFilter;
    const matchesDistrict = districtFilter === 'All District' || (p.district || '') === districtFilter;
    const matchesDate = !dateFilter || (p.appliedDate || p.applicationDate || p.appliedAt || '').includes(dateFilter);

    return matchesSearch && matchesStatus && matchesSupportType && matchesState && matchesDistrict && matchesDate;
  });

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSupportTypeFilter('All');
    setStateFilter('All State');
    setDistrictFilter('All District');
    setDateFilter('');
    notify('Reset all application filters', 'info');
  };

  // Update Status in Firebase Firestore
  const handleStatusChange = async (item, newStatus) => {
    const docId = item.firestoreId || item.id;
    const updated = {
      ...item,
      status: newStatus,
      placementStatus: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (setPlacements) {
      setPlacements(prev => prev.map(p => (p.id === item.id || (p.firestoreId && p.firestoreId === item.firestoreId)) ? updated : p));
    }

    if (docId) {
      try {
        await updateDoc(doc(db, "placements", docId), {
          status: newStatus,
          placementStatus: newStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore update status error:", err);
      }
    }

    if (viewingItem && (viewingItem.id === item.id || viewingItem.firestoreId === item.firestoreId)) {
      setViewingItem(updated);
    }

    notify(`Updated application status to "${newStatus}"!`, 'success');
  };

  // Add Internal Admin Remark Note
  const handleSaveRemark = async (e) => {
    e.preventDefault();
    if (!newRemarkText.trim() || !viewingItem) return;

    const currentRemarks = Array.isArray(viewingItem.remarks) ? viewingItem.remarks : [];
    const displayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newRemarkObj = {
      remark: newRemarkText.trim(),
      text: newRemarkText.trim(),
      date: displayDateStr,
      addedBy: adminUser?.name || 'NGO Admin Verification Desk'
    };

    const updatedRemarks = [newRemarkObj, ...currentRemarks];
    const updated = {
      ...viewingItem,
      remarks: updatedRemarks,
      updatedAt: new Date().toISOString()
    };

    if (setPlacements) {
      setPlacements(prev => prev.map(p => (p.id === viewingItem.id || (p.firestoreId && p.firestoreId === viewingItem.firestoreId)) ? updated : p));
    }

    const docId = viewingItem.firestoreId || viewingItem.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "placements", docId), {
          remarks: updatedRemarks,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore save remark error:", err);
      }
    }

    setViewingItem(updated);
    setNewRemarkText('');
    notify('✓ Internal verification remark saved!', 'success');
  };

  // Delete Application
  const handleDeleteApplication = async (appId, studentName, docId) => {
    if (window.confirm(`Are you sure you want to delete application for "${studentName}"?`)) {
      const targetDocId = docId || appId;
      if (targetDocId) {
        try {
          await deleteDoc(doc(db, "placements", targetDocId));
        } catch (e) {
          console.warn("Firestore delete placement notice:", e);
        }
      }
      if (setPlacements) {
        setPlacements(prev => prev.filter(p => p.id !== appId && (!docId || p.firestoreId !== docId)));
      }
      if (viewingItem && (viewingItem.id === appId || viewingItem.firestoreId === docId)) {
        setViewingItem(null);
      }
      notify(`Deleted application for ${studentName}.`, 'info');
    }
  };

  // Print Application Handler
  const handlePrint = (item) => {
    setPrintingItem(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Status Badge Styling Helper
  const getStatusBadgeClass = (st) => {
    const norm = (st === 'Applied' || st === 'Pending' || st === 'New') ? 'New Application' : st;
    switch (norm) {
      case 'New Application': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Under Verification': return 'bg-pink-100 text-[#6B1D52] border-pink-300';
      case 'Verified': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Eligible for Support': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Support in Process': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Support Provided': return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Not Eligible': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Closed': return 'bg-slate-200 text-slate-800 border-slate-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Support Applications</span>
            <span className="text-xs bg-pink-100 text-[#6B1D52] font-bold px-3 py-1 rounded-full border border-pink-200 font-sans">
              {placements.length} Total Registered
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage student scholarship, tuition fee sponsorship & higher education placement support applications received from main website.
          </p>
        </div>
      </div>

      {/* 2. Top Summary Cards Row (10 Cards from Requirement 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 print:hidden">
        {summaryCards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => setStatusFilter(card.filterVal)}
            className={`p-3 rounded-2xl border shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-1 ${card.bg} ${card.border} ${
              statusFilter === card.filterVal ? 'ring-2 ring-offset-1 ring-pink-500 font-bold' : ''
            }`}
          >
            <span className={`text-[10px] font-bold truncate ${card.text}`}>{card.label}</span>
            <div className={`text-lg font-black ${card.text}`}>{card.count}</div>
          </div>
        ))}
      </div>

      {/* 3. Filter Controls Area */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Name, App ID, Phone, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          {/* Support Type Filter */}
          <div>
            <select
              value={supportTypeFilter}
              onChange={(e) => setSupportTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All Support Types</option>
              {uniqueSupportTypes.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setDistrictFilter('All District');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All State">All State</option>
              {allStateOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All District">All District</option>
              {availableDistricts.map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Date Filter & Reset Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Filter by Application Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-rose-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-bold">Showing {filteredApplications.length} of {placements.length} applications</span>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-800">No support applications found.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No student applications matched your selected filters or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Support Type</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredApplications.map((app) => {
                  const displayStatus = getNormalizedStatus(app);
                  const studentName = app.studentName || app.student || app.fullName || app.name || 'Student';
                  const appId = app.id || app.applicationId || app.firestoreId || 'LVS-SA-0000';
                  const phoneNum = app.phone || app.mobile || 'N/A';
                  const supportType = app.supportType || app.preferredJobRole || app.jobRole || 'Scholarship & Placement Support';
                  const course = app.higherCourse || app.course || 'Higher Education';
                  const college = app.collegeName || app.institutionName || app.trainingCentre || 'N/A';
                  const appDate = app.appliedDate || app.applicationDate || app.appliedAt || app.joiningDate || 'N/A';

                  return (
                    <tr key={app.id || app.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{appId}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{studentName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{phoneNum}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs truncate">{supportType}</td>
                      <td className="py-3.5 px-4 text-slate-700">{course}</td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{college}</td>
                      <td className="py-3.5 px-4 text-slate-700">{app.state || 'Odisha'}</td>
                      <td className="py-3.5 px-4 text-slate-700">{app.district || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={displayStatus}
                          onChange={(e) => handleStatusChange(app, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border cursor-pointer outline-none ${getStatusBadgeClass(displayStatus)}`}
                        >
                          {STATUS_OPTIONS.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{appDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setViewingItem(app)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* 3-dot Action Popover */}
                          <ActionPopover
                            items={[
                              { label: 'View Full Application', icon: Eye, onClick: () => setViewingItem(app) },
                              { label: 'Print Application', icon: Printer, onClick: () => handlePrint(app) },
                              { divider: true },
                              { label: 'Delete Application', icon: Trash2, danger: true, onClick: () => handleDeleteApplication(app.id, studentName, app.firestoreId) }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. APPLICATION DETAILS MODAL (REQUIREMENT 7, 8, 9, 11) */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs font-sans print:hidden">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-left relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold font-mono bg-slate-100 text-slate-800 border border-slate-200">
                    ID: {viewingItem.id || viewingItem.applicationId || viewingItem.firestoreId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${getStatusBadgeClass(getNormalizedStatus(viewingItem))}`}>
                    {getNormalizedStatus(viewingItem)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                  {viewingItem.studentName || viewingItem.student || viewingItem.fullName || viewingItem.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Applied on {viewingItem.appliedDate || viewingItem.applicationDate || viewingItem.appliedAt || 'N/A'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Print Button */}
                <button
                  onClick={() => handlePrint(viewingItem)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Quick Contact & Status Update Bar */}
            <div className="p-4 bg-gradient-to-r from-pink-50/70 via-white to-pink-50/70 rounded-2xl border border-pink-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Call & Email Actions */}
              <div className="flex items-center space-x-2">
                {(viewingItem.phone || viewingItem.mobile) && (
                  <a
                    href={`tel:${viewingItem.phone || viewingItem.mobile}`}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ({viewingItem.phone || viewingItem.mobile})</span>
                  </a>
                )}
                {viewingItem.email && (
                  <a
                    href={`mailto:${viewingItem.email}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email ({viewingItem.email})</span>
                  </a>
                )}
              </div>

              {/* Status Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Update Status:</span>
                <select
                  value={getNormalizedStatus(viewingItem)}
                  onChange={(e) => handleStatusChange(viewingItem, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer outline-none ${getStatusBadgeClass(getNormalizedStatus(viewingItem))}`}
                >
                  {STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 1: Support Assistance Requested */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#6B1D52] uppercase tracking-wider font-serif flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#C52B75]" />
                <span>Selected Support Type</span>
              </h3>
              <div className="p-3.5 bg-pink-50/60 border border-pink-200 rounded-2xl text-xs font-bold text-[#6B1D52]">
                {viewingItem.supportType || viewingItem.preferredJobRole || viewingItem.jobRole || 'NGO Tuition Fee Sponsorship + Job Placement Support'}
              </div>
            </div>

            {/* Grid of Sections: Personal, Address, Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* 1. Personal Information */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Personal Information</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Full Name:</span>
                    <span className="font-bold text-slate-900">{viewingItem.studentName || viewingItem.student || viewingItem.fullName || viewingItem.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Date of Birth:</span>
                    <span className="font-bold text-slate-900">{viewingItem.dob || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Gender:</span>
                    <span className="font-bold text-slate-900">{viewingItem.gender || 'Female'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Father / Guardian Name:</span>
                    <span className="font-bold text-slate-900">{viewingItem.guardianName || viewingItem.fatherName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Mobile Number:</span>
                    <span className="font-bold text-slate-900 font-mono">{viewingItem.phone || viewingItem.mobile || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500 font-medium">Email Address:</span>
                    <span className="font-bold text-blue-600">{viewingItem.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Address Details */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Address Details</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">State:</span>
                    <span className="font-bold text-slate-900">{viewingItem.state || 'Odisha'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">District:</span>
                    <span className="font-bold text-slate-900">{viewingItem.district || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Block / Municipality:</span>
                    <span className="font-bold text-slate-900">{viewingItem.block || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Village / Town / City:</span>
                    <span className="font-bold text-slate-900">{viewingItem.villageCity || viewingItem.city || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">PIN Code:</span>
                    <span className="font-bold text-slate-900 font-mono">{viewingItem.pincode || 'N/A'}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 font-medium block mb-0.5">Full Address:</span>
                    <span className="font-bold text-slate-900 leading-relaxed block">{viewingItem.fullAddress || viewingItem.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Higher Education Details */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Higher Education Details</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Enrolled Course:</span>
                    <span className="font-bold text-slate-900">{viewingItem.higherCourse || viewingItem.course || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">College / Institution:</span>
                    <span className="font-bold text-slate-900">{viewingItem.collegeName || viewingItem.institutionName || viewingItem.trainingCentre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Current / Passing Year:</span>
                    <span className="font-bold text-slate-900">{viewingItem.passingYear || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500 font-medium">Board / University:</span>
                    <span className="font-bold text-slate-900">{viewingItem.boardUniversity || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Current Status & Application Source */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span>Status & Application Source</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Current Student Status:</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-200 rounded-md text-[11px]">{viewingItem.employmentStatus || viewingItem.currentStatus || 'Student'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Application Source:</span>
                    <span className="font-bold text-slate-900">{viewingItem.hearAboutUs || viewingItem.applicationSource || 'Website'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500 font-medium">Submission Timestamp:</span>
                    <span className="font-bold text-slate-700 font-mono text-[11px]">{viewingItem.appliedDate || viewingItem.applicationDate || viewingItem.appliedAt || 'N/A'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Section 5: Uploaded Student Documents */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Uploaded Student Documents</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Passport Photo */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 block">Passport Photo</span>
                  {viewingItem.photoDoc ? (
                    <div className="space-y-2">
                      <img 
                        src={viewingItem.photoDoc} 
                        alt="Student Passport Photo" 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 mx-auto"
                      />
                      <button
                        onClick={() => setActiveDocPreview({ title: 'Passport Photo', url: viewingItem.photoDoc, isImage: true })}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Photo</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] block">No Photo Uploaded</span>
                  )}
                </div>

                {/* Aadhaar Card */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 block">Aadhaar Card Document</span>
                  {viewingItem.aadharDoc ? (
                    <div className="space-y-2">
                      {viewingItem.aadharDoc.startsWith('data:image/') ? (
                        <img 
                          src={viewingItem.aadharDoc} 
                          alt="Aadhaar Card" 
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 mx-auto"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto text-[#6B1D52] font-bold text-2xs">
                          Aadhaar
                        </div>
                      )}
                      <button
                        onClick={() => setActiveDocPreview({ title: 'Aadhaar Card Document', url: viewingItem.aadharDoc, isImage: viewingItem.aadharDoc.startsWith('data:image/') })}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Document</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] block">No Aadhaar Document Uploaded</span>
                  )}
                </div>

                {/* Extra Documents */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 block">Additional Documents</span>
                  {viewingItem.extraDocs && viewingItem.extraDocs.length > 0 ? (
                    <div className="space-y-1.5">
                      {viewingItem.extraDocs.map((doc, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveDocPreview({ title: doc.title || `Document ${idx+1}`, url: doc.file, isImage: doc.file?.startsWith('data:image/') })}
                          className="w-full p-1.5 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-800 font-bold text-[10px] rounded-lg flex items-center justify-between truncate"
                        >
                          <span className="truncate">{doc.title || `Doc ${idx+1}`}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] block">No Additional Docs</span>
                  )}
                </div>

              </div>
            </div>

            {/* Section 6: Admin Remark / Verification Notes (REQUIREMENT 9) */}
            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Internal NGO Verification Remarks</span>
              </h3>

              <form onSubmit={handleSaveRemark} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter internal verification remark note..."
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Add Remark
                </button>
              </form>

              {viewingItem.remarks && Array.isArray(viewingItem.remarks) && viewingItem.remarks.length > 0 && (
                <div className="space-y-2 pt-1 max-h-40 overflow-y-auto">
                  {viewingItem.remarks.map((r, rIdx) => (
                    <div key={rIdx} className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>{r.remark || r.text || r}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">{r.date}</span>
                      </div>
                      {r.addedBy && (
                        <span className="text-[10px] text-emerald-700 font-medium block">By: {r.addedBy}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteApplication(viewingItem.id, viewingItem.studentName || viewingItem.student, viewingItem.firestoreId)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-rose-200"
              >
                Delete Application
              </button>

              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans print:hidden">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-serif">{activeDocPreview.title}</h3>
              <button onClick={() => setActiveDocPreview(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center overflow-hidden">
              {activeDocPreview.isImage ? (
                <img src={activeDocPreview.url} alt={activeDocPreview.title} className="max-h-96 mx-auto rounded-xl object-contain shadow-md" />
              ) : (
                <div className="space-y-3 py-6">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">{activeDocPreview.title}</p>
                  <a
                    href={activeDocPreview.url}
                    download={activeDocPreview.title}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    <span>Download Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. PRINT APPLICATION TEMPLATE (REQUIREMENT 13) */}
      {printingItem && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-slate-900 font-sans z-[99999]">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center space-x-3">
                <img src="/image/logo.png" alt="Life Vision Society Logo" className="h-14 w-auto" />
                <div>
                  <h1 className="text-xl font-black font-serif uppercase tracking-tight text-slate-900">Life Vision Society</h1>
                  <p className="text-xs font-bold text-pink-600">Student Welfare & Education Aid Division</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-black uppercase text-slate-800">Support Application Form</h2>
                <p className="text-xs font-mono font-bold text-slate-600">ID: {printingItem.id || printingItem.applicationId}</p>
                <p className="text-[10px] text-slate-500 font-medium">Date: {printingItem.appliedDate || printingItem.applicationDate || 'N/A'}</p>
              </div>
            </div>

            {/* Assistance Type */}
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold">
              Support Assistance Requested: {printingItem.supportType || printingItem.preferredJobRole || 'NGO Tuition Fee Sponsorship + Job Placement Support'}
            </div>

            {/* Personal Details Table */}
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 font-serif">1. Student Personal Information</h3>
              <div className="grid grid-cols-2 gap-2 py-2">
                <div><strong>Full Name:</strong> {printingItem.studentName || printingItem.student || printingItem.fullName}</div>
                <div><strong>Date of Birth:</strong> {printingItem.dob || 'N/A'}</div>
                <div><strong>Gender:</strong> {printingItem.gender || 'Female'}</div>
                <div><strong>Guardian Name:</strong> {printingItem.guardianName || printingItem.fatherName || 'N/A'}</div>
                <div><strong>Mobile Number:</strong> {printingItem.phone || printingItem.mobile}</div>
                <div><strong>Email Address:</strong> {printingItem.email}</div>
              </div>
            </div>

            {/* Address Details Table */}
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 font-serif">2. Permanent Address</h3>
              <div className="grid grid-cols-2 gap-2 py-2">
                <div><strong>State:</strong> {printingItem.state || 'Odisha'}</div>
                <div><strong>District:</strong> {printingItem.district || 'N/A'}</div>
                <div><strong>Block / Municipality:</strong> {printingItem.block || 'N/A'}</div>
                <div><strong>Village / City:</strong> {printingItem.villageCity || printingItem.city || 'N/A'}</div>
                <div><strong>PIN Code:</strong> {printingItem.pincode || 'N/A'}</div>
                <div className="col-span-2"><strong>Full Address:</strong> {printingItem.fullAddress || printingItem.address}</div>
              </div>
            </div>

            {/* Education Details Table */}
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 font-serif">3. Higher Education Course</h3>
              <div className="grid grid-cols-2 gap-2 py-2">
                <div><strong>Enrolled Course:</strong> {printingItem.higherCourse || printingItem.course}</div>
                <div><strong>Institution Name:</strong> {printingItem.collegeName || printingItem.institutionName}</div>
                <div><strong>Passing Year:</strong> {printingItem.passingYear || 'N/A'}</div>
                <div><strong>Board / University:</strong> {printingItem.boardUniversity || 'N/A'}</div>
              </div>
            </div>

            {/* Status & References */}
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 font-serif">4. Verification & Status Summary</h3>
              <div className="grid grid-cols-2 gap-2 py-2">
                <div><strong>Current Status:</strong> {printingItem.employmentStatus || printingItem.currentStatus || 'Student'}</div>
                <div><strong>Application Status:</strong> {getNormalizedStatus(printingItem)}</div>
                <div><strong>Passport Photo:</strong> {printingItem.photoDoc ? 'Uploaded & Verified' : 'Not Provided'}</div>
                <div><strong>Aadhaar Card:</strong> {printingItem.aadharDoc ? 'Uploaded & Verified' : 'Not Provided'}</div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-12 grid grid-cols-2 text-center text-xs font-bold border-t border-slate-300">
              <div>
                <p className="border-t border-slate-400 w-48 mx-auto pt-1">Student Applicant Signature</p>
              </div>
              <div>
                <p className="border-t border-slate-400 w-48 mx-auto pt-1">Authorized NGO Officer Signature</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
