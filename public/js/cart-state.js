/**
 * Christmas Tree Joe — Multi-Year Term & Cart State Engine
 */
const CART_STORAGE_KEY = 'ctj_active_order';

export function calculateOrderTotal(basePrice, termYears) {
  let discountRate = 0;
  if (termYears === 2) discountRate = 0.10;
  if (termYears >= 3) discountRate = 0.15;

  const totalAnnual = basePrice * (1 - discountRate);
  const totalContract = totalAnnual * termYears;
  const climateContribution = totalAnnual * 0.01;

  return {
    basePrice,
    termYears,
    discountRate,
    totalAnnual: parseFloat(totalAnnual.toFixed(2)),
    totalContract: parseFloat(totalContract.toFixed(2)),
    climateContribution: parseFloat(climateContribution.toFixed(2))
  };
}

export function saveOrderToStorage(orderData) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(orderData));
}

export function getStoredOrder() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}