import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    let shopUrl = searchParams.get('url');
    const state = searchParams.get('uid');

    if (!shopUrl || !state) {
        return NextResponse.json({ error: 'WordPress URL and User ID are required' }, { status: 400 });
    }

    // Ensure URL has protocol
    if (!/^https?:\/\//i.test(shopUrl)) {
        shopUrl = 'https://' + shopUrl;
    }

    // Remove trailing slash if present
    shopUrl = shopUrl.replace(/\/$/, '');

    const { origin } = new URL(req.url);

    const returnUrl = `${origin}/dashboard/sources?success=connected&provider=woocommerce`;
    const callbackUrl = `${origin}/api/connect/woocommerce/callback`;

    // Construct WooCommerce Auth URL
    const appName = "Primenym Looker Connectors";
    const scope = "read";

    // The user_id param here is important. WP will pass this back to our POST callback 
    // so we know which Primenym user these API credentials belong to.
    const authUrl = `${shopUrl}/wc-auth/v1/authorize?app_name=${encodeURIComponent(appName)}&scope=${scope}&user_id=${encodeURIComponent(state)}&return_url=${encodeURIComponent(returnUrl)}&callback_url=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.redirect(authUrl);
}
