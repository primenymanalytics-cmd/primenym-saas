import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');

    // In a real application, you might want to pass the user ID as state or retrieve it from a secure session cookie
    // For this example, we pass the uid in the state parameter
    const state = searchParams.get('uid');

    if (!shop || !shop.includes('.myshopify.com')) {
        return NextResponse.json({ error: 'Valid Shopify domain is required (e.g., store.myshopify.com)' }, { status: 400 });
    }

    if (!state) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;

    // In production, this should be your actual live URL, e.g., https://primenym.com/api/connect/shopify/callback
    // For local dev, checking the host helps
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/connect/shopify/callback`;

    if (!clientId) {
        console.error("Missing NEXT_PUBLIC_SHOPIFY_CLIENT_ID environment variable.");
        return NextResponse.json({ error: 'Server misconfiguration: missing client ID' }, { status: 500 });
    }

    // Required scopes for typical Looker Studio E-Commerce Dashboards
    const scopes = 'read_orders,read_products,read_customers,read_analytics';

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    return NextResponse.redirect(authUrl);
}
