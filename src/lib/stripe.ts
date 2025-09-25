import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  created: number;
}

export async function createStripeCustomer({
  email,
  name,
  metadata = {}
}: CreateCustomerParams): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      created: customer.created
    };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

export async function createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

export function getSubscriptionTierFromPriceId(priceId: string): 'free' | 'pro' {
  switch (priceId) {
    case STRIPE_CONFIG.PRICE_IDS.PRO_MONTHLY:
    case STRIPE_CONFIG.PRICE_IDS.PRO_YEARLY:
      return 'pro';
    default:
      return 'free';
  }
}

export function validateStripeWebhook(body: string, signature: string, secret: string): boolean {
  try {
    stripe.webhooks.constructEvent(body, signature, secret);
    return true;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return false;
  }
}

// Configuration constants - LIVE MODE
export const STRIPE_CONFIG = {
  PRICE_IDS: {
    PRO_MONTHLY: 'price_1SB5Y8I8PNaNPVmz4WzNzujr',
    PRO_YEARLY: 'price_1SB5Y7I8PNaNPVmz5GCOeIEm'
  },
  PRODUCT_IDS: {
    PRO: 'prod_T7KCNAFRcv4xMS'
  },
  PAYMENT_LINKS: {
    PRO_MONTHLY: 'https://buy.stripe.com/8x2aEX108g2m7Ge6SN5wI02',
    PRO_YEARLY: 'https://buy.stripe.com/7sY28raAIeYigcK1yt5wI03'
  }
} as const;