import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    if (!dbAdmin) {
        return NextResponse.json({ error: 'Server Error', details: 'Firebase Admin not initialized' }, { status: 500 });
    }

    try {
        // 1. Extract Bearer token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];

        // 2. Verify token in Firestore
        const tokenDoc = await dbAdmin.collection('oauth_tokens').doc(token).get();

        if (!tokenDoc.exists) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Invalid or expired access token' }, { status: 401 });
        }

        const tokenData = tokenDoc.data();

        // Check if token is expired
        if (tokenData?.expiresAt?.toDate() < new Date()) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Access token has expired' }, { status: 401 });
        }

        const userId = tokenData?.userId;

        // 3. Fetch user's configured sources using Admin SDK (bypasses security rules securely)
        const sourcesSnapshot = await dbAdmin.collection('sources')
            .where('userId', '==', userId)
            .get();

        const configuredSources = sourcesSnapshot.docs.map(doc => {
            const data = doc.data();
            // We omit sensitive fields that Looker Studio might not strictly need right here, 
            // OR we include them securely so Google Apps Script can use them.
            // GAS will need the API keys to do the fetching!
            return {
                id: doc.id,
                name: data.name,
                service: data.service,
                apiKey: data.apiKey, // Included so GAS can authenticate with Shopify/etc
                shopUrl: data.shopUrl,
                status: data.status,
            };
        });

        // 4. Return success
        return NextResponse.json({
            success: true,
            sources: configuredSources
        });

    } catch (error) {
        console.error('Connector Config API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
