import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // We passed the User ID here
    const hmac = searchParams.get('hmac'); // Used for security verification in production

    if (!shop || !code || !state) {
        // Redirect back to dashboard with an error
        return NextResponse.redirect(new URL(`/dashboard/sources?error=missing_oauth_parameters`, req.url));
    }

    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Missing Shopify credentials in environment variables.");
        return NextResponse.redirect(new URL(`/dashboard/sources?error=server_misconfiguration`, req.url));
    }

    try {
        // Exchange the temporary code for a permanent access token
        const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Shopify token exchange failed:", data);
            return NextResponse.redirect(new URL(`/dashboard/sources?error=token_exchange_failed`, req.url));
        }

        const accessToken = data.access_token;
        const scopes = data.scope;

        if (!dbAdmin) {
            throw new Error("Firebase admin not initialized.");
        }

        // Save the access token securely into Firestore under the user's data sources
        await dbAdmin.collection('sources').add({
            userId: state,
            name: `Shopify (${shop.replace('.myshopify.com', '')})`,
            service: 'shopify',
            shopUrl: shop,
            apiKey: accessToken, // The permanent API access token Looker Studio will need
            scopes: scopes,
            status: 'active',
            authMethod: 'oauth2',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Redirect back to the dashboard indicating success
        // In local development, the port might be 3000
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return NextResponse.redirect(`${protocol}://${host}/dashboard/sources?success=connected`);

    } catch (error) {
        console.error('Shopify Callback Error:', error);
        return NextResponse.redirect(new URL(`/dashboard/sources?error=internal_server_error`, req.url));
    }
}
