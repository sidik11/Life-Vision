import { db, storage, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp, ref, uploadBytes, getDownloadURL } from '../firebase';

/**
 * Normalizes UTR / Transaction ID for consistent comparison (trims whitespace, uppercase).
 * @param {string} utr 
 * @returns {string}
 */
export function normalizeUtr(utr) {
  if (!utr) return '';
  return String(utr).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Checks if a normalized UTR already exists in Firestore donations with a 2-second timeout guard.
 * @param {string} rawUtr 
 * @returns {Promise<boolean>} - True if duplicate exists
 */
export async function checkDuplicateUtr(rawUtr) {
  const norm = normalizeUtr(rawUtr);
  if (!norm) return false;

  try {
    const checkPromise = (async () => {
      const q = query(collection(db, 'donations'), where('utrNumberNormalized', '==', norm));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    })();

    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 2000));
    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (err) {
    console.warn('[UTR Duplicate Check Warning]:', err);
    return false;
  }
}

/**
 * Client-side HTML5 Canvas Image Compressor.
 * Resizes large screenshots (2MB - 10MB) down to max 1000px and 75% JPEG quality (~60KB - 120KB).
 * 
 * @param {File|Blob|string} imageInput 
 * @returns {Promise<File|string>}
 */
export async function compressImageFile(imageInput) {
  if (!imageInput) return imageInput;

  if (typeof imageInput === 'string' && (imageInput.startsWith('http') || !imageInput.startsWith('data:'))) {
    return imageInput;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const reader = new FileReader();

      const processImage = (src) => {
        img.onload = () => {
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          if (imageInput instanceof File || imageInput instanceof Blob) {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], imageInput.name || 'compressed_proof.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                } else {
                  resolve(imageInput);
                }
              },
              'image/jpeg',
              0.75
            );
          } else {
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          }
        };

        img.onerror = () => resolve(imageInput);
        img.src = src;
      };

      if (imageInput instanceof File || imageInput instanceof Blob) {
        reader.onload = (e) => processImage(e.target.result);
        reader.onerror = () => resolve(imageInput);
        reader.readAsDataURL(imageInput);
      } else if (typeof imageInput === 'string') {
        processImage(imageInput);
      } else {
        resolve(imageInput);
      }
    } catch (e) {
      console.warn('Image compression notice:', e);
      resolve(imageInput);
    }
  });
}

/**
 * Uploads payment screenshot proof to Firebase Storage under `donation-proofs/{donationId}/{filename}`.
 * Features a 3.5s timeout guard to prevent network hangs, falling back instantly to compressed base64.
 * 
 * @param {File|string} screenshotFileOrBase64 
 * @param {string} donationId 
 * @returns {Promise<string>}
 */
export async function uploadPaymentScreenshot(screenshotFileOrBase64, donationId) {
  if (!screenshotFileOrBase64) return '';

  let compressed;
  try {
    compressed = await compressImageFile(screenshotFileOrBase64);
  } catch (e) {
    compressed = screenshotFileOrBase64;
  }

  if (typeof compressed === 'string') {
    if (compressed.startsWith('http') || compressed.startsWith('data:')) {
      return compressed;
    }
  }

  const getBase64Fallback = (file) => {
    return new Promise((resolve) => {
      if (!(file instanceof File) && !(file instanceof Blob)) return resolve('');
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  try {
    const fileName = (compressed && compressed.name) || `proof_${Date.now()}.jpg`;
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `donation-proofs/${donationId}/${cleanFileName}`);

    const uploadPromise = (async () => {
      await uploadBytes(storageRef, compressed);
      return await getDownloadURL(storageRef);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 3500)
    );

    const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
    return downloadUrl;
  } catch (err) {
    console.warn('[Screenshot Storage Notice] Storage upload timeout/error, using compressed base64 fallback:', err);
    return await getBase64Fallback(compressed);
  }
}

/**
 * Submits a new donation record to Firebase Firestore.
 * 
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function submitDonationRecord({
  donorName,
  email,
  mobile,
  address,
  state,
  panNumber,
  amount,
  donationPurpose,
  paymentMethod, // 'UPI Scanner' | 'Bank Transfer'
  utrNumber,
  paymentApp = 'N/A',
  bankName = 'N/A',
  screenshotFile
}) {
  const normUtr = normalizeUtr(utrNumber);

  // 1. Check Duplicate UTR in Firestore
  if (normUtr) {
    const isDuplicate = await checkDuplicateUtr(normUtr);
    if (isDuplicate) {
      throw new Error(`Duplicate Transaction Error: A donation with this UTR / Reference ID (${utrNumber}) has already been submitted. Please check your transaction details.`);
    }
  }

  // 2. Format Donation ID & Date/Time
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const donationId = `LVS-DON-2026-${randomId}`;

  const now = new Date();
  const paymentDate = now.toISOString().split('T')[0];
  const paymentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const numericAmount = Number(String(amount).replace(/[^0-9.]/g, '')) || 0;
  const formattedAmount = numericAmount ? `₹ ${numericAmount.toLocaleString('en-IN')}` : `₹ ${amount}`;

  // 3. Process Screenshot Proof
  let screenshotUrl = '';
  if (screenshotFile) {
    screenshotUrl = await uploadPaymentScreenshot(screenshotFile, donationId);
  }

  // 4. Construct Firestore Payload
  const donationData = {
    donationId,
    donorName: donorName?.trim() || 'Generous Donor',
    email: email?.trim().toLowerCase() || '',
    mobile: mobile?.trim() || '',
    address: address?.trim() || '',
    state: state?.trim() || '',
    panNumber: panNumber?.trim().toUpperCase() || 'N/A',
    amount: numericAmount,
    formattedAmount,
    donationPurpose: donationPurpose || 'General Welfare Support',
    paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer' : 'UPI Scanner',
    utrNumber: utrNumber?.trim() || 'N/A',
    utrNumberNormalized: normUtr,
    paymentDate,
    paymentTime,
    paymentApp: paymentApp || 'N/A',
    bankName: bankName || 'Union Bank',
    paymentScreenshotUrl: screenshotUrl || '',
    status: 'Pending Verification',
    verificationStatus: 'Pending',
    adminRemarks: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // 5. Write to Firestore 'donations' collection with size protection retry
  try {
    const docRef = await addDoc(collection(db, 'donations'), donationData);
    donationData.id = docRef.id;
    donationData.firestoreId = docRef.id;
  } catch (err) {
    console.warn('[Firestore Write Error Notice]: Retrying write with sanitized payload:', err);
    if (donationData.paymentScreenshotUrl && donationData.paymentScreenshotUrl.length > 200000) {
      donationData.paymentScreenshotUrl = '[Proof attached - view proof image in admin viewer]';
    }
    const docRef = await addDoc(collection(db, 'donations'), donationData);
    donationData.id = docRef.id;
    donationData.firestoreId = docRef.id;
  }

  // 6. Trigger Background Email Event 1 (Pending Verification)
  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'donation_pending',
      applicantEmail: donationData.email,
      applicantName: donationData.donorName,
      data: {
        donationId: donationData.donationId,
        amount: donationData.amount,
        paymentMethod: donationData.paymentMethod,
        utrNumber: donationData.utrNumber,
        mobile: donationData.mobile
      }
    })
  }).catch(err => {
    console.warn('[Donation Email Service Notice] Background email dispatch error:', err);
  });

  return donationData;
}

/**
 * Updates the verification status of a donation document in Firestore.
 * 
 * @param {string} docId 
 * @param {string} status 'Verified' | 'Rejected' | 'Pending Verification'
 * @param {object} extraFields 
 */
export async function updateDonationStatus(docId, status, extraFields = {}) {
  if (!docId) throw new Error('Firestore Document ID is required to update donation status');

  const docRef = doc(db, 'donations', docId);
  const payload = {
    status,
    verificationStatus: status,
    updatedAt: serverTimestamp(),
    ...extraFields
  };

  await updateDoc(docRef, payload);
  return payload;
}

/**
 * Deletes a donation record from Firestore.
 * 
 * @param {string} docId 
 */
export async function deleteDonationRecord(docId) {
  if (!docId) throw new Error('Firestore Document ID is required to delete donation');
  const docRef = doc(db, 'donations', docId);
  await deleteDoc(docRef);
}
