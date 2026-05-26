import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  increment,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { getAnalytics, logEvent, isSupported, setUserId } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let analytics: any = null;
let eventQueue: { name: string, params?: any, type: 'event' | 'page_view' | 'identity' }[] = [];

// Initialize analytics asynchronously
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      // Process queue
      eventQueue.forEach(item => {
        if (item.type === 'page_view') {
          logEvent(analytics, 'page_view', item.params);
        } else if (item.type === 'identity') {
          setUserId(analytics, item.params.userId);
        } else {
          logEvent(analytics, item.name, item.params);
        }
      });
      eventQueue = [];
    }
  });
}

export const logPageView = (pageName: string) => {
  const params = {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  };

  if (analytics) {
    logEvent(analytics, 'page_view', params);
  } else {
    eventQueue.push({ type: 'page_view', name: 'page_view', params });
  }
};

export const logUserIdentity = (userId: string | null) => {
  if (analytics) {
    setUserId(analytics, userId);
  } else {
    eventQueue.push({ type: 'identity', name: 'set_user_id', params: { userId } });
  }
};

export const logCustomEvent = (eventName: string, params?: object) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  } else {
    eventQueue.push({ type: 'event', name: eventName, params });
  }
};

const googleProvider = new GoogleAuthProvider();

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Service functions
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Initialize user profile if it doesn't exist
    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        xp: 0,
        lastActive: serverTimestamp()
      });
    }
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const updateUserXP = async (userId: string, xpToAdd: number) => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      xp: increment(xpToAdd),
      lastActive: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

export const getLeaderboard = (callback: (users: any[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data());
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'users');
  });
};
