import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateStripeWebhook } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('No webhook secret configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!validateStripeWebhook(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the verified event
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON received:', err);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Received Stripe webhook:', event.type, event.id);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Record<string, unknown>) {
  console.log('Processing subscription created:', subscription.id);

  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Determine subscription status based on Stripe price ID
    let subscriptionStatus = 'free';
    if (subscription.items?.data?.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      // Live price IDs for Pro tier
      if (priceId === 'price_1SB5Y8I8PNaNPVmz4WzNzujr' || priceId === 'price_1SB5Y7I8PNaNPVmz5GCOeIEm') {
        subscriptionStatus = 'pro';
      }
    }

    // Update user record with subscription info
    const { error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: subscriptionStatus,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Failed to update user subscription:', error);
    } else {
      console.log('Successfully updated user subscription');
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  console.log('Processing subscription updated:', subscription.id);

  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Determine subscription status
    let subscriptionStatus = 'free';
    if (subscription.status === 'active' && subscription.items?.data?.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      // Live price IDs for Pro tier
      if (priceId === 'price_1SB5Y8I8PNaNPVmz4WzNzujr' || priceId === 'price_1SB5Y7I8PNaNPVmz5GCOeIEm') {
        subscriptionStatus = 'pro';
      }
    }

    const { error } = await supabase
      .from('users')
      .update({
        stripe_subscription_id: subscriptionId,
        subscription_status: subscriptionStatus,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Failed to update user subscription:', error);
    } else {
      console.log('Successfully updated user subscription');
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Record<string, unknown>) {
  console.log('Processing subscription deleted:', subscription.id);

  try {
    const customerId = subscription.customer;

    const { error } = await supabase
      .from('users')
      .update({
        stripe_subscription_id: null,
        subscription_status: 'free',
        current_period_end: null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Failed to update user subscription:', error);
    } else {
      console.log('Successfully cancelled user subscription');
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Record<string, unknown>) {
  console.log('Processing payment succeeded:', invoice.id);

  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    // Update the subscription period end date
    if (subscriptionId) {
      const { error } = await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Failed to update user on payment success:', error);
      } else {
        console.log('Successfully processed payment success');
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Record<string, unknown>) {
  console.log('Processing payment failed:', invoice.id);

  try {
    const customerId = invoice.customer;

    // For now, just log payment failures
    // In production, you might want to send emails or update subscription status
    console.log(`Payment failed for customer ${customerId}`);

    // You could add logic here to:
    // - Send notification emails
    // - Update subscription status after grace period
    // - Log payment failure events
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}