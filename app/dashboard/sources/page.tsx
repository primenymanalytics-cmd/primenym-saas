"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Trash2, Key, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type DataSource = {
    id: string;
    name: string;
    service: string;
    createdAt: any;
    status: 'active' | 'error';
}

export default function SourcesPage() {
    const { user } = useAuth()
    const [sources, setSources] = useState<DataSource[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSources() {
            if (!user || !db) return;

            try {
                const q = query(
                    collection(db, "sources"),
                    where("userId", "==", user.uid)
                );

                const querySnapshot = await getDocs(q);
                const fetchedSources: DataSource[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedSources.push({
                        id: doc.id,
                        name: data.name || 'Unnamed Source',
                        service: data.service || 'Unknown',
                        createdAt: data.createdAt,
                        status: data.status || 'active'
                    });
                });

                // Sort by newest first
                fetchedSources.sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                });

                setSources(fetchedSources);
            } catch (err: any) {
                console.error("Error fetching sources:", err);
                setError("Failed to load data sources. Are your Firestore rules configured correctly?");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchSources();
        }
    }, [user])

    const handleDelete = async (sourceId: string) => {
        if (!db || !user) return;

        if (!window.confirm("Are you sure you want to delete this source? This action cannot be undone and will break any Looker Studio reports using it.")) {
            return;
        }

        setDeletingId(sourceId);
        try {
            await deleteDoc(doc(db, "sources", sourceId));
            setSources(sources.filter(s => s.id !== sourceId));
        } catch (err: any) {
            console.error("Error deleting source:", err);
            alert("Failed to delete source.");
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your connected accounts and integrations.
                    </p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                    <Link href="/dashboard/sources/new"><Plus className="mr-2 h-4 w-4" /> Add New Source</Link>
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start text-sm">
                    <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {sources.length === 0 && !error ? (
                <Card className="border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <Database className="h-10 w-10 mb-4 text-slate-300 dark:text-slate-700" />
                        <h3 className="text-lg font-medium text-foreground">No data sources configured</h3>
                        <p className="text-sm mt-1 max-w-sm mb-6">
                            Connect your accounts securely via OAuth to use them across all your Looker Studio reports.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/dashboard/sources/new">Create Your First Source</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sources.map((source) => (
                        <Card key={source.id} className="relative overflow-hidden flex flex-col">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            {source.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center text-xs">
                                            <Key className="mr-1 h-3 w-3" />
                                            {source.service.charAt(0).toUpperCase() + source.service.slice(1)} OAuth
                                        </CardDescription>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${source.status === 'active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {source.status}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1">
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Source ID:</span>
                                        <span className="font-mono text-xs">{source.id.slice(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Added:</span>
                                        <span className="text-xs">
                                            {source.createdAt ? new Date(source.createdAt.toMillis()).toLocaleDateString() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0 mt-auto border-t bg-muted/10 flex justify-end gap-2">
                                {/* Future: Add Edit button here */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8"
                                    onClick={() => handleDelete(source.id)}
                                    disabled={deletingId === source.id}
                                >
                                    {deletingId === source.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <><Trash2 className="mr-2 h-3 w-3" /> Delete</>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
