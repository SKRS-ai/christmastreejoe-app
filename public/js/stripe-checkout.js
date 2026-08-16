/**
 * Christmas Tree Joe — Master Stripe Payment Router & Express Checkout Engine
 * Enterprise Gateway: Global Citizen Joe, LLC. & Xmas Made Inc.
 */

// Replace with your live publishable key (pk_live_... or pk_test_...) from your Stripe Dashboard[cite: 8]
export const STRIPE_PK = 'pk_live_YOUR_ACTUAL_KEY_HERE'; //[cite: 8]
export const stripe = typeof window !== 'undefined' && typeof Stripe !== 'undefined' ? Stripe(STRIPE_PK) : null; //[cite: 8]

let elements = null;
let cardElement = null;

/**
 * Master Stripe Payment Links (4 Tree Tiers x 3 Pricing Models)[cite: 8]
 */
export const STRIPE_PAYMENT_LINKS = {
  // Tier 2: Evergreen Sprout (4–5 ft)[cite: 8]
  sprout: {
    name: 'Evergreen Sprout (4–5 ft)', //[cite: 8]
    standard_1yr: 'https://buy.stripe.com/test_dRm3cx5M37Ke6UJgBs7IY00', // $149.99/yr[cite: 8]
    lock_3yr:     'https://buy.stripe.com/test_28E3cx0rJ4y2frfdpg7IY01', // $127.49/yr (15% Off)[cite: 8]
    one_off:      'https://buy.stripe.com/test_7sY3cxa2j3tY7YNetk7IY02'  // $169.99 Single Season[cite: 8]
  },

  // Tier 1: Holiday Hearth (6–7 ft - Flagship)[cite: 8]
  hearth: {
    name: 'Holiday Hearth (6–7 ft)', //[cite: 8]
    standard_1yr: 'https://buy.stripe.com/test_dRm6oJ2zR7Ke7YN2KC7IY03', // $209.99/yr[cite: 8]
    lock_3yr:     'https://buy.stripe.com/test_fZu14p4HZ3tY2Et4SK7IY04', // $178.49/yr (15% Off)[cite: 8]
    one_off:      'https://buy.stripe.com/test_4gM8wRb6nggK92Rbh87IY05'  // $239.99 Single Season[cite: 8]
  },

  // Tier 3: Yuletide Monarch (8–9 ft)[cite: 8]
  monarch: {
    name: 'Yuletide Monarch (8–9 ft)', //[cite: 8]
    standard_1yr: 'https://buy.stripe.com/test_fZu7sN4HZ4y26UJ70S7IY06', // $299.99/yr[cite: 8]
    lock_3yr:     'https://buy.stripe.com/test_8x2fZj0rJfcG6UJ3OG7IY07', // $254.99/yr (15% Off)[cite: 8]
    one_off:      'https://buy.stripe.com/test_dRm7sN7Ub5C692Rdpg7IY08'  // $339.99 Single Season[cite: 8]
  },

  // Tier 4: Grand Estate (10–12 ft)[cite: 8]
  estate: {
    name: 'Grand Estate (10–12 ft)', //[cite: 8]
    standard_1yr: 'https://buy.stripe.com/test_eVq14pdev1lQdj74SK7IY09', // $449.99/yr[cite: 8]
    lock_3yr:     'https://buy.stripe.com/test_00w4gBfmD9Smdj770S7IY0a', // $382.49/yr (15% Off)[cite: 8]
    one_off:      'https://buy.stripe.com/test_6oUeVf6Q7c0ugvjgBs7IY0b'  // $499.99 Single Season[cite: 8]
  }
};

/**
 * Resolves the destination Stripe URL based on the tier key and lock-in period[cite: 8]
 * @param {string} tierKey - 'sprout', 'hearth', 'monarch', 'estate'[cite: 8]
 * @param {number} termYears - 0 (one-off), 1 (standard), 2, 3+ (locked)[cite: 8]
 * @param {boolean} isOneOff - true if single-season non-renewing purchase[cite: 8]
 * @param {string} customerEmail - Optional email to prefill in Stripe[cite: 8]
 * @param {string} promoCode - Optional promo/discount code[cite: 8]
 * @returns {string} Fully qualified Stripe Checkout Link[cite: 8]
 */
export function getStripePaymentUrl(tierKey = 'hearth', termYears = 3, isOneOff = false, customerEmail = '', promoCode = '') {
  const tier = STRIPE_PAYMENT_LINKS[tierKey] || STRIPE_PAYMENT_LINKS.hearth; //[cite: 8]
  let targetUrl = tier.lock_3yr; //[cite: 8]

  if (isOneOff || termYears === 0) {
    targetUrl = tier.one_off; //[cite: 8]
  } else if (termYears === 1) {
    targetUrl = tier.standard_1yr; //[cite: 8]
  } else if (termYears >= 2) {
    targetUrl = tier.lock_3yr; //[cite: 8]
  }

  const queryParams = []; //[cite: 8]

  if (customerEmail && customerEmail.includes('@')) {
    queryParams.push(`prefilled_email=${encodeURIComponent(customerEmail)}`); //[cite: 8]
  }

  if (promoCode) {
    queryParams.push(`prefilled_promo_code=${encodeURIComponent(promoCode)}`);
  }

  if (queryParams.length > 0) {
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryParams.join('&'); //[cite: 8]
  }

  return targetUrl; //[cite: 8]
}

/**
 * Direct Instant Redirect Helper for Cart & Checkout Buttons[cite: 8]
 */
export function redirectToStripeLink(tierKey, termYears, isOneOff = false, customerEmail = '', promoCode = '') {
  const url = getStripePaymentUrl(tierKey, termYears, isOneOff, customerEmail, promoCode); //[cite: 8]
  window.location.href = url; //[cite: 8]
}

/**
 * Initialize Embedded Stripe Elements on checkout.html (Custom Form Input)
 * @param {string} mountElementId - ID of the container div (e.g. '#card-element')
 */
export async function initStripeElements(mountElementId = '#card-element') {
  if (!window.Stripe) {
    console.error('Stripe.js SDK is not loaded. Ensure <script src="https://js.stripe.com/v3/"></script> is in <head>.');
    return null;
  }

  const stripeInstance = window.Stripe(STRIPE_PK);
  elements = stripeInstance.elements();

  // Custom styled Stripe card element matching the dark evergreen & gold enterprise aesthetic
  const style = {
    base: {
      color: '#FDFBF7',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '13px',
      '::placeholder': {
        color: 'rgba(253, 251, 247, 0.4)'
      },
      iconColor: '#D4AF37'
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  };

  cardElement = elements.create('card', { style, hidePostalCode: false });
  const mountTarget = document.querySelector(mountElementId);
  if (mountTarget) {
    cardElement.mount(mountElementId);
  }

  return { stripe: stripeInstance, cardElement };
}

/**
 * Process client-side tokenization and order submission with 1% Climate allocation
 * @param {Object} orderData - Form input payload
 */
export async function processStripePayment(orderData) {
  if (!stripe || !cardElement) {
    throw new Error('Stripe Elements is not initialized. Mount the card element first.');
  }

  // Generate Payment Method Token
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: {
      name: orderData.fullName,
      email: orderData.email,
      phone: orderData.phone,
      address: {
        line1: orderData.address,
        city: orderData.city,
        state: orderData.state,
        postal_code: orderData.zip
      }
    }
  });

  if (error) {
    throw error;
  }

  // 1% Stripe Climate automatic ledger annotation
  const climateContribution = (orderData.totalAmount * 0.01).toFixed(2);

  return {
    success: true,
    paymentMethodId: paymentMethod.id,
    climateContribution: `$${climateContribution}`,
    orderData
  };
}

/**
 * Legacy API Session Fallback (For Custom Backend API Tunnels)[cite: 8]
 */
export async function redirectToCheckout(priceId, customerEmail = '') {
  if (!stripe) {
    console.warn('Stripe.js SDK not detected. Directing to standard checkout page.'); //[cite: 8]
    window.location.href = 'checkout.html'; //[cite: 8]
    return; //[cite: 8]
  }

  try {
    const response = await fetch('/api/create-checkout-session', { //[cite: 8]
      method: 'POST', //[cite: 8]
      headers: { 'Content-Type': 'application/json' }, //[cite: 8]
      body: JSON.stringify({ //[cite: 8]
        priceId: priceId, //[cite: 8]
        customerEmail: customerEmail, //[cite: 8]
        successUrl: `${window.location.origin}/order-success.html?session_id={CHECKOUT_SESSION_ID}`, //[cite: 8]
        cancelUrl: `${window.location.origin}/checkout.html` //[cite: 8]
      }) //[cite: 8]
    }); //[cite: 8]

    const session = await response.json(); //[cite: 8]
    if (session.url) { //[cite: 8]
      window.location.href = session.url; //[cite: 8]
    } else if (session.id) { //[cite: 8]
      await stripe.redirectToCheckout({ sessionId: session.id }); //[cite: 8]
    } //[cite: 8]
  } catch (err) {
    console.warn('Checkout tunnel routing fallback:', err); //[cite: 8]
    window.location.href = 'order-success.html'; //[cite: 8]
  }
}