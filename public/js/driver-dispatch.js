/**
 * Christmas Tree Joe — Logistics Driver & CDL Bidding Logic
 */
let completedRuns = 12;
let totalEarnings = 510.00;

export function claimRouteBatch(batchId, payoutAmount) {
  const card = document.getElementById(`card-${batchId}`);
  if (!card) return;

  const btn = card.querySelector('.claim-btn');
  btn.disabled = true;
  btn.className = 'w-full py-3 bg-emerald-800 text-white font-bold text-xs uppercase rounded-xl border border-emerald-400 cursor-not-allowed opacity-90';
  btn.innerText = '✓ Route Claimed & Dispatched';

  card.classList.remove('hover:border-xmasGold', 'hover:-translate-y-1');
  card.classList.add('opacity-75', 'border-emerald-500/50');

  completedRuns += 1;
  totalEarnings += payoutAmount;

  document.getElementById('completedRuns').innerText = completedRuns;
  document.getElementById('earnedPayouts').innerText = `$${totalEarnings.toFixed(2)}`;

  alert(`Batch #${batchId} locked to your carrier credentials. Dispatch manifest transmitted.`);
}