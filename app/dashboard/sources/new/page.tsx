"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { connectors } from "@/lib/connectors"
import { nanoid } from "nanoid"

export default function NewSourcePage() {
    const { user } = useAuth()
    const router = useRouter()

    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [error, setError] = useState("")

    const handleOAuthConnect = async (connectorId: string, connectorName: string) => {
        if (!user || !db) {
            setError("You must be logged in to connect a data source.")
            return;
        }

        setConnectingId(connectorId);
        setError("");

        try {
            // NOTE: In a real environment, this button would redirect the user to 
            // the official OAuth provider (e.g., https://shopify.com/admin/oauth/authorize)
            // along with your client ID and redirect URI. 
            // When the provider redirects back to your Next.js app, you would exchange 
            // the authorization code for a real access token on the server.

            // For this demonstration, we are mocking the OAuth redirect delay 
            // and generating a mock access token to save directly to Firestore.
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate OAuth navigation

            const mockAccessToken = `oauth_${nanoid(24)}`;

            await addDoc(collection(db, "sources"), {
                userId: user.uid,
                name: `${connectorName} Connection`,
                service: connectorId,
                apiKey: mockAccessToken, // Storing the OAuth access token here
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                authMethod: 'oauth2'
            });

            // Redirect back to sources listing
            router.push("/dashboard/sources");
        } catch (err: any) {
            console.error("OAuth Connection Error:", err);
            setError(`Failed to connect to ${connectorName}. Please try again.`);
            setConnectingId(null);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/sources">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to sources</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Data Source</h1>
                    <p className="text-sm text-muted-foreground">Select a platform below to connect via secure OAuth.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start text-sm">
                    <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {connectors.map((connector) => (
                    <Card key={connector.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                                {connector.icon}
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-lg">{connector.name}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    {connector.description}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li>&bull; Connects via secure OAuth 2.0</li>
                                <li>&bull; Read-only data access</li>
                            </ul>
                        </CardContent>
                        <CardContent className="pt-0 border-t mt-auto">
                            <Button
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => handleOAuthConnect(connector.id, connector.name)}
                                disabled={connectingId !== null}
                            >
                                {connectingId === connector.id ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                                ) : (
                                    <><LinkIcon className="mr-2 h-3 w-3" /> Connect {connector.name}</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center text-xs text-muted-foreground mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p>We use official OAuth endpoints to authorize access. Primenym never sees or stores your raw passwords.</p>
            </div>
        </div>
    )
}
