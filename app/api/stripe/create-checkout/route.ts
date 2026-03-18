import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

const PRICE_IDS = {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { billing, seats, userId, userEmail } = body;

        if (!billing || !seats || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const priceId = billing === 'yearly' ? PRICE_IDS.yearly : PRICE_IDS.monthly;

        if (!priceId) {
            return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
        }

        const origin = req.headers.get('origin') || 'https://www.primenym.com';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{
                price: priceId,
                quantity: seats,
            }],
            customer_email: userEmail || undefined,
            metadata: {
                userId,
                seats: seats.toString(),
                billing,
            },
            subscription_data: {
                metadata: {
                    userId,
                    seats: seats.toString(),
                },
            },
            success_url: `${origin}/dashboard?checkout=success`,
            cancel_url: `${origin}/pricing?checkout=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
