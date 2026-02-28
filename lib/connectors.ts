export interface Connector {
    id: string
    name: string
    description: string
    tags: string[]
    price: string
    features: string[]
    icon: string
    metrics?: string[]
    dimensions?: string[]
}

export const connectors: Connector[] = [
    {
        id: "shopify",
        name: "Shopify Connector",
        description: "Visualize total sales, orders, and customer data directly in Looker Studio.",
        tags: ["E-commerce", "Popular"],
        price: "$15/mo",
        features: ["Orders", "Products", "Customers", "Inventory Levels"],
        icon: "🛍️",
        metrics: ["Total Sales", "Net Sales", "Orders Count", "Average Order Value", "Refund Amount"],
        dimensions: ["Date", "Product Name", "SKU", "Customer City", "Traffic Source"]
    },
    {
        id: "woocommerce",
        name: "WooCommerce Connector",
        description: "Complete reporting for your WooCommerce store. Track revenue, taxes, and shipping.",
        tags: ["E-commerce"],
        price: "$15/mo",
        features: ["Sales Reports", "Coupons", "Refunds", "Customer value"],
        icon: "🛒",
        metrics: ["Gross Sales", "Net Sales", "Total Orders", "Total Tax", "Shipping Total"],
        dimensions: ["Order Date", "Product Title", "Category", "Billing Country", "Coupon Code"]
    },
    {
        id: "facebook-ads",
        name: "Facebook Ads",
        description: "Granular ad performance metrics. Campaign, Ad Set, and Ad level data.",
        tags: ["Marketing", "Ads"],
        price: "$19/mo",
        features: ["Spend", "Impressions", "Clicks", "CTR", "CPC"],
        icon: "📘",
        metrics: ["Amount Spent", "Impressions", "Clicks", "CTR", "CPC", "CPM", "Reach", "Frequency"],
        dimensions: ["Date", "Campaign Name", "Ad Set Name", "Ad Name", "Publisher Platform"]
    },
    {
        id: "tiktok-ads",
        name: "TikTok Ads",
        description: "Unlock insights from your TikTok campaigns. Creative performance analysis.",
        tags: ["Marketing", "Ads", "New"],
        price: "$19/mo",
        features: ["Video Views", "Likes", "Shares", "Conversions"],
        icon: "🎵",
        metrics: ["Cost", "Impressions", "Clicks", "Conversions", "CPA", "CVR", "Video Views", "Likes"],
        dimensions: ["Stat Time Day", "Campaign Name", "Ad Group Name", "Ad Name", "Creative Material"]
    },
    {
        id: "google-ads",
        name: "Google Ads",
        description: "Advanced Google Ads reporting. Quality Score, Search Terms, and more.",
        tags: ["Marketing", "Ads"],
        price: "$19/mo",
        features: ["Search Keywords", "Display Placements", "Video Performance"],
        icon: "🔍",
        metrics: ["Cost", "Impressions", "Clicks", "Conversions", "Phone Calls", "View-Through Conv."],
        dimensions: ["Date", "Campaign", "Ad Group", "Keyword", "Search Term", "Device"]
    },
    {
        id: "stripe",
        name: "Stripe Analytics",
        description: "Financial reporting for SaaS and E-commerce. MRR, Churn, and LTV.",
        tags: ["Finance"],
        price: "$29/mo",
        features: ["Revenue", "Disputes", "Payouts", "Balance Transactions"],
        icon: "💳",
        metrics: ["Gross Volume", "Net Volume", "New Customers", "Churn Rate", "MRR"],
        dimensions: ["Date", "Customer ID", "Product Name", "Plan Interval", "Country"]
    }
]
