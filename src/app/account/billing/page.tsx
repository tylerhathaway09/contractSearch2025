'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { STRIPE_CONFIG } from '@/lib/stripe';

export default function BillingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const isFreePlan = profile?.subscription_status === 'free';
  const isProPlan = profile?.subscription_status === 'pro';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your subscription and billing preferences</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold">
                      {isFreePlan ? 'Free Plan' : isProPlan ? 'Pro Plan' : 'Unknown'}
                    </h3>
                    <Badge variant={isProPlan ? 'default' : 'secondary'}>
                      {isFreePlan ? '$0/month' : isProPlan ? '$20/month' : 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">
                    {isFreePlan
                      ? '10 contract searches per month'
                      : isProPlan
                      ? 'Unlimited contract searches with premium features'
                      : 'Plan details unavailable'
                    }
                  </p>
                </div>
                {isProPlan && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next billing</p>
                    <p className="font-semibold">Coming soon</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile?.search_count || 0}</div>
                    <div className="text-sm text-gray-500">Searches Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-500">Saved Contracts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {isFreePlan ? Math.max(0, 10 - (profile?.search_count || 0)) : '∞'}
                    </div>
                    <div className="text-sm text-gray-500">Remaining This Month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade/Manage Options */}
          {isFreePlan && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>Unlock unlimited searches and premium features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    className="w-full"
                    onClick={() => window.open(STRIPE_CONFIG.PAYMENT_LINKS.PRO_MONTHLY, '_blank')}
                  >
                    Upgrade to Pro Monthly - $20/mo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(STRIPE_CONFIG.PAYMENT_LINKS.PRO_YEARLY, '_blank')}
                  >
                    Upgrade to Pro Yearly - $192/year
                    <Badge variant="secondary" className="ml-2">Save 20%</Badge>
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Pro Plan Benefits:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Unlimited contract searches</li>
                    <li>• Save & bookmark unlimited contracts</li>
                    <li>• Search history tracking</li>
                    <li>• Export search results</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {isProPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>Update your billing preferences and subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Billing Management</p>
                        <p className="text-sm text-gray-500">Update payment method, view invoices</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Plan Changes</p>
                        <p className="text-sm text-gray-500">Upgrade, downgrade, or cancel subscription</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Full subscription management features are coming soon.
                    For now, please contact support for billing changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past payments and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Billing history will appear here once payments are processed.</p>
                {isFreePlan && (
                  <p className="text-sm mt-2">Upgrade to Pro to start your billing history.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}