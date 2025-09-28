import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', error);
    errorUrl.searchParams.set('message', errorDescription || 'Authentication failed');
    return NextResponse.redirect(errorUrl.toString());
  }

  if (!code) {
    console.error('No authorization code received');
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'missing_code');
    errorUrl.searchParams.set('message', 'No authorization code received');
    return NextResponse.redirect(errorUrl.toString());
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'session_exchange_failed');
      errorUrl.searchParams.set('message', error.message);
      return NextResponse.redirect(errorUrl.toString());
    }

    if (data.user) {
      // Try to create user profile if it doesn't exist (for email confirmation flow)
      try {
        await createUserProfile(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.name || data.user.email!.split('@')[0]
        );
      } catch (profileError) {
        console.log('Profile already exists or creation skipped:', profileError);
        // Don't fail the auth flow for profile creation errors
      }

      // Successful authentication - redirect to dashboard
      const successUrl = new URL(next, origin);
      successUrl.searchParams.set('message', 'Email confirmed successfully!');
      return NextResponse.redirect(successUrl.toString());
    }

    // No user data received
    console.error('No user data received after session exchange');
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'no_user_data');
    errorUrl.searchParams.set('message', 'Authentication failed - no user data received');
    return NextResponse.redirect(errorUrl.toString());

  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'unexpected_error');
    errorUrl.searchParams.set('message', 'An unexpected error occurred during authentication');
    return NextResponse.redirect(errorUrl.toString());
  }
}