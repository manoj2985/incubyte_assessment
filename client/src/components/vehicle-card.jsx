const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const categoryColors = {
  Sedan: 'bg-sky-100 text-sky-800',
  SUV: 'bg-emerald-100 text-emerald-800',
  Truck: 'bg-amber-100 text-amber-800',
  Electric: 'bg-violet-100 text-violet-800',
};

export function VehicleCard({
  vehicle,
  onPurchase,
  purchasing,
  isAdmin = false,
  onEdit,
  onDelete,
  onRestock,
}) {
  const soldOut = vehicle.quantity === 0;
  const badge = categoryColors[vehicle.category] || 'bg-stone-100 text-stone-700';

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card">
      <div className="relative flex h-36 items-end bg-gradient-to-br from-slate-800 via-slate-700 to-sage p-5">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{vehicle.category}</span>
        <div className="absolute right-5 top-5 text-4xl font-semibold text-white/15" aria-hidden="true">
          {vehicle.make.slice(0, 1)}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{vehicle.make}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{vehicle.make} {vehicle.model}</h2>
          </div>
          <p className="text-lg font-bold">{money.format(vehicle.price)}</p>
        </div>

        <div className="my-5 flex items-center justify-between border-y border-stone-100 py-3 text-sm">
          <span className={soldOut ? 'font-medium text-rust' : 'text-stone-600'}>
            {soldOut ? 'Currently unavailable' : `${vehicle.quantity} available`}
          </span>
          <span className="text-stone-400">Stock #{vehicle.id.slice(0, 6).toUpperCase()}</span>
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-3 gap-2">
            <button className="button-secondary !px-2" onClick={() => onEdit(vehicle)}>Edit</button>
            <button className="button-secondary !px-2" onClick={() => onRestock(vehicle)}>Restock</button>
            <button className="rounded-lg px-2 py-2.5 text-sm font-semibold text-rust hover:bg-red-50" onClick={() => onDelete(vehicle)}>
              Delete
            </button>
          </div>
        ) : (
          <button
            className="button-primary w-full"
            disabled={soldOut || purchasing}
            onClick={() => onPurchase(vehicle.id)}
            aria-label={soldOut ? 'Out of stock' : `Purchase ${vehicle.make} ${vehicle.model}`}
          >
            {soldOut ? 'Out of stock' : purchasing ? 'Processing...' : 'Purchase vehicle'}
          </button>
        )}
      </div>
    </article>
  );
}

