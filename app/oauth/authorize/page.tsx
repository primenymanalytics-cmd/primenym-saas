"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { nanoid } from "nanoid"

function AuthorizeForm() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [authorizing, setAuthorizing] = useState(false)
    const [error, setError] = useState("")

    const redirectUri = searchParams.get("redirect_uri")
    const state = searchParams.get("state")
    const clientId = searchParams.get("client_id")

    useEffect(() => {
        if (!loading && !user) {
            // Need to save the current URL so we can return here after login
            const currentParams = searchParams.toString();
            const nextUrl = encodeURIComponent(`/oauth/authorize?${currentParams}`);
            // Wait, our login page doesn't handle "next" param yet. 
            // We'll just push to login for now. Users might have to click the connector link again.
            router.push(`/login`);
        }
    }, [user, loading, router, searchParams])

    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
                <p className="text-muted-foreground">Checking authentication...</p>
            </div>
        )
    }

    if (!redirectUri || !state) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 text-red-600 rounded-lg text-center">
                <ShieldAlert className="h-10 w-10 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Invalid Request</h2>
                <p className="text-sm">Missing required OAuth parameters (redirect_uri or state). Please try connecting again from Looker Studio.</p>
            </div>
        )
    }

    const handleAuthorize = async () => {
        setAuthorizing(true)
        setError("")

        try {
            if (!db) throw new Error("Database not initialized")

            // 1. Generate an authorization code
            const code = nanoid(32)

            // 2. Save it to Firestore in "oauth_codes" collection
            // We use the code as the document ID for quick lookup during the /oauth/token phase
            await setDoc(doc(db, "oauth_codes", code), {
                userId: user.uid,
                clientId: clientId || "looker_studio",
                redirectUri: redirectUri,
                createdAt: serverTimestamp(),
                // Expire in 10 minutes
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            })

            // 3. Redirect back to the requesting app (Looker Studio) with the code
            const redirectUrl = new URL(redirectUri)
            redirectUrl.searchParams.append("code", code)
            redirectUrl.searchParams.append("state", state)

            window.location.href = redirectUrl.toString()

        } catch (err: any) {
            console.error("Authorization Error:", err)
            setError(err.message || "Failed to generate authorization token.")
            setAuthorizing(false)
        }
    }

    const handleDeny = () => {
        const redirectUrl = new URL(redirectUri)
        redirectUrl.searchParams.append("error", "access_denied")
        redirectUrl.searchParams.append("state", state)
        window.location.href = redirectUrl.toString()
    }

    return (
        <Card className="max-w-md mx-auto mt-16 shadow-lg border-indigo-100 dark:border-indigo-900">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl">Authorize Primenym</CardTitle>
                <CardDescription className="pt-2">
                    Google Looker Studio is requesting access to your Primenym Data Sources.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm space-y-3">
                    <p className="font-medium text-slate-700 dark:text-slate-300">This will allow Looker Studio to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                        <li>Read your configured Data Sources (e.g. Shopify, Facebook Ads)</li>
                        <li>Verify your subscription status</li>
                        <li>Sync data into your dashboards</li>
                    </ul>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">
                    You are logged in as <span className="font-medium">{user.email}</span>. Not you? <a href="/login" className="text-indigo-600 hover:underline">Switch accounts</a>
                </p>
            </CardContent>
            <CardFooter className="flex gap-3 pt-2">
                <Button variant="outline" className="w-full" onClick={handleDeny} disabled={authorizing}>
                    Cancel
                </Button>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAuthorize} disabled={authorizing}>
                    {authorizing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing</> : 'Allow Access'}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function AuthorizePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<div className="text-center p-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>}>
                <AuthorizeForm />
            </Suspense>
        </div>
    )
}
