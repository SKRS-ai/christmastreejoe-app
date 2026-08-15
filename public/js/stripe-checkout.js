/**
 * Christmas Tree Joe — Master Stripe Payment Router & Express Checkout Engine
 * A Global Citizen Joe Enterprise (Global Citizen Joe, LLC.)
 */

// Publishable Key (Update with live key pk_live_... upon live launch)
export const STRIPE_PK = 'pk_test_YOUR_ACTUAL_KEY_HERE';
export const stripe = typeof Stripe !== 'undefined' ? Stripe(STRIPE_PK) : null;

/**
 * Master Stripe Direct Payment Links (4 Tiers x 3 Pricing Models)
 */
export const STRIPE_PAYMENT_LINKS = {
  // Tier 2: Evergreen Sprout (4–5 ft)
  sprout: {
    name: 'Evergreen Sprout (4–5 ft)',
    standard_1yr: 'https://buy.stripe.com/test_dRm3cx5M37Ke6UJgBs7IY00', // $149.99/yr
    lock_3yr:     'https://buy.stripe.com/test_28E3cx0rJ4y2frfdpg7IY01', // $127.49/yr (15% Off)
    one_off:      'https://buy.stripe.com/test_7sY3cxa2j3tY7YNetk7IY02'  // $169.99 Single Season
  },

  // Tier 1: Holiday Hearth (6–7 ft - Flagship)
  hearth: {
    name: 'Holiday Hearth (6–7 ft)',
    standard_1yr: 'https://buy.stripe.com/test_dRm6oJ2zR7Ke7YN2KC7IY03', // $209.99/yr
    lock_3yr:     'https://buy.stripe.com/test_fZu14p4HZ3tY2Et4SK7IY04', // $178.49/yr (15% Off)
    one_off:      'https://buy.stripe.com/test_4gM8wRb6nggK92Rbh87IY05'  // $239.99 Single Season
  },

  // Tier 3: Yuletide Monarch (8–9 ft)
  monarch: {
    name: 'Yuletide Monarch (8–9 ft)',
    standard_1yr: 'https://buy.stripe.com/test_fZu7sN4HZ4y26UJ70S7IY06', // $299.99/yr
    lock_3yr:     'https://buy.stripe.com/test_8x2fZj0rJfcG6UJ3OG7IY07', // $254.99/yr (15% Off)
    one_off:      'https://buy.stripe.com/test_dRm7sN7Ub5C692Rdpg7IY08'  // $339.99 Single Season
  },

  // Tier 4: Grand Estate (10–12 ft)
  estate: {
    name: 'Grand Estate (10–12 ft)',
    standard_1yr: 'https://buy.stripe.com/test_eVq14pdev1lQdj74SK7IY09', // $449.99/yr
    lock_3yr:     'https://buy.stripe.com/test_00w4gBfmD9Smdj770S7IY0a', // $382.49/yr (15% Off)
    one_off:      'https://buy.stripe.com/test_6oUeVf6Q7c0ugvjgBs7IY0b'  // $499.99 Single Season
  }
};

/**
 * Zero-Waste Recycled Marketplace Items (One-Offs)
 */
export const MARKETPLACE_LINKS = {
  mulch_2cuft:    'https://buy.stripe.com/test_YOUR_MULCH_LINK',       // $14.99
  essential_oil:  'https://buy.stripe.com/test_YOUR_OIL_LINK',         // $24.99
  biopellets_40lb:'https://buy.stripe.com/test_YOUR_BIOPELLETS_LINK',  // $18.50
  wreath_24in:    'https://buy.stripe.com/test_YOUR_WREATH_LINK'       // $49.99
};

/**
 * Resolves the destination Stripe URL based on the tier key and lock-in period
 * @param {string} tierKey - 'sprout', 'hearth', 'monarch', 'estate'
 * @param {number} termYears - 1, 2, 3, 5, 10
 * @param {boolean} isOneOff - true if single-season purchase
 * @param {string} customerEmail - Optional email to prefill in Stripe
 * @returns {string} Fully qualified Stripe Checkout Link
 */
export function getStripePaymentUrl(tierKey = 'hearth', termYears = 3, isOneOff = false, customerEmail = '') {
  const tier = STRIPE_PAYMENT_LINKS[tierKey] || STRIPE_PAYMENT_LINKS.hearth;
  let targetUrl = tier.lock_3yr; // Default to 3-Year Lock (Best Value)

  if (isOneOff) {
    targetUrl = tier.one_off;
  } else if (termYears === 1) {
    targetUrl = tier.standard_1yr;
  } else if (termYears >= 2) {
    targetUrl = tier.lock_3yr;
  }

  if (customerEmail && customerEmail.includes('@')) {
    targetUrl += `?prefilled_email=${encodeURIComponent(customerEmail)}`;
  }

  return targetUrl;
}

/**
 * Direct Instant Redirect Helper for Cart & Checkout Buttons
 */
export function redirectToStripeLink(tierKey, termYears, isOneOff = false, customerEmail = '') {
  const url = getStripePaymentUrl(tierKey, termYears, isOneOff, customerEmail);
  window.location.href = url;
}

/**
 * Legacy API Session Fallback (For Custom Backend API Tunnels)[cite: 6]
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
        successUrl: `${window.location.origin}/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout.html`
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
    window.location.href = 'order-success.html';
  }
}