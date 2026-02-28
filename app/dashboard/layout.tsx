"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, LayoutDashboard, Settings, LogOut, Key } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!user) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/30 p-4 hidden md:flex flex-col">
                <div className="space-y-4 flex-1">
                    <div className="py-2">
                        <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">
                            Dashboard
                        </h2>
                        <div className="space-y-1">
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link href="/dashboard">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Overview
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/dashboard/sources">
                                    <Key className="mr-2 h-4 w-4" />
                                    Data Sources
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start opacity-50 cursor-not-allowed">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t mt-auto">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/10">
                {children}
            </main>
        </div>
    )
}
