/**
 * Christmas Tree Joe — Real-Time 4-Stage Delivery Tracker Engine
 */
export function initOrderTracker(orderId = '#CTJ-2026-8841') {
  const stages = [
    { id: 1, name: 'Sourced & Cut (Ashe County, NC)', status: 'complete', date: 'Nov 22' },
    { id: 2, name: 'Philly Logistics Hub Cross-Dock', status: 'complete', date: 'Nov 25' },
    { id: 3, name: 'Out For Delivery (Box Truck #PA-04)', status: 'active', date: 'Nov 28 (Morning)' },
    { id: 4, name: 'In-Home White-Glove Setup & Hydration', status: 'pending', date: 'Estimated 10:30 AM' }
  ];

  const trackerElement = document.getElementById('tracking-timeline');
  if (!trackerElement) return;

  trackerElement.innerHTML = stages.map(stage => `
    <div class="flex items-start gap-4 ${stage.status === 'pending' ? 'opacity-50' : 'opacity-100'}">
      <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
        stage.status === 'complete' ? 'bg-emerald-500 text-black' :
        stage.status === 'active' ? 'bg-[#D4AF37] text-[#031A12] animate-pulse' : 'bg-slate-700 text-white'
      }">
        ${stage.status === 'complete' ? '✓' : stage.id}
      </div>
      <div>
        <h4 class="font-bold text-sm text-white">${stage.name}</h4>
        <p class="text-xs text-[#D4AF37]">${stage.date}</p>
      </div>
    </div>
  `).join('');
}