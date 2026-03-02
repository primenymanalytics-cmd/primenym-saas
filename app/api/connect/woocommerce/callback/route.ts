import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// WooCommerce sends a POST request with the new API keys to this endpoint
// This is server-to-server and happens in the background.
export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const payload = JSON.parse(bodyText);

        const key_id = payload.key_id;
        const user_id = payload.user_id; // This is the Primenym UID we passed in the authorize URL
        const consumer_key = payload.consumer_key;
        const consumer_secret = payload.consumer_secret;
        const key_permissions = payload.key_permissions;

        if (!user_id || !consumer_key || !consumer_secret) {
            console.error("WooCommerce missing required parameters in POST body:", payload);
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (!dbAdmin) {
            console.error("Firebase admin not initialized.");
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // We need the shop URL to know which database this points to. 
        // Unfortunately, WooCommerce's standard pingback doesn't always include the origin URL in the body.
        // We can sometimes extract it from headers or we might just label it generally. 
        // We'll rely on the user seeing "WooCommerce" and the timestamp.

        const storeOrigin = req.headers.get('origin') || "WooCommerce Store";

        // Save the consumer_key & consumer_secret securely into Firestore
        await dbAdmin.collection('sources').add({
            userId: user_id,
            name: `${storeOrigin} Connection`,
            service: 'woocommerce',
            apiKey: consumer_key,       // Maps to our standard naming conventions
            apiSecret: consumer_secret, // We store the secret here
            wcKeyId: key_id,
            scopes: key_permissions,
            status: 'active',
            authMethod: 'oauth1a', // WooCommerce uses OAuth 1.0a under the hood
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // We must return a 200 OK so WooCommerce knows we received the keys successfully
        return NextResponse.json({ success: true, message: 'Keys accepted' }, { status: 200 });

    } catch (error) {
        console.error('WooCommerce Callback Error:', error);
        return NextResponse.json({ error: 'Internal server error processing keys' }, { status: 500 });
    }
}
