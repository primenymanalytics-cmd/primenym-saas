import { NextResponse } from 'next/server';
import { dbAdmin, authAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
    if (!dbAdmin || !authAdmin) {
        return NextResponse.json({ error: 'Server misconfiguration: Firebase Admin not initialized' }, { status: 500 });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await authAdmin.verifyIdToken(idToken);
        } catch (err) {
            console.error('ID token verification failed:', err);
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { clientId, redirectUri, state } = body;

        if (!clientId || !redirectUri) {
            return NextResponse.json({ error: 'Bad Request: Missing OAuth parameters' }, { status: 400 });
        }

        const userId = decodedToken.uid;

        // Generate a short-lived authorization code (valid for 5 minutes)
        const code = nanoid(32);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await dbAdmin.collection('oauth_codes').doc(code).set({
            userId,
            clientId,
            redirectUri,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt
        });

        // Construct the redirect URL with the code and state
        const url = new URL(redirectUri);
        url.searchParams.append('code', code);
        if (state) {
            url.searchParams.append('state', state);
        }

        return NextResponse.json({ success: true, redirectUrl: url.toString() });

    } catch (error) {
        console.error('OAuth Approve Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
