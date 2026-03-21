'use client';

import { initializeFirebase } from '@/firebase';
import { getStorage } from 'firebase/storage';

// Use the standard studio initialization which falls back to the hardcoded config
const { firebaseApp, firestore, auth } = initializeFirebase();
const storage = getStorage(firebaseApp);

export { firebaseApp as app, firestore as db, auth, storage };
