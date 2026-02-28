"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function NewSourcePage() {
    const { user } = useAuth()
    const router = useRouter()

    const [name, setName] = useState("")
    const [service, setService] = useState("shopify")
    const [apiKey, setApiKey] = useState("")
    const [apiSecret, setApiSecret] = useState("")
    const [storeUrl, setStoreUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !db) {
            setError("You must be logged in and Firebase must be initialized.");
            return;
        }

        if (!name || !apiKey) {
            setError("Name and API Key are required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // In a real production app, you might want to encrypt the API key 
            // before saving it to Firestore, or store it in a secret manager.
            // For this implementation, we are saving it directly, relying on 
            // Firestore security rules to protect access.
            const sourceData: any = {
                userId: user.uid,
                name,
                service,
                apiKey,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Add optional fields based on service
            if (service === 'shopify') {
                sourceData.apiSecret = apiSecret;
                sourceData.storeUrl = storeUrl;
            }

            await addDoc(collection(db, "sources"), sourceData);

            router.push("/dashboard/sources");
        } catch (err: any) {
            console.error("Error creating source:", err);
            setError(err.message || "Failed to create data source.");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/sources">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to sources</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Data Source</h1>
                    <p className="text-sm text-muted-foreground">Configure a new API connection for your Looker Studio reports.</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>
                            Enter the details provided by your third-party platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="service">Platform / Service</Label>
                            <select
                                id="service"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="shopify">Shopify Admin API</option>
                                <option value="woocommerce">WooCommerce API</option>
                                <option value="facebook_ads">Facebook Ads API</option>
                                <option value="custom">Custom REST API</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Friendly Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Primary Shopify Store"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <p className="text-[10px] text-muted-foreground">This is how the source will appear in Looker Studio dropdowns.</p>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <h3 className="text-sm font-medium">Authentication Credentials</h3>
                            </div>

                            {service === 'shopify' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="storeUrl">Shopify Store URL</Label>
                                        <Input
                                            id="storeUrl"
                                            placeholder="e.g. my-store.myshopify.com"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="apiKey">API Key / Access Token</Label>
                                <Input
                                    id="apiKey"
                                    type="password"
                                    placeholder="Enter your API key or token"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    required
                                />
                            </div>

                            {service === 'shopify' && (
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="apiSecret">API Secret (Optional)</Label>
                                    <Input
                                        id="apiSecret"
                                        type="password"
                                        placeholder="Enter your API secret if required"
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/30 flex justify-between border-t px-6 py-4">
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard/sources">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Data Source
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="text-center text-xs text-muted-foreground max-w-lg mx-auto mt-6">
                Your credentials are encrypted in transit and at rest using industry-standard Firebase security. We never log or cache your raw data.
            </div>
        </div>
    )
}
