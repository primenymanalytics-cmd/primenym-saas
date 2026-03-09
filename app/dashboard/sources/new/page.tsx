"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { connectors } from "@/lib/connectors"

export default function NewSourcePage() {
    const { user } = useAuth()
    const router = useRouter()

    // State to track which connector the user clicked "Connect" on
    const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
    const [shopUrl, setShopUrl] = useState("")
    const [error, setError] = useState("")

    const handleOAuthConnect = async (connectorId: string, connectorName: string) => {
        if (!user) {
            setError("You must be logged in to connect a data source.")
            return;
        }

        setError("");

        if (connectorId === "linkedin-ads") {
            const authUrl = `/api/connect/linkedin/authorize?userId=${user.uid}`;
            window.location.href = authUrl;
        } else if (connectorId === "shopify" || connectorId === "woocommerce") {
            // Reveal the input field for store domain
            if (selectedConnector !== connectorId) {
                setSelectedConnector(connectorId)
                return;
            }

            // If already selected, they clicked "Proceed"
            if (!shopUrl) {
                setError(`Please enter a valid ${connectorName} store URL.`)
                return;
            }

            if (connectorId === "shopify") {
                if (!shopUrl.includes(".myshopify.com")) {
                    setError("Please enter a valid Shopify domain (e.g., store.myshopify.com).")
                    return;
                }
                const authUrl = `/api/connect/shopify/authorize?shop=${encodeURIComponent(shopUrl)}&uid=${user.uid}`;
                window.location.href = authUrl;
            } else if (connectorId === "woocommerce") {
                if (!shopUrl.startsWith("http")) {
                    setError("Please include https:// in your WordPress URL.")
                    return;
                }
                const authUrl = `/api/connect/woocommerce/authorize?url=${encodeURIComponent(shopUrl)}&uid=${user.uid}`;
                window.location.href = authUrl;
            }

        } else {
            // Other connectors fallback logic or future implementation
            setError(`${connectorName} OAuth flow is not implemented yet.`)
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
                    <Card key={connector.id} className={`flex flex-col h-full hover:shadow-md transition-shadow ${selectedConnector === connector.id ? 'ring-2 ring-indigo-600' : ''}`}>
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
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

                        {(selectedConnector === connector.id && (connector.id === "shopify" || connector.id === "woocommerce")) && (
                            <CardContent className="bg-indigo-50/50 dark:bg-indigo-950/20 pt-4 pb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shopUrl" className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                                        {connector.id === "shopify" ? "Shopify Store Domain" : "WordPress Store URL"}
                                    </Label>
                                    <Input
                                        id="shopUrl"
                                        placeholder={connector.id === "shopify" ? "e.g. my-store.myshopify.com" : "e.g. https://my-store.com"}
                                        value={shopUrl}
                                        onChange={(e) => setShopUrl(e.target.value)}
                                        className="h-9 text-sm border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Required to identify your {connector.name} instance.</p>
                                </div>
                            </CardContent>
                        )}

                        {!selectedConnector && (
                            <CardContent className="flex-1">
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    <li>&bull; Connects via secure OAuth 2.0</li>
                                    <li>&bull; Read-only data access</li>
                                </ul>
                            </CardContent>
                        )}

                        <CardContent className="pt-4 border-t mt-auto text-center">
                            {selectedConnector === connector.id ? (
                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-1/3 text-xs" onClick={() => setSelectedConnector(null)}>Cancel</Button>
                                    <Button className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-xs" onClick={() => handleOAuthConnect(connector.id, connector.name)}>
                                        Proceed to Login
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-sm h-9"
                                    onClick={() => handleOAuthConnect(connector.id, connector.name)}
                                >
                                    <LinkIcon className="mr-2 h-3 w-3" /> Connect {connector.name}
                                </Button>
                            )}
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
