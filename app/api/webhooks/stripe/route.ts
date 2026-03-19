import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    if (!dbAdmin) {
        console.error('Firebase Admin not initialized in Stripe webhook');
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (userId && session.subscription) {
                    // Fetch the full subscription to get details
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    const seats = parseInt(session.metadata?.seats || '1');
                    const item = subscription.items.data[0];
                    const isYearly = item?.price?.recurring?.interval === 'year';

                    await dbAdmin.collection('subscriptions').doc(userId).set({
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: subscription.id,
                        plan: 'standard',
                        billing: isYearly ? 'yearly' : 'monthly',
                        status: 'active',
                        seats,
                        connectors: ['shopify', 'woocommerce', 'linkedin'],
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log(`Subscription created for user ${userId}: ${subscription.id}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    const item = subscription.items.data[0];
                    const seats = item?.quantity || 1;
                    const isYearly = item?.price?.recurring?.interval === 'year';

                    await dbAdmin.collection('subscriptions').doc(userId).update({
                        status: subscription.status === 'active' ? 'active' : 'expired',
                        billing: isYearly ? 'yearly' : 'monthly',
                        seats,
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log(`Subscription updated for user ${userId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await dbAdmin.collection('subscriptions').doc(userId).update({
                        status: 'expired',
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log(`Subscription cancelled for user ${userId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
