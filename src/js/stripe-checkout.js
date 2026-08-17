/**
 * Christmas Tree Joe — Master Stripe Payment Router & Express Checkout Engine
 * A Global Citizen Joe Enterprise (Global Citizen Joe, LLC.)
 */

// Replace with your live publishable key (pk_live_...) when switching from sandbox to live mode
export const STRIPE_PK = 'pk_live_YOUR_ACTUAL_KEY_HERE';
export const stripe = typeof Stripe !== 'undefined' ? Stripe(STRIPE_PK) : null;

/**
 * Exact Verified Stripe Payment Links (4 Tree Tiers x 3 Pricing Models)
 */
export const STRIPE_PAYMENT_LINKS = {
  // Tier 2: Evergreen Sprout (4–5 ft)
  sprout: {
    name: 'Evergreen Sprout (4–5 ft)',
    standard_1yr: 'https://buy.stripe.com/test_fZu7sN4HZ4y26UJ70S7IY06', // $149.99 USD / year
    lock_3yr:     'https://buy.stripe.com/test_8x2fZj0rJfcG6UJ3OG7IY07', // $127.49 USD / year (15% Off)
    one_off:      'https://buy.stripe.com/test_dRm7sN7Ub5C692Rdpg7IY08'  // $169.99 USD Single Season
  },

  // Tier 1: Holiday Hearth (6–7 ft - Flagship)
  hearth: {
    name: 'Holiday Hearth (6–7 ft)',
    standard_1yr: 'https://buy.stripe.com/test_eVq14pdev1lQdj74SK7IY09', // $209.99 USD / year
    lock_3yr:     'https://buy.stripe.com/test_00w4gBfmD9Smdj770S7IY0a', // $178.49 USD / year (15% Off)
    one_off:      'https://buy.stripe.com/test_6oUeVf6Q7c0ugvjgBs7IY0b'  // $239.99 USD Single Season
  },

  // Tier 3: Yuletide Monarch (8–9 ft)
  monarch: {
    name: 'Yuletide Monarch (8–9 ft)',
    standard_1yr: 'https://buy.stripe.com/test_dRm6oJ2zR7Ke7YN2KC7IY03', // $299.99 USD / year
    lock_3yr:     'https://buy.stripe.com/test_fZu14p4HZ3tY2Et4SK7IY04', // $254.99 USD / year (15% Off)
    one_off:      'https://buy.stripe.com/test_4gM8wRb6nggK92Rbh87IY05'  // $339.99 USD Single Season
  },

  // Tier 4: Grand Estate (10–12 ft)
  estate: {
    name: 'Grand Estate (10–12 ft)',
    standard_1yr: 'https://buy.stripe.com/test_dRm3cx5M37Ke6UJgBs7IY00', // $449.99 USD / year
    lock_3yr:     'https://buy.stripe.com/test_7sY3cxa2j3tY7YNetk7IY02', // $382.49 USD / year (15% Off)
    one_off:      'https://buy.stripe.com/test_28E3cx0rJ4y2frfdpg7IY01'  // $382.49 USD Alternate / Single Season
  }
};

/**
 * Resolves the destination Stripe URL based on the tier key and lock-in period
 * @param {string} tierKey - 'sprout', 'hearth', 'monarch', 'estate'
 * @param {number} termYears - 0 (one-off), 1 (standard), 2, 3+ (locked)
 * @param {boolean} isOneOff - true if single-season non-renewing purchase
 * @param {string} customerEmail - Optional email to prefill in Stripe
 * @returns {string} Fully qualified Stripe Checkout Link
 */
export function getStripePaymentUrl(tierKey = 'hearth', termYears = 3, isOneOff = false, customerEmail = '') {
  const tier = STRIPE_PAYMENT_LINKS[tierKey] || STRIPE_PAYMENT_LINKS.hearth;
  let targetUrl = tier.lock_3yr;

  if (isOneOff || termYears === 0) {
    targetUrl = tier.one_off;
  } else if (termYears === 1) {
    targetUrl = tier.standard_1yr;
  } else if (termYears >= 2) {
    targetUrl = tier.lock_3yr;
  }

  if (customerEmail && customerEmail.includes('@')) {
    const urlObj = new URL(targetUrl);
    urlObj.searchParams.set('prefilled_email', customerEmail);
    return urlObj.toString();
  }

  return targetUrl;
}

/**
 * Direct Instant Redirect Helper for Cart & Checkout Buttons
 */
export function redirectToStripeLink(tierKey, termYears = 3, isOneOff = false, customerEmail = '') {
  const url = getStripePaymentUrl(tierKey, termYears, isOneOff, customerEmail);
  window.location.href = url;
}

/**
 * Unified checkout initiator exposed to HTML inline onclick attributes
 */
export function initiateStripeCheckout(tierKey = 'hearth', termYears = 3, isOneOff = false) {
  // Grab active email from memory or localStorage if available
  const activeUserEmail = window.userEmail || localStorage.getItem('user_email') || '';
  redirectToStripeLink(tierKey, termYears, isOneOff, activeUserEmail);
}

window.initiateStripeCheckout = initiateStripeCheckout;
window.redirectToStripeLink = redirectToStripeLink;
window.getStripePaymentUrl = getStripePaymentUrl;

/**
 * Custom Backend API Tunnel Fallback
 */
export async function redirectToCheckout(priceId, customerEmail = '') {
  if (!stripe) {
    console.warn('Stripe.js SDK not detected. Directing to standard checkout page.');
    window.location.href = 'checkout.html';
    return;
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: priceId,
        customerEmail: customerEmail,
        successUrl: `${window.location.origin}/account.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/trees.html?payment=cancelled`
      })
    });

    const session = await response.json();
    if (session.url) {
      window.location.href = session.url;
    } else if (session.id) {
      await stripe.redirectToCheckout({ sessionId: session.id });
    }
  } catch (err) {
    console.warn('Checkout tunnel routing fallback:', err);
    window.location.href = 'account.html?payment=fallback';
  }
}