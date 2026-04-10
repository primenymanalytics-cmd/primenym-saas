import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbAdmin } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        if (!dbAdmin) {
            throw new Error("Firebase admin not initialized.");
        }

        const subDoc = await dbAdmin.collection('subscriptions').doc(userId).get();
        if (!subDoc.exists) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const data = subDoc.data();
        if (!data?.stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe Customer ID found' }, { status: 404 });
        }

        const origin = req.headers.get('origin') || 'https://www.primenym.com';

        const session = await stripe.billingPortal.sessions.create({
            customer: data.stripeCustomerId,
            return_url: `${origin}/dashboard`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Portal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
