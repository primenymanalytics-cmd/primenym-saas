"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, Search } from "lucide-react"
import { connectors } from "@/lib/connectors"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredConnectors = connectors.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Gradient map for cards
    const gradientMap: Record<string, string> = {
        shopify: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800",
        woocommerce: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800",
        "facebook-ads": "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800",
        "tiktok-ads": "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-gray-200 dark:border-gray-800",
        "google-ads": "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800",
        stripe: "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800",
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-10">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Premium Data Connectors for Looker Studio
                </h1>
                <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
                    Automate your marketing and e-commerce reporting instantly. Browse our marketplace of high-performance, enterprise-grade connectors to visualize your Shopify, Facebook Ads, and WooCommerce data in Google Looker Studio without writing any code.
                </p>

                <div className="relative w-full max-w-lg mt-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search connectors (e.g., Shopify, Ads...)"
                        className="pl-10 h-12 text-lg shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {filteredConnectors.map((connector) => (
                    <Card
                        key={connector.id}
                        className={cn(
                            "flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br",
                            gradientMap[connector.id] || "from-slate-50 to-gray-50"
                        )}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-12 w-12 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur flex items-center justify-center text-2xl shadow-sm">
                                    {connector.icon}
                                </div>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {connector.tags.slice(0, 2).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs bg-white/50 dark:bg-black/20 hover:bg-white/70">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <CardTitle className="text-lg font-bold">{connector.name}</CardTitle>
                            <CardDescription className="line-clamp-2 text-xs">
                                {connector.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-1.5">
                                {connector.features.slice(0, 3).map((feature) => (
                                    <div key={feature} className="flex items-center text-xs text-muted-foreground">
                                        <Check className="mr-2 h-3 w-3 text-green-600 dark:text-green-400" />
                                        {feature}
                                    </div>
                                ))}
                                {connector.features.length > 3 && (
                                    <div className="text-xs text-muted-foreground pl-5">
                                        + {connector.features.length - 3} more features
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 border-t border-black/5 dark:border-white/5 pt-4 bg-white/30 dark:bg-black/10">
                            <Link href={`/products/${connector.id}`} className="w-full">
                                <Button className="w-full bg-background/80 hover:bg-background text-foreground shadow-sm border border-input h-9 text-sm">
                                    Details <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredConnectors.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No connectors found matching "{searchQuery}"
                </div>
            )}
        </div>
    )
}
