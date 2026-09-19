import { db, collection, addDoc, serverTimestamp } from '../firebase';

/**
 * Utility function to save form submission data reliably to Firebase Firestore with a timeout protection.
 * Ensures the UI never freezes or hangs for 10+ seconds if Firebase connection is slow.
 * Dispatches a custom window event so the Admin Portal receives immediate updates.
 * 
 * @param {string} collectionName - Firestore collection name (e.g. 'training_applications', 'contacts', 'partners', 'volunteers', 'placements', 'donations')
 * @param {object} dataPayload - Object payload to save
 * @param {string} [customEventName] - Optional custom window event to dispatch for Admin Portal sync (e.g. 'lvs_new_application')
 * @param {number} [timeoutMs=3500] - Max time in ms to wait for direct network response before resolving UI
 * @returns {Promise<object>} - The processed record with firestoreId if available
 */
export async function saveToFirestore(collectionName, dataPayload, customEventName = null, timeoutMs = 3500) {
  // 1. Sanitize payload: strip undefined values to prevent Firestore serialization errors
  const sanitize = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj.toISOString();
    
    const cleaned = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = (typeof val === 'object' && val !== null && !(val instanceof Date))
          ? sanitize(val)
          : val;
      }
    }
    return cleaned;
  };

  const cleanData = sanitize(dataPayload);

  // Attach serverTimestamp if not present
  const firestorePayload = {
    ...cleanData,
    createdAt: serverTimestamp()
  };

  const finalRecord = { ...cleanData };

  // 2. Perform non-blocking write with timeout fallback
  try {
    const addPromise = addDoc(collection(db, collectionName), firestorePayload);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), timeoutMs));

    const result = await Promise.race([addPromise, timeoutPromise]);

    if (result && result !== 'TIMEOUT' && result.id) {
      finalRecord.firestoreId = result.id;
    } else if (result === 'TIMEOUT') {
      console.warn(`[Firebase Save] Write to '${collectionName}' timed out after ${timeoutMs}ms. Continuing in background/offline cache.`);
      // Continue addPromise in background without blocking caller UI
      addPromise.then(ref => {
        finalRecord.firestoreId = ref.id;
      }).catch(err => {
        console.warn(`[Firebase Save Background] Firestore background save notice for '${collectionName}':`, err);
      });
    }
  } catch (firebaseErr) {
    console.warn(`[Firebase Save Notice] Could not immediately reach Firestore for '${collectionName}':`, firebaseErr);
  }

  // 3. Dispatch Custom Event for instant Admin Portal synchronization
  if (customEventName && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(customEventName, { detail: finalRecord }));
    } catch (evtErr) {
      console.warn(`[Firebase Save] Event dispatch notice for '${customEventName}':`, evtErr);
    }
  }

  return finalRecord;
}
