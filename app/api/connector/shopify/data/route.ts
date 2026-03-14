import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

const CLOUD_RUN_URL = process.env.CLOUD_RUN_URL;
const CLOUD_RUN_API_KEY = process.env.CLOUD_RUN_API_KEY;

export async function GET(req: Request) {
    if (!dbAdmin) {
        return NextResponse.json({ error: 'Server Error', details: 'Firebase Admin not initialized' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get('storeId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!storeId) {
            return NextResponse.json({ error: 'Bad Request', details: 'Missing storeId parameter' }, { status: 400 });
        }

        // 1. Extract Bearer token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Missing or invalid Authorization header' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];

        // 2. PARALLEL Firestore reads (Plan A: ~100ms total instead of ~300ms sequential)
        const [tokenDoc, sourceDoc] = await Promise.all([
            dbAdmin.collection('oauth_tokens').doc(token).get(),
            dbAdmin.collection('sources').doc(storeId).get()
        ]);

        // --- Validate token ---
        if (!tokenDoc.exists) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Invalid or expired access token' }, { status: 401 });
        }
        const tokenData = tokenDoc.data();
        if (tokenData?.expiresAt?.toDate() < new Date()) {
            return NextResponse.json({ error: 'Unauthorized', details: 'Access token has expired' }, { status: 401 });
        }
        const userId = tokenData?.userId;

        // --- Validate source ---
        if (!sourceDoc.exists) {
            return NextResponse.json({ error: 'Not Found', details: 'Data source not found.' }, { status: 404 });
        }
        const sourceData = sourceDoc.data();
        if (sourceData?.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden', details: 'You do not own this data source.' }, { status: 403 });
        }
        if (sourceData?.service !== 'shopify') {
            return NextResponse.json({ error: 'Bad Request', details: 'Data source is not a Shopify instance.' }, { status: 400 });
        }

        // --- Check subscription (when subscriptions collection exists) ---
        try {
            const subDoc = await dbAdmin.collection('subscriptions').doc(userId).get();
            if (subDoc.exists) {
                const subData = subDoc.data();
                const isActive = subData?.status === 'active';
                const hasConnector = (subData?.connectors || []).includes('shopify');
                const notExpired = subData?.currentPeriodEnd?.toDate() > new Date();

                if (!isActive || !hasConnector || !notExpired) {
                    return NextResponse.json({
                        error: 'Subscription Required',
                        details: 'Your subscription does not include this connector or has expired.'
                    }, { status: 403 });
                }
            }
            // If subscriptions collection doesn't exist yet, allow access (no Stripe yet)
        } catch {
            // Subscription check is non-blocking until Stripe is set up
        }

        const shopifyAccessToken = sourceData.apiKey;
        const shopUrl = sourceData.shopUrl;

        // 3. Forward to Cloud Run (if configured) or fetch directly as fallback
        if (CLOUD_RUN_URL && CLOUD_RUN_API_KEY) {
            const cloudRunResponse = await fetch(`${CLOUD_RUN_URL}/fetch-orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CLOUD_RUN_API_KEY
                },
                body: JSON.stringify({
                    shopUrl,
                    shopifyAccessToken,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                })
            });

            if (!cloudRunResponse.ok) {
                const errorData = await cloudRunResponse.json().catch(() => ({}));
                console.error('Cloud Run Error:', errorData);
                return NextResponse.json(
                    { error: 'Upstream Error', details: errorData.details || 'Cloud Run service failed' },
                    { status: 502 }
                );
            }

            const data = await cloudRunResponse.json();
            return NextResponse.json({ success: true, orders: data.orders || [] });

        } else {
            // Fallback: fetch directly from Shopify (no Cloud Run configured)
            let shopifyApiUrl = `https://${shopUrl}/admin/api/2024-01/orders.json?status=any&limit=250`;

            if (startDate && endDate) {
                const formatDate = (d: string, isEnd: boolean) => {
                    if (d.length === 8) {
                        const y = d.slice(0, 4), m = d.slice(4, 6), day = d.slice(6, 8);
                        return isEnd ? `${y}-${m}-${day}T23:59:59Z` : `${y}-${m}-${day}T00:00:00Z`;
                    }
                    return d;
                };
                shopifyApiUrl += `&created_at_min=${formatDate(startDate, false)}`;
                shopifyApiUrl += `&created_at_max=${formatDate(endDate, true)}`;
            }

            const shopifyResponse = await fetch(shopifyApiUrl, {
                headers: {
                    'X-Shopify-Access-Token': shopifyAccessToken,
                    'Content-Type': 'application/json'
                }
            });

            if (!shopifyResponse.ok) {
                const errorText = await shopifyResponse.text();
                console.error('Shopify API Error:', errorText);
                return NextResponse.json({ error: 'Upstream Error', details: 'Failed to fetch data from Shopify' }, { status: 502 });
            }

            const shopifyData = await shopifyResponse.json();
            return NextResponse.json({ success: true, orders: shopifyData.orders || [] });
        }

    } catch (error) {
        console.error('Connector Shopify Data API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
