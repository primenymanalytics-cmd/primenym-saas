import { NextResponse } from 'next/server'
import { dbAdmin } from '@/lib/firebase-admin'

export async function GET(request: Request) {
    const { origin } = new URL(request.url)
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This is the userId
    const error = searchParams.get('error')

    if (error) {
        console.error("LinkedIn OAuth Error:", error, searchParams.get("error_description"))
        return NextResponse.redirect(`${origin}/dashboard/sources/add?error=linkedin_oauth_failed`)
    }

    if (!code || !state) {
        return NextResponse.redirect(`${origin}/dashboard/sources/add?error=missing_parameters`)
    }

    const userId = state

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const redirectUri = `${origin}/api/connect/linkedin/callback`

    if (!clientId || !clientSecret) {
        console.error("Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET environment variable.")
        return NextResponse.redirect(`${origin}/dashboard/sources/add?error=server_configuration_error`)
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            }).toString(),
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error("Error fetching LinkedIn access token:", errorData)
            return NextResponse.redirect(`${origin}/dashboard/sources/add?error=token_exchange_failed`)
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token
        const expiresIn = tokenData.expires_in
        const refreshToken = tokenData.refresh_token
        const refreshTokenExpiresIn = tokenData.refresh_token_expires_in

        if (!dbAdmin) {
            throw new Error("Firebase Admin DB is not initialized.")
        }

        // Store credentials in Firestore
        await dbAdmin.collection("users").doc(userId).collection("sources").doc("linkedin_ads").set({
            connectorId: "linkedin-ads",
            name: "LinkedIn Ads",
            connectedAt: new Date().toISOString(),
            accessToken: accessToken,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
            refreshToken: refreshToken || null,
            refreshTokenExpiresAt: refreshTokenExpiresIn ? new Date(Date.now() + refreshTokenExpiresIn * 1000).toISOString() : null,
            status: 'active'
        }, { merge: true })

        return NextResponse.redirect(`${origin}/dashboard/sources`)

    } catch (error) {
        console.error("Caught error in LinkedIn callback:", error)
        return NextResponse.redirect(`${origin}/dashboard/sources/add?error=internal_server_error`)
    }
}
