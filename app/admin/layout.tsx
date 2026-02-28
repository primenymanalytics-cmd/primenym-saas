"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, ShieldCheck, Users, Database, MessageSquare, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [verifying, setVerifying] = useState(true)

    useEffect(() => {
        async function checkAdminStatus() {
            if (!user || !db) {
                setVerifying(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().role === "admin") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error("Error checking admin status:", err)
                setIsAdmin(false);
            } finally {
                setVerifying(false);
            }
        }

        if (!loading) {
            if (!user) {
                router.push("/login")
            } else {
                checkAdminStatus()
            }
        }
    }, [user, loading, router])

    if (loading || verifying) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!user || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
                <ShieldCheck className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    You do not have administrative privileges to view this page. If you believe this is an error, please contact support.
                </p>
                <div className="flex gap-4 mt-8">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r bg-slate-950 text-slate-300 p-4 hidden md:flex flex-col">
                <div className="space-y-4 flex-1">
                    <div className="py-2">
                        <div className="flex items-center gap-2 mb-6 px-2 text-white">
                            <ShieldCheck className="h-6 w-6 text-indigo-400" />
                            <h2 className="text-lg font-semibold tracking-tight">
                                Admin Console
                            </h2>
                        </div>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start text-white bg-white/10" asChild>
                                <Link href="/admin">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Overview
                                </Link>
                            </Button>
                            {/* In a larger app, these would be separate routes */}
                            <Button variant="ghost" className="w-full justify-start hover:bg-white/10 hover:text-white" asChild>
                                <Link href="/admin#users">
                                    <Users className="mr-2 h-4 w-4" />
                                    Users
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start hover:bg-white/10 hover:text-white" asChild>
                                <Link href="/admin#sources">
                                    <Database className="mr-2 h-4 w-4" />
                                    Sources
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start hover:bg-white/10 hover:text-white" asChild>
                                <Link href="/admin#messages">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Messages
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-800 mt-auto">
                    <Button variant="ghost" className="w-full justify-start text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50" asChild>
                        <Link href="/dashboard">
                            <LogOut className="mr-2 h-4 w-4" />
                            Exit Admin
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-slate-900">
                {children}
            </main>
        </div>
    )
}
