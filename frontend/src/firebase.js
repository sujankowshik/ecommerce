import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';

let firebaseApp = null;
let firebaseAuthInstance = null;
let googleProviderInstance = null;
let isMockAuth = false;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasCredentials = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

if (hasCredentials) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    }
    firebaseAuthInstance = getAuth(firebaseApp);
    googleProviderInstance = new GoogleAuthProvider();
    console.log('Firebase Client SDK initialized.');
  } catch (error) {
    console.warn(`Firebase Client SDK failed to initialize: ${error.message}. Fallback to simulated mock auth.`);
    isMockAuth = true;
  }
} else {
  console.warn('Firebase VITE_ keys are missing or placeholders. Running in local simulated Auth mode.');
  isMockAuth = true;
}

// ----------------------------------------------------
// Sandboxed Mock Auth Client Simulator
// ----------------------------------------------------
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Read user from localStorage if logged in
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      mockAuth.currentUser = {
        uid: parsed.role === 'admin' ? 'mock-admin-uid' : 'mock-user-uid',
        email: parsed.email,
        displayName: parsed.name,
        photoURL: parsed.avatar || '',
        getIdToken: () => Promise.resolve(parsed.token || 'mock-user-token')
      };
      callback(mockAuth.currentUser);
    } else {
      mockAuth.currentUser = null;
      callback(null);
    }
    // Return unsubscribe listener stub
    return () => {};
  },
  signInWithEmail: async (email, password) => {
    console.log(`[Auth Simulator] Logging in email: ${email}`);
    
    // Simulating normal network latency
    await new Promise((r) => setTimeout(r, 600));

    // Demo roles routing: check if user typed "admin"
    const isAdmin = email.includes('admin') || password.includes('admin');
    const userPayload = {
      uid: isAdmin ? 'mock-admin-uid' : 'mock-user-uid',
      email: email,
      displayName: isAdmin ? 'Mock Admin' : 'Mock Customer',
      photoURL: isAdmin 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' 
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      getIdToken: () => Promise.resolve(isAdmin ? 'mock-admin-token' : 'mock-user-token')
    };

    mockAuth.currentUser = userPayload;
    return { user: userPayload };
  },
  signUpWithEmail: async (email, password, displayName) => {
    console.log(`[Auth Simulator] Registering user: ${email}`);
    await new Promise((r) => setTimeout(r, 600));

    const userPayload = {
      uid: 'mock-user-uid',
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: '',
      getIdToken: () => Promise.resolve('mock-user-token')
    };

    mockAuth.currentUser = userPayload;
    return { user: userPayload };
  },
  signInWithGoogle: async () => {
    console.log('[Auth Simulator] Triggering simulated Google Sign-In...');
    await new Promise((r) => setTimeout(r, 600));

    const userPayload = {
      uid: 'mock-user-uid',
      email: 'customer.google@ecommerce.com',
      displayName: 'Google Customer',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      getIdToken: () => Promise.resolve('mock-google-token')
    };

    mockAuth.currentUser = userPayload;
    return { user: userPayload };
  },
  signOut: async () => {
    mockAuth.currentUser = null;
    return Promise.resolve();
  },
  sendPasswordReset: async (email) => {
    console.log(`[Auth Simulator] Sending reset link to: ${email}`);
    await new Promise((r) => setTimeout(r, 400));
    return Promise.resolve();
  },
  signInWithPhone: async (phoneNumber) => {
    console.log(`[Auth Simulator] Sending simulated OTP to: ${phoneNumber}`);
    await new Promise((r) => setTimeout(r, 600));
    
    // Return mock confirmation result
    return {
      confirm: async (code) => {
        console.log(`[Auth Simulator] Verifying OTP code: ${code}`);
        await new Promise((r) => setTimeout(r, 500));
        
        if (code === '123456' || code.length === 6) {
          const userPayload = {
            uid: 'mock-phone-uid',
            email: `phone_${phoneNumber.replace(/[^0-9]/g, '')}@ecommerce.com`,
            displayName: `Customer (${phoneNumber})`,
            photoURL: '',
            getIdToken: () => Promise.resolve('mock-phone-token')
          };
          mockAuth.currentUser = userPayload;
          return { user: userPayload };
        } else {
          throw new Error('Invalid 6-digit OTP code. Enter 123456 to simulate success.');
        }
      }
    };
  }
};

// Expose standard API bindings regardless of real or mock operations
export const auth = isMockAuth ? null : firebaseAuthInstance;
export const googleProvider = isMockAuth ? null : googleProviderInstance;
export const isMockAuthentication = isMockAuth;

// Reusable standard wrappers
export const firebaseSignInWithGoogle = async () => {
  if (isMockAuth) return mockAuth.signInWithGoogle();
  return signInWithPopup(firebaseAuthInstance, googleProviderInstance);
};

export const firebaseSignInWithEmail = async (email, password) => {
  if (isMockAuth) return mockAuth.signInWithEmail(email, password);
  return signInWithEmailAndPassword(firebaseAuthInstance, email, password);
};

export const firebaseSignUpWithEmail = async (email, password, displayName) => {
  if (isMockAuth) return mockAuth.signUpWithEmail(email, password, displayName);
  return createUserWithEmailAndPassword(firebaseAuthInstance, email, password);
};

export const firebaseSignOut = async () => {
  if (isMockAuth) return mockAuth.signOut();
  return signOut(firebaseAuthInstance);
};

export const firebasePasswordReset = async (email) => {
  if (isMockAuth) return mockAuth.sendPasswordReset(email);
  return sendPasswordResetEmail(firebaseAuthInstance, email);
};

export const onAuthStateChangedListener = (callback) => {
  if (isMockAuth) return mockAuth.onAuthStateChanged(callback);
  return firebaseAuthInstance.onAuthStateChanged(callback);
};

export const firebaseSignInWithPhone = async (phoneNumber, appVerifier) => {
  if (isMockAuth) return mockAuth.signInWithPhone(phoneNumber);
  return signInWithPhoneNumber(firebaseAuthInstance, phoneNumber, appVerifier);
};

export const getRecaptchaVerifier = (containerId) => {
  if (isMockAuth) return null;
  return new RecaptchaVerifier(firebaseAuthInstance, containerId, {
    size: 'invisible',
    callback: (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
};
