"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Minus, Plus, Zap, Shield, BarChart3, Headphones, Cloud, Globe, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function PricingPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [isYearly, setIsYearly] = useState(false)
    const [seats, setSeats] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscribe = async () => {
        if (!user) {
            router.push('/login?redirect=/pricing')
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    billing: isYearly ? 'yearly' : 'monthly',
                    seats,
                    userId: user.uid,
                    userEmail: user.email,
                })
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert(data.error || 'Failed to create checkout session')
            }
        } catch (err) {
            console.error('Checkout error:', err)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const monthlyPrice = 9.90
    const yearlyPrice = 99.00
    const monthlyEquivalent = (yearlyPrice / 12).toFixed(2)
    const savingsPercent = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)

    const pricePerSeat = isYearly ? yearlyPrice : monthlyPrice
    const totalPrice = (pricePerSeat * seats).toFixed(2)

    const features = [
        { icon: Globe, text: "All Connectors (Shopify, WooCommerce, LinkedIn & more)" },
        { icon: BarChart3, text: "Unlimited Data Sources" },
        { icon: Zap, text: "Hourly Data Refreshes" },
        { icon: Cloud, text: "Cloud-Powered Data Processing" },
        { icon: Shield, text: "Enterprise-Grade Security" },
        { icon: Headphones, text: "Priority Support" },
    ]

    return (
        <div className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-6">
                    Simple pricing, no surprises
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                    One plan. Everything included.
                </h1>
                <p className="text-lg text-muted-foreground">
                    Pay per seat. Get access to every connector, every feature, no limits.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-10 gap-4">
                <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                </span>
                <button
                    onClick={() => setIsYearly(!isYearly)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isYearly ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    aria-label="Toggle billing period"
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
                <span className={`text-sm font-medium flex items-center gap-2 transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Yearly
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                        Save {savingsPercent}%
                    </span>
                </span>
            </div>

            {/* Pricing Card */}
            <Card className="relative overflow-hidden border-indigo-200 dark:border-indigo-800 shadow-2xl shadow-indigo-500/10 max-w-xl mx-auto">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                <CardHeader className="text-center pt-10 pb-6">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
                        Per seat
                    </p>

                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-extrabold tracking-tight">
                            ${isYearly ? monthlyEquivalent : monthlyPrice.toFixed(2)}
                        </span>
                        <span className="text-xl text-muted-foreground font-medium">/mo</span>
                    </div>

                    {isYearly && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Billed as <span className="font-semibold text-foreground">${yearlyPrice.toFixed(2)}</span>/seat/year
                        </p>
                    )}
                </CardHeader>

                <CardContent className="px-8 pb-4">
                    {/* Seat Selector */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border rounded-xl p-4 mb-8">
                        <div>
                            <p className="text-sm font-semibold">Number of seats</p>
                            <p className="text-xs text-muted-foreground">Each seat = 1 user account</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSeats(Math.max(1, seats - 1))}
                                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                disabled={seats <= 1}
                                aria-label="Decrease seats"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-bold w-8 text-center">{seats}</span>
                            <button
                                onClick={() => setSeats(seats + 1)}
                                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Increase seats"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-b pb-6 mb-6">
                        <span className="text-sm text-muted-foreground">
                            {seats} seat{seats > 1 ? 's' : ''} × ${isYearly ? monthlyEquivalent : monthlyPrice.toFixed(2)}/mo
                        </span>
                        <div className="text-right">
                            <p className="text-2xl font-bold">${totalPrice}<span className="text-sm font-normal text-muted-foreground">/{isYearly ? 'yr' : 'mo'}</span></p>
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                    <feature.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="text-sm">{feature.text}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="px-8 pb-10 pt-6">
                    <Button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting to checkout...</>
                        ) : (
                            'Subscribe Now'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Trust Section */}
            <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    14-day free trial · No credit card required · Cancel anytime
                </p>
            </div>

            {/* FAQ / Support */}
            <div className="mt-20 text-center">
                <h3 className="text-xl font-bold mb-3">Need a custom plan?</h3>
                <p className="text-muted-foreground mb-6">
                    For teams larger than 50 seats or specific requirements, we offer custom pricing.
                </p>
                <Button asChild variant="outline">
                    <Link href="/contact">Contact Sales</Link>
                </Button>
            </div>
        </div>
    )
}
