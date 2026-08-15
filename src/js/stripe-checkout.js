/**
 * Christmas Tree Joe — Stripe Checkout & Express Wallet Engine
 */
const STRIPE_PK = 'pk_live_YOUR_ACTUAL_KEY_HERE'; // Replace with your live key
const stripe = typeof Stripe !== 'undefined' ? Stripe(STRIPE_PK) : null;

export const STRIPE_PRICES = {
  hearth_std: 'price_hearth_std',
  hearth_3yr_lock: 'price_hearth_3yr_lock',
  sprout_1yr: 'price_sprout_1yr',
  monarch_1yr: 'price_monarch_1yr',
  mulch_2cuft: 'price_mulch_2cuft',
  essential_oil: 'price_essential_oil_30ml',
  biopellets: 'price_biopellets_40lb',
  wreath: 'price_wreath_24in'
};

export async function redirectToCheckout(priceId, customerEmail = '') {
  if (!stripe) {
    console.error('Stripe SDK not loaded. Fallback to order-success.html');
    window.location.href = 'order-success.html';
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
    console.warn('Checkout tunnel routing to direct success page:', err);
    window.location.href = 'order-success.html';
  }
}