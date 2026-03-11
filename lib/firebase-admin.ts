import * as admin from 'firebase-admin';

let initError: any = null;

let parsedKey = process.env.FIREBASE_PRIVATE_KEY;
if (parsedKey) {
    // Remove accidentally included surrounding double or single quotes
    parsedKey = parsedKey.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    // Ensure escaped newlines are converted to actual newlines
    parsedKey = parsedKey.replace(/\\n/g, '\n');
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: parsedKey,
            }),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
        initError = error;
    }
}

// Only export if admin was initialized properly
const dbAdmin = admin.apps.length ? admin.firestore() : null;
const authAdmin = admin.apps.length ? admin.auth() : null;

export { dbAdmin, authAdmin, initError };
