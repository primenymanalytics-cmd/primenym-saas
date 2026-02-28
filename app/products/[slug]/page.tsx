import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Database, Gauge, Layers, Lock, Zap } from "lucide-react"
import { connectors } from "@/lib/connectors"
import { Metadata } from "next"

export async function generateStaticParams() {
    return connectors.map((connector) => ({
        slug: connector.id,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const slug = (await params).slug;
    const connector = connectors.find((c) => c.id === slug)

    if (!connector) {
        return { title: "Connector Not Found" }
    }

    return {
        title: `${connector.name} for Looker Studio | Primenym`,
        description: `Connect ${connector.name} to Looker Studio with Primenym. Visualize ${connector.features.join(", ")} instantly.`,
    }
}

export default async function ConnectorPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const connector = connectors.find((c) => c.id === slug)

    if (!connector) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen pb-20">
            {/* Hero */}
            <div className="bg-slate-50 dark:bg-slate-900/50 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground mb-8 hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Marketplace
                    </Link>
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-4xl border border-slate-200 dark:border-slate-700">
                            {connector.icon}
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap gap-2">
                                {connector.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">{connector.name}</h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">
                                {connector.description}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                                    Start Free Trial
                                </Button>
                                <Button variant="outline" size="lg">
                                    View Demo Report
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="container mx-auto px-4 md:px-6 py-16">
                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Left Column: Metrics & Dimensions */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Value Props */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Zap className="h-6 w-6 text-yellow-500" />
                                <h3 className="font-semibold">Real-time Data</h3>
                                <p className="text-sm text-muted-foreground">Data updates every 15 minutes automatically.</p>
                            </div>
                            <div className="space-y-2">
                                <Layers className="h-6 w-6 text-blue-500" />
                                <h3 className="font-semibold">Historical Data</h3>
                                <p className="text-sm text-muted-foreground">Pull up to 2 years of historical data instantly.</p>
                            </div>
                            <div className="space-y-2">
                                <Lock className="h-6 w-6 text-green-500" />
                                <h3 className="font-semibold">Bank-level Security</h3>
                                <p className="text-sm text-muted-foreground">Encrypted credentials and GDPR compliant.</p>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Gauge className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold">Metrics (Fields)</h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                All quantitative values you can measure and plot on charts.
                            </p>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {connector.metrics?.map((metric) => (
                                    <div key={metric} className="flex items-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-green-500 mr-3" />
                                        <span className="font-medium">{metric}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Database className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold">Dimensions (Breakdowns)</h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Attributes you can use to slice and dice your data.
                            </p>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {connector.dimensions?.map((dim) => (
                                    <div key={dim} className="flex items-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                                        <span className="font-medium">{dim}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Sticky CTA */}
                    <div className="space-y-8">
                        <div className="rounded-xl border bg-card text-card-foreground shadow sticky top-24">
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-6">Get Access</h3>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        <span>7-day free trial</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        <span>Cancel anytime</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        <span>Priority support</span>
                                    </div>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                                    Get Started
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Secure payment via Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
