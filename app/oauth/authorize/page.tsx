"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthorizeContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');

    const [isApproving, setIsApproving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // If not authenticated after loading, redirect to login
        if (!loading && !user) {
            const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?redirect=${currentUrl}`);
        }
    }, [user, loading, router]);

    if (!clientId || !redirectUri) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Invalid Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Missing required OAuth parameters. Please initiate the connection from Looker Studio.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const handleApprove = async () => {
        setIsApproving(true);
        setError('');

        try {
            // Get user's ID token to authenticate the API request
            const idToken = await user.getIdToken();

            const res = await fetch('/api/oauth/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    clientId,
                    redirectUri,
                    state
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to authorize');
            }

            const data = await res.json();

            // Redirect back to Looker Studio with the authorization code
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        } catch (err: any) {
            console.error('Authorization error:', err);
            setError(err.message || 'An error occurred during authorization.');
            setIsApproving(false);
        }
    };

    const handleDeny = () => {
        const url = new URL(redirectUri);
        url.searchParams.append('error', 'access_denied');
        if (state) {
            url.searchParams.append('state', state);
        }
        window.location.href = url.toString();
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Link href="/" className="mb-8 font-bold text-2xl tracking-tighter">
                Primenym Configuration
            </Link>

            <Card className="w-full max-w-md shadow-lg border-indigo-100 dark:border-indigo-900/50">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Authorize Access</CardTitle>
                        <CardDescription className="mt-2 text-sm">
                            <strong className="text-foreground">Looker Studio</strong> wants to access your Primenym data sources.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border text-sm text-muted-foreground space-y-2">
                        <p>This will allow Looker Studio to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>List your connected data sources</li>
                            <li>Fetch data from your sources for your reports</li>
                        </ul>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Signed in as <span className="font-semibold text-foreground">{user.email}</span>
                    </p>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
                        onClick={handleApprove}
                        disabled={isApproving}
                    >
                        {isApproving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving Request...
                            </>
                        ) : (
                            'Approve Access'
                        )}
                    </Button>
                    <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleDeny} disabled={isApproving}>
                        Deny
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
                By approving access, you agree to Primenym's Privacy Policy and Terms of Service.
            </p>
        </div>
    );
}

export default function AuthorizePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
            <AuthorizeContent />
        </Suspense>
    );
}
