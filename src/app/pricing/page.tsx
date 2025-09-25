'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { STRIPE_CONFIG } from '@/lib/stripe';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleStripeRedirect = (planType: string, url: string) => {
    setIsLoading(planType);
    window.open(url, '_blank');
    setTimeout(() => setIsLoading(null), 2000);
  };

  const features = {
    free: [
      '10 contract searches per month',
      'Access to all contract sources',
      'Advanced search filters',
      'Contract details view',
      'Basic support'
    ],
    pro: [
      'Unlimited contract searches',
      'Save & bookmark contracts',
      'Search history tracking',
      'Export search results',
      'Priority support',
      'Advanced analytics',
      'Email alerts for new contracts'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect plan for your contract search needs. Upgrade anytime to unlock more features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {profile?.subscription_status === 'free' ? (
                <div className="space-y-2 mt-6">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Current Plan - Free Active
                  </Badge>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">View Usage & Upgrade</Link>
                  </Button>
                </div>
              ) : user ? (
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link href="/dashboard">Switch to Free Plan</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-blue-200 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-600">Pro</CardTitle>
              <CardDescription>For power users and businesses</CardDescription>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <div>
                    <span className="text-4xl font-bold">$20</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    or <strong>$16/mo</strong> yearly
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="space-y-2 mt-6">
                {profile?.subscription_status === 'pro' ? (
                  <div className="space-y-2">
                    <Badge className="w-full justify-center bg-blue-600 text-white py-2">
                      Current Plan - Pro Active
                    </Badge>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard">Manage Subscription</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading === 'monthly'}
                      onClick={() => handleStripeRedirect('monthly', STRIPE_CONFIG.PAYMENT_LINKS.PRO_MONTHLY)}
                    >
                      {isLoading === 'monthly' ? 'Redirecting...' : 'Start Pro Monthly - $20/mo'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      disabled={isLoading === 'yearly'}
                      onClick={() => handleStripeRedirect('yearly', STRIPE_CONFIG.PAYMENT_LINKS.PRO_YEARLY)}
                    >
                      {isLoading === 'yearly' ? 'Redirecting...' : (
                        <>
                          Start Pro Yearly - $192/year
                          <Badge variant="secondary" className="ml-2">Save 20%</Badge>
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto text-left space-y-4">
            <div>
              <h4 className="font-semibold">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold">What happens to my saved contracts if I downgrade?</h4>
              <p className="text-gray-600">Your saved contracts are preserved, but you won&apos;t be able to add new ones or access existing ones until you upgrade again.</p>
            </div>
            <div>
              <h4 className="font-semibold">Do you offer refunds?</h4>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee for all subscriptions.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help choosing? <Link href="/contact" className="text-blue-600 hover:underline">Contact our team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}