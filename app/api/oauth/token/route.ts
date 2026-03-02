import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
    if (!dbAdmin) {
        return NextResponse.json({ error: 'Server misconfiguration: Firebase Admin not initialized' }, { status: 500 });
    }

    try {
        // Looker Studio sends form-urlencoded data for OAuth token exchange
        const bodyText = await req.text();
        const params = new URLSearchParams(bodyText);

        const grant_type = params.get('grant_type');
        const client_id = params.get('client_id');

        if (grant_type === 'authorization_code') {
            const code = params.get('code');
            const redirect_uri = params.get('redirect_uri');

            if (!code) {
                return NextResponse.json({ error: 'invalid_request', error_description: 'Missing code parameter' }, { status: 400 });
            }

            // 1. Verify the code
            const codeRef = dbAdmin.collection('oauth_codes').doc(code);
            const codeDoc = await codeRef.get();

            if (!codeDoc.exists) {
                return NextResponse.json({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' }, { status: 400 });
            }

            const codeData = codeDoc.data();

            // Check expiration
            if (codeData?.expiresAt?.toDate() < new Date()) {
                await codeRef.delete();
                return NextResponse.json({ error: 'invalid_grant', error_description: 'Authorization code has expired' }, { status: 400 });
            }

            // 2. Delete the code so it can't be reused
            await codeRef.delete();

            // 3. Generate tokens
            const access_token = nanoid(48);
            const refresh_token = nanoid(48);
            const expiresIn = 3600; // 1 hour

            // 4. Save tokens to Firestore
            await dbAdmin.collection('oauth_tokens').doc(access_token).set({
                userId: codeData?.userId,
                clientId: client_id || 'unknown',
                refreshToken: refresh_token,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + expiresIn * 1000)
            });

            // 5. Return standards-compliant response
            return NextResponse.json({
                access_token,
                token_type: 'Bearer',
                expires_in: expiresIn,
                refresh_token
            });

        } else if (grant_type === 'refresh_token') {
            const current_refresh_token = params.get('refresh_token');

            if (!current_refresh_token) {
                return NextResponse.json({ error: 'invalid_request', error_description: 'Missing refresh_token parameter' }, { status: 400 });
            }

            // 1. Find the token associated with this refresh_token
            const tokensSnapshot = await dbAdmin.collection('oauth_tokens')
                .where('refreshToken', '==', current_refresh_token)
                .limit(1)
                .get();

            if (tokensSnapshot.empty) {
                return NextResponse.json({ error: 'invalid_grant', error_description: 'Invalid refresh token' }, { status: 400 });
            }

            const oldTokenDoc = tokensSnapshot.docs[0];
            const oldTokenData = oldTokenDoc.data();

            // 2. Generate new tokens
            const new_access_token = nanoid(48);
            const new_refresh_token = nanoid(48); // Rotate refresh token
            const expiresIn = 3600; // 1 hour

            // 3. Save new token
            await dbAdmin.collection('oauth_tokens').doc(new_access_token).set({
                userId: oldTokenData.userId,
                clientId: client_id || oldTokenData.clientId,
                refreshToken: new_refresh_token,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + expiresIn * 1000)
            });

            // 4. Delete old token doc
            await oldTokenDoc.ref.delete();

            return NextResponse.json({
                access_token: new_access_token,
                token_type: 'Bearer',
                expires_in: expiresIn,
                refresh_token: new_refresh_token
            });
        }

        return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });

    } catch (error) {
        console.error('OAuth Token Error:', error);
        return NextResponse.json({ error: 'server_error', error_description: 'An internal server error occurred' }, { status: 500 });
    }
}
