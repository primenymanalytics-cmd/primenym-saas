import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    if (!dbAdmin) {
        return NextResponse.json({ error: 'Server Error', details: 'Firebase Admin not initialized' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get('storeId');
        // Looker Studio might pass dates like YYYYMMDD, we need to adapt here if necessary
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!storeId) {
            return NextResponse.json({ error: 'Bad Request', details: 'Missing storeId parameter' }, { status: 400 });
        }

        // 1. Extract Bearer token from Looker Studio request
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
        if (tokenData?.expiresAt?.toDate() < new Date()) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Access token has expired' }, { status: 401 });
        }

        const userId = tokenData?.userId;

        // 3. Fetch the requested Shopify source from Firestore secure vault
        const sourceDoc = await dbAdmin.collection('sources').doc(storeId).get();
        if (!sourceDoc.exists) {
            return NextResponse.json({ error: 'Not Found', details: 'Data source not found.' }, { status: 404 });
        }

        const sourceData = sourceDoc.data();

        // Security check: ensure this user actually owns this storeId
        if (sourceData?.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden', details: 'You do not own this data source.' }, { status: 403 });
        }

        if (sourceData?.service !== 'shopify') {
            return NextResponse.json({ error: 'Bad Request', details: 'Data source is not a Shopify instance.' }, { status: 400 });
        }

        const shopifyAccessToken = sourceData.apiKey;
        const shopUrl = sourceData.shopUrl;

        // 4. Fetch data from Shopify (Orders API as an example)
        // Adjust endpoint and parameters based on actual Looker Studio requirements
        let shopifyApiUrl = `https://${shopUrl}/admin/api/2023-10/orders.json?status=any`;

        if (startDate && endDate) {
            // Shopify expects ISO 8601 (e.g., 2023-10-01T00:00:00Z)
            // Looker Studio sends YYYYMMDD by default if we configured it, or ISO.
            // Assuming Looker sends YYYYMMDD based on standard date ranges
            const formatLsDate = (lsDate: string, isEnd: boolean) => {
                if (lsDate.length === 8) {
                    const y = lsDate.slice(0, 4);
                    const m = lsDate.slice(4, 6);
                    const d = lsDate.slice(6, 8);
                    return isEnd ? `${y}-${m}-${d}T23:59:59Z` : `${y}-${m}-${d}T00:00:00Z`;
                }
                return lsDate; // fallback
            };

            shopifyApiUrl += `&created_at_min=${formatLsDate(startDate, false)}`;
            shopifyApiUrl += `&created_at_max=${formatLsDate(endDate, true)}`;
        }

        const shopifyResponse = await fetch(shopifyApiUrl, {
            headers: {
                'X-Shopify-Access-Token': shopifyAccessToken,
                'Content-Type': 'application/json'
            }
        });

        if (!shopifyResponse.ok) {
            const errorText = await shopifyResponse.text();
            console.error("Shopify API Error:", errorText);
            return NextResponse.json({ error: 'Upstream Error', details: 'Failed to fetch data from Shopify' }, { status: 502 });
        }

        const shopifyData = await shopifyResponse.json();

        // 5. Structure data specifically for our GAS Data.js expectation
        // We will just return the raw orders array, and Data.js will map it to fields
        return NextResponse.json({
            success: true,
            orders: shopifyData.orders || []
        });

    } catch (error) {
        console.error('Connector Shopify Data API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
