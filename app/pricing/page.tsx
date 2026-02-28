"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false)

    const plans = [
        {
            name: "Starter",
            description: "Perfect for individuals and small projects.",
            price: isYearly ? "$99" : "$19",
            duration: isYearly ? "/year" : "/month",
            features: [
                "1 Active Connector",
                "Up to 3 Data Sources",
                "Standard Support",
                "Daily Data Refreshes",
            ],
            notIncluded: [
                "Premium Connectors",
                "Custom API Integrations",
                "Priority Support",
            ],
            buttonText: "Get Started",
            href: "/signup",
            popular: false
        },
        {
            name: "Pro",
            description: "Ideal for agencies and growing businesses.",
            price: isYearly ? "$299" : "$49",
            duration: isYearly ? "/year" : "/month",
            features: [
                "5 Active Connectors",
                "Unlimited Data Sources",
                "Priority Email Support",
                "Hourly Data Refreshes",
                "Premium Connectors Access",
            ],
            notIncluded: [
                "Custom API Integrations",
                "White-labeling",
            ],
            buttonText: "Start Free Trial",
            href: "/signup",
            popular: true
        },
        {
            name: "Enterprise",
            description: "Advanced features for large organizations.",
            price: "Custom",
            duration: "",
            features: [
                "Unlimited Connectors",
                "Unlimited Data Sources",
                "24/7 Dedicated Support",
                "Real-time Data Refreshes",
                "Premium Connectors Access",
                "Custom API Integrations",
                "White-labeling",
            ],
            notIncluded: [],
            buttonText: "Contact Sales",
            href: "/contact",
            popular: false
        }
    ]

    return (
        <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-muted-foreground">
                    Choose the plan that best fits your data pipeline needs.
                </p>

                <div className="flex items-center justify-center mt-8 gap-3">
                    <span className={`text-sm ${!isYearly ? 'font-bold' : 'text-muted-foreground'}`}>Monthly</span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isYearly ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <span className="sr-only">Toggle billing period</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                    <span className={`text-sm flex items-center gap-1 ${isYearly ? 'font-bold' : 'text-muted-foreground'}`}>
                        Yearly <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Save 20%</span>
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-indigo-600 shadow-xl md:scale-105 z-10' : 'border-border'}`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-0 right-0 mx-auto w-32 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider text-center py-1 rounded-full">
                                Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                                {plan.price}
                                <span className="ml-1 text-xl font-medium text-muted-foreground">{plan.duration}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="h-5 w-5 text-indigo-600 shrink-0 mr-3" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <li key={i} className="flex items-start opacity-50">
                                        <X className="h-5 w-5 text-muted-foreground shrink-0 mr-3" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                                <Link href={plan.href}>{plan.buttonText}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-20 text-center">
                <h3 className="text-xl font-bold mb-4">Have questions?</h3>
                <p className="text-muted-foreground mb-6">Can't find the right plan? Our team can help determine the best fit for your business.</p>
                <Button asChild variant="secondary">
                    <Link href="/contact">Contact Support</Link>
                </Button>
            </div>
        </div>
    )
}
