"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Users, Database, MessageSquare, AlertCircle, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboardPage() {
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [users, setUsers] = useState<any[]>([])
    const [sources, setSources] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])

    useEffect(() => {
        async function fetchAdminData() {
            if (!user || !db) return;

            try {
                // Fetch Users
                const usersSnapshot = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50)));
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersList);

                // Fetch Sources
                const sourcesSnapshot = await getDocs(query(collection(db, "sources"), orderBy("createdAt", "desc"), limit(50)));
                const sourcesList = sourcesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSources(sourcesList);

                // Fetch Messages
                const messagesSnapshot = await getDocs(query(collection(db, "contact_messages"), orderBy("createdAt", "desc"), limit(50)));
                const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(messagesList);

            } catch (err: any) {
                console.error("Error fetching admin data:", err);
                setError(err.message || "Failed to load admin data. Ensure your account has admin privileges and Firestore rules are deployed.");
            } finally {
                setLoading(false);
            }
        }

        fetchAdminData()
    }, [user])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
                <p className="text-muted-foreground">Loading admin data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-muted-foreground mt-1">
                    Manage users, monitor connections, and answer support messages.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start text-sm">
                    <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Data Sources</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sources.length}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{messages.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="bg-muted/50 border">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="sources">Data Sources</TabsTrigger>
                    <TabsTrigger value="messages">Contact Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Users</CardTitle>
                            <CardDescription>
                                A list of all users who have created an account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.name || 'N/A'}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-indigo-600' : ''}>
                                                    {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : null}
                                                    {u.role || 'user'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sources" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Data Sources</CardTitle>
                            <CardDescription>
                                Overview of all connected third-party integrations across all users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Source Name</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sources.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell className="capitalize">{s.service}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{s.userId}</TableCell>
                                            <TableCell>
                                                <Badge variant={s.status === 'active' ? 'default' : 'destructive'} className={s.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                    {s.status || 'unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sources.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No data sources configured yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="messages" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Form Messages</CardTitle>
                            <CardDescription>
                                Inquiries submitted through the website contact form.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {messages.map((m) => (
                                    <div key={m.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between border-b pb-3">
                                            <div>
                                                <h3 className="font-semibold text-lg">{m.subject}</h3>
                                                <div className="text-sm text-muted-foreground flex gap-2">
                                                    <span className="font-medium text-foreground">{m.name}</span>
                                                    <span>&middot;</span>
                                                    <a href={`mailto:${m.email}`} className="text-indigo-600 hover:underline">{m.email}</a>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                {m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}
                                            </div>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                                    </div>
                                ))}
                                {messages.length === 0 && (
                                    <div className="text-center border rounded-lg py-12 text-muted-foreground">
                                        No contact messages received yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
