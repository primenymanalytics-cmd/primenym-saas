const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = process.env.CLOUD_RUN_API_KEY;
const PORT = process.env.PORT || 8080;

// ── Auth middleware ──────────────────────────────────────────────
function authenticateRequest(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!API_KEY || key !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
    next();
}

app.use(authenticateRequest);

// ── Shopify pagination helper ───────────────────────────────────
async function fetchAllOrders(shopUrl, accessToken, startDate, endDate) {
    const allOrders = [];
    const limit = 250; // Shopify max per page
    let url = `https://${shopUrl}/admin/api/2024-01/orders.json?status=any&limit=${limit}`;

    if (startDate && endDate) {
        const formatDate = (d, isEnd) => {
            if (d.length === 8) {
                const y = d.slice(0, 4), m = d.slice(4, 6), day = d.slice(6, 8);
                return isEnd ? `${y}-${m}-${day}T23:59:59Z` : `${y}-${m}-${day}T00:00:00Z`;
            }
            return d;
        };
        url += `&created_at_min=${formatDate(startDate, false)}`;
        url += `&created_at_max=${formatDate(endDate, true)}`;
    }

    let pageCount = 0;
    const MAX_PAGES = 100; // Safety limit

    while (url && pageCount < MAX_PAGES) {
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Shopify API Error (page ${pageCount}):`, errorText);
            throw new Error(`Shopify API returned ${response.status}`);
        }

        const data = await response.json();
        allOrders.push(...(data.orders || []));
        pageCount++;

        // Follow pagination via Link header
        const linkHeader = response.headers.get('link');
        url = null;
        if (linkHeader) {
            const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
            if (nextMatch) {
                url = nextMatch[1];
            }
        }
    }

    console.log(`Fetched ${allOrders.length} orders across ${pageCount} pages`);
    return allOrders;
}

// ── Main endpoint ───────────────────────────────────────────────
app.post('/fetch-orders', async (req, res) => {
    try {
        const { shopUrl, shopifyAccessToken, startDate, endDate } = req.body;

        if (!shopUrl || !shopifyAccessToken) {
            return res.status(400).json({ error: 'Missing shopUrl or shopifyAccessToken' });
        }

        const orders = await fetchAllOrders(shopUrl, shopifyAccessToken, startDate, endDate);

        res.json({ success: true, orders, totalOrders: orders.length });
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
});

// ── Health check ────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'shopify-data-service' });
});

app.listen(PORT, () => {
    console.log(`Shopify Data Service running on port ${PORT}`);
});
