import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const { origin } = new URL(request.url)
    const redirectUri = `${origin}/api/connect/linkedin/callback`

    if (!clientId) {
        console.error("Missing LINKEDIN_CLIENT_ID environment variable.")
        return NextResponse.json({ error: "LinkedIn Ads integration not configured." }, { status: 500 })
    }

    // Pass the userId in the state parameter to recover it in the callback
    const state = userId

    // Required scopes for LinkedIn Ads
    // The exact scopes depend on the LinkedIn Marketing Developer Platform app settings
    // r_ads, r_ads_reporting, r_basicprofile (or r_liteprofile) are typically needed
    const scope = 'r_ads r_ads_reporting'

    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('scope', scope)

    return NextResponse.redirect(authUrl.toString())
}
