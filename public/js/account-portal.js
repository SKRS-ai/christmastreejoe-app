/**
 * Christmas Tree Joe — Customer Account & January Eco-Pickup Scheduler
 */
export function loadSubscriberAccount() {
  const accountStatusBadge = document.getElementById('account-status');
  const pickupSelector = document.getElementById('pickup-date-select');

  // Load user data
  if (accountStatusBadge) {
    accountStatusBadge.innerText = 'Active Subscriber (3-Year Price Lock)';
    accountStatusBadge.className = 'px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs';
  }

  if (pickupSelector) {
    pickupSelector.addEventListener('change', (e) => {
      alert(`✓ Your January Eco-Recycling Pickup has been confirmed for: ${e.target.value}. Please place tree curbside by 7:00 AM.`);
    });
  }
}

export function downloadReceiptPDF(orderNumber) {
  window.print();
}