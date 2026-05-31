import admin from 'firebase-admin';

let firebaseAdminApp = null;
let isMockFirebase = false;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  try {
    // Process single-line string private key replacement (common in deployment platforms)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey
      })
    });
    console.log('Firebase Admin SDK Initialized Successfully.');
  } catch (error) {
    console.warn(`Firebase Admin SDK failed to initialize with provided credentials: ${error.message}`);
    isMockFirebase = true;
  }
} else {
  console.warn('Firebase environment variables are missing. Using local Firebase Admin Simulator for testing.');
  isMockFirebase = true;
}

// Resilient auth mock helper for local developers
const mockAuth = {
  verifyIdToken: async (token) => {
    console.log(`[Firebase Simulator] Verifying ID token: ${token.substring(0, 15)}...`);
    
    if (token === 'mock-admin-token' || token.includes('admin')) {
      return {
        uid: 'mock-admin-uid',
        email: 'admin@ecommerce.com',
        name: 'Mock Admin',
        email_verified: true
      };
    }
    
    if (token === 'mock-phone-token' || token.includes('phone')) {
      return {
        uid: 'mock-phone-uid',
        phone_number: '+15550199',
        name: 'Mock Phone User',
        email_verified: false
      };
    }
    
    // Default mock user
    return {
      uid: 'mock-user-uid',
      email: token.includes('@') ? token : 'user@ecommerce.com',
      name: 'Mock User',
      email_verified: true
    };
  }
};

const firebaseAuth = isMockFirebase ? mockAuth : admin.auth();

export { firebaseAuth, isMockFirebase };
