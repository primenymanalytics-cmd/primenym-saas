"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Link as LinkIcon, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardPage() {
    const { user } = useAuth()
    const [sourceCount, setSourceCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [subscription, setSubscription] = useState<any>(null)

    useEffect(() => {
        async function fetchStats() {
            if (!user || !db) return;
            try {
                // Fetch active sources
                const q = query(collection(db, "sources"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                setSourceCount(querySnapshot.size);

                // Fetch subscription
                const subRef = doc(db, "subscriptions", user.uid);
                const subSnap = await getDoc(subRef);
                if (subSnap.exists()) {
                    setSubscription(subSnap.data());
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setSourceCount(0);
            } finally {
                setLoading(false);
            }
        }

        if (user) fetchStats()
    }, [user])

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your Looker Studio connectors and data sources here.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Connectors</CardTitle>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : sourceCount || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Linked Looker Studio reports</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : sourceCount || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Configured API keys/tokens</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex h-10 items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : subscription?.status === 'active' ? (
                            <>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                                    Active ({subscription.seats} Seats)
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Seats available: <span className="font-medium text-foreground">{Math.max(0, subscription.seats - (sourceCount || 0))}</span> left
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">Free Tier</div>
                                <p className="text-xs text-muted-foreground mt-1">Upgrade to unlock connectors</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Data Sources</h2>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/dashboard/sources/new"><Plus className="mr-2 h-4 w-4" /> Add Source</Link>
                    </Button>
                </div>

                {sourceCount === 0 || sourceCount === null ? (
                    <Card className="border-dashed border-2 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Database className="h-10 w-10 mb-4 text-slate-300 dark:text-slate-700" />
                            <p className="font-medium text-foreground">No data sources configured</p>
                            <p className="text-sm mt-1 max-w-sm">Securely store your API keys and access tokens here to use them across all your Looker Studio reports.</p>
                            <Button asChild variant="outline" className="mt-6">
                                <Link href="/dashboard/sources/new">Create Your First Source</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-none border bg-muted/30">
                        <CardContent className="py-8 text-center">
                            <h3 className="text-lg font-medium mb-2">You have {sourceCount} active data sources</h3>
                            <Button asChild variant="outline" className="mt-2">
                                <Link href="/dashboard/sources">Manage Sources</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
