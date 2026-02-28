import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Data Connectors Marketplace | Primenym Looker Studio Integrations",
    description: "Browse our premium marketplace of advanced data connectors for Google Looker Studio. Integrate Shopify, WooCommerce, Facebook Ads, Stripe, and more directly into your dashboards.",
    keywords: ["Looker Studio Connectors", "Google Data Studio Integrations", "marketing dashboards", "ecommerce analytics", "Shopify tracking", "automated reporting", "data visualization", "API connectors"]
}

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
