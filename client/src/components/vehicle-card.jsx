const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const categoryColors = {
  Sedan: 'bg-[#ffede5] text-[#8a3800]',
  SUV: 'bg-[#d8e7df] text-[#18392b]',
  Truck: 'bg-[#f6e6d5] text-[#5b3a1e]',
  Electric: 'bg-[#eee8f2] text-[#493653]',
};

const categorySurfaces = {
  Sedan: 'from-[#34383d] via-[#4d535a] to-[#75665b]',
  SUV: 'from-[#1f3029] via-[#385044] to-[#68786c]',
  Truck: 'from-[#332820] via-[#594535] to-[#8a7058]',
  Electric: 'from-[#292530] via-[#473d52] to-[#74647d]',
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
  const surface = categorySurfaces[vehicle.category] || 'from-[#262626] via-[#525252] to-[#6f6f6f]';

  return (
    <article className="group flex min-h-[320px] flex-col border-b border-r border-[#c6c6c6] bg-white shadow-card transition hover:bg-[#f8f8f8]">
      <div className={`relative flex h-28 items-end overflow-hidden bg-gradient-to-br ${surface} p-4`}>
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute -right-8 -top-14 h-40 w-40 rotate-45 border-[20px] border-white/20" />
          <div className="absolute bottom-0 left-1/3 h-24 w-px rotate-[28deg] bg-white/40" />
          <div className="absolute bottom-5 right-1/3 h-px w-28 -rotate-12 bg-white/30" />
        </div>
        <span className={`relative px-2 py-1 text-xs font-medium ${badge}`}>{vehicle.category}</span>
        <div className="absolute right-4 top-3 text-3xl font-light text-white/40" aria-hidden="true">{vehicle.make.slice(0, 1)}</div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#6f6f6f]">{vehicle.make}</p>
            <h2 className="mt-1 text-xl font-normal">{vehicle.make} {vehicle.model}</h2>
          </div>
          <p className="text-lg font-medium">{money.format(vehicle.price)}</p>
        </div>

        <div className="my-4 flex items-center justify-between border-t border-[#e0e0e0] pt-3 text-sm">
          <span className={soldOut ? 'text-[#da1e28]' : 'text-[#525252]'}>
            {soldOut ? 'Currently unavailable' : `${vehicle.quantity} available`}
          </span>
          <span className="text-[#8d8d8d]">Stock #{vehicle.id.slice(0, 6).toUpperCase()}</span>
        </div>

        {isAdmin ? (
          <div className="mt-auto grid grid-cols-3 border-t border-[#e0e0e0] pt-3">
            <button className="px-2 py-2 text-left text-sm text-[#393939] hover:bg-[#e8e8e8]" onClick={() => onEdit(vehicle)}>Edit</button>
            <button className="px-2 py-2 text-left text-sm text-[#393939] hover:bg-[#e8e8e8]" onClick={() => onRestock(vehicle)}>Restock</button>
            <button className="px-2 py-2 text-left text-sm text-[#da1e28] hover:bg-[#fff1f1]" onClick={() => onDelete(vehicle)}>
              Delete
            </button>
          </div>
        ) : (
          <button
            className="mt-auto inline-flex min-h-12 w-full items-center justify-between bg-[#262626] px-4 py-3 text-sm text-white transition hover:bg-[#004144] focus:outline-none focus:ring-2 focus:ring-[#007d79] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d]"
            disabled={soldOut || purchasing}
            onClick={() => onPurchase(vehicle.id)}
            aria-label={soldOut ? 'Out of stock' : `Purchase ${vehicle.make} ${vehicle.model}`}
          >
            <span>{soldOut ? 'Out of stock' : purchasing ? 'Processing...' : 'Purchase vehicle'}</span>
            {!soldOut && <span aria-hidden="true">→</span>}
          </button>
        )}
      </div>
    </article>
  );
}

