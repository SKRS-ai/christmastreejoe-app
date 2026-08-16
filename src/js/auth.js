/**
 * Christmas Tree Joe — Master Supabase Auth & Role-Router
 * Enterprise Gateway: Global Citizen Joe, LLC.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Live Supabase Project Credentials
export const SUPABASE_URL = 'https://pnosjdmolfqhuvvcncdh.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_VLFX6Kp_2DWYt5kLC00HkA_kxCJWON6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Register a new user with role metadata (Customer, Driver, or Vendor)
 */
export async function registerUser(email, password, fullName, role = 'customer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role // 'customer' | 'driver' | 'vendor'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in existing user and automatically route to appropriate dashboard
 */
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  await routeUserByRole(data.user);
  return data;
}

/**
 * Google 1-Click Fast Sign-In / Sign-Up
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/account.html`
    }
  });
  if (error) throw error;
}

/**
 * Inspects user role and redirects to matching portal
 */
export async function routeUserByRole(user) {
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || user.user_metadata?.role || 'customer';

  if (userRole === 'driver') {
    window.location.href = 'driver-hub.html';
  } else if (userRole === 'vendor') {
    window.location.href = 'vendor-hub.html';
  } else {
    window.location.href = 'account.html';
  }
}

/**
 * Auth Guard for Protected Pages (e.g., account.html, driver-hub.html)
 */
export async function requireAuth(expectedRole = null) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    window.location.href = 'account.html?auth=required';
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (expectedRole && profile?.role !== expectedRole) {
    alert(`Access Restricted: This page requires ${expectedRole} privileges.`);
    window.location.href = 'index.html';
    return null;
  }

  return { session, profile };
}

/**
 * Log Out
 */
export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}