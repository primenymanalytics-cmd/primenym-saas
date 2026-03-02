import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle newlines in the private key string
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

// Only export if admin was initialized properly
const dbAdmin = admin.apps.length ? admin.firestore() : null;
const authAdmin = admin.apps.length ? admin.auth() : null;

export { dbAdmin, authAdmin };
