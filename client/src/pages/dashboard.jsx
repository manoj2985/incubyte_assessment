import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { api } from '../lib/api';
import { VehicleCard } from '../components/vehicle-card';
import { VehicleForm } from '../components/vehicle-form';

const initialFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export function Dashboard() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [purchasing, setPurchasing] = useState('');
  const [editing, setEditing] = useState(undefined);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const totalStock = vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0);
  const unavailable = vehicles.filter((vehicle) => vehicle.quantity === 0).length;

  const loadVehicles = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([key, value]) => value && params.set(key, value));
      const data = await api(`/vehicles/search?${params}`);
      setVehicles(data.vehicles);
    } catch (requestError) {
      if (requestError.code === 'INVALID_TOKEN') logout();
      else setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, logout]);

  useEffect(() => { if (user) loadVehicles(initialFilters); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/" replace />;

  function changeFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function purchase(id) {
    setPurchasing(id);
    setError('');
    try {
      const { vehicle } = await api(`/vehicles/${id}/purchase`, { method: 'POST' });
      setVehicles((current) => current.map((item) => item.id === id ? vehicle : item));
      setNotice('Purchase recorded. Inventory has been updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPurchasing('');
    }
  }

  async function saveVehicle(values) {
    setSaving(true);
    setError('');
    try {
      await api(editing ? `/vehicles/${editing.id}` : '/vehicles', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      setShowForm(false);
      setEditing(undefined);
      setNotice(editing ? 'Vehicle updated.' : 'Vehicle added to inventory.');
      await loadVehicles();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVehicle(vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}?`)) return;
    try {
      await api(`/vehicles/${vehicle.id}`, { method: 'DELETE' });
      setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
      setNotice('Vehicle removed from inventory.');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function restock(vehicle) {
    const value = window.prompt(`How many ${vehicle.make} ${vehicle.model} vehicles were received?`, '1');
    if (value === null) return;
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < 1) return setError('Enter a positive whole number.');
    try {
      const data = await api(`/vehicles/${vehicle.id}/restock`, { method: 'POST', body: JSON.stringify({ amount }) });
      setVehicles((current) => current.map((item) => item.id === vehicle.id ? data.vehicle : item));
      setNotice('Stock quantity updated.');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="fixed inset-x-0 top-0 z-20 flex h-12 items-center bg-[#161616] text-white">
        <div className="flex h-full w-64 items-center border-r border-[#393939] px-4">
          <span className="text-sm font-semibold">AutoVault</span>
          <span className="ml-1 text-sm font-light text-[#c6c6c6]">Dealer Cloud</span>
        </div>
        <div className="hidden h-8 max-w-xl flex-1 items-center border-b border-[#6f6f6f] bg-[#262626] px-3 text-sm text-[#c6c6c6] md:flex">
          <span className="mr-3" aria-hidden="true">⌕</span>
          Search inventory resources
        </div>
        <div className="ml-auto flex h-full items-center">
          <div className="hidden px-4 text-right sm:block">
            <p className="text-xs">{user.name}</p>
            <p className="text-[10px] text-[#a8a8a8]">{isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>
          <button className="h-full border-l border-[#393939] px-4 text-xs hover:bg-[#353535]" onClick={logout}>Sign out</button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-12 z-10 hidden w-12 flex-col bg-[#262626] text-white md:flex" aria-label="Primary navigation">
        <button className="h-12 border-b border-[#393939] text-lg hover:bg-[#353535]" aria-label="Menu">≡</button>
        <button className="h-12 border-l-2 border-[#0f62fe] bg-[#393939] text-sm" aria-label="Inventory">▦</button>
        <button className="h-12 text-sm hover:bg-[#353535]" aria-label="Analytics">⌁</button>
        <button className="h-12 text-lg hover:bg-[#353535]" aria-label="Users">♙</button>
        <button className="h-12 text-lg hover:bg-[#353535]" aria-label="Settings">+</button>
      </aside>

      <main className="pt-12 md:pl-12">
        <section className="border-b border-[#c6c6c6] bg-white px-5 py-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs text-[#525252]">AutoVault / Inventory</p>
              <h1 className="mt-3 text-3xl font-light">{isAdmin ? 'Manage inventory' : 'Available vehicles'}</h1>
              <p className="mt-2 text-sm text-[#525252]">Monitor live dealership stock and vehicle availability.</p>
            </div>
            {isAdmin && <button className="button-primary" onClick={() => { setEditing(undefined); setShowForm(true); }}><span>Add vehicle</span><span aria-hidden="true">+</span></button>}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
          <section className="grid border-l border-t border-[#c6c6c6] sm:grid-cols-3" aria-label="Inventory summary">
            <div className="border-b border-r border-[#c6c6c6] bg-white p-4"><p className="text-xs text-[#525252]">Matching models</p><p className="mt-5 text-3xl font-light">{vehicles.length}</p></div>
            <div className="border-b border-r border-[#c6c6c6] bg-white p-4"><p className="text-xs text-[#525252]">Units in stock</p><p className="mt-5 text-3xl font-light">{totalStock}</p></div>
            <div className="border-b border-r border-[#c6c6c6] bg-white p-4"><p className="text-xs text-[#525252]">Unavailable models</p><p className="mt-5 text-3xl font-light">{unavailable}</p></div>
          </section>

          <div className="mt-6 flex items-center justify-between">
            <div><h2 className="text-xl font-normal">Vehicle inventory</h2><p className="mt-1 text-sm text-[#525252]">{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} match the current filters.</p></div>
            <span className="hidden text-xs text-[#6f6f6f] sm:block">Live stock view</span>
          </div>

          <form className="mt-4 grid border border-[#c6c6c6] bg-white md:grid-cols-6" onSubmit={(event) => { event.preventDefault(); loadVehicles(); }}>
            <input className="field md:col-span-1" name="make" value={filters.make} onChange={changeFilter} placeholder="Make" aria-label="Make" />
            <input className="field md:col-span-1" name="model" value={filters.model} onChange={changeFilter} placeholder="Model" aria-label="Model" />
            <select className="field md:col-span-1" name="category" value={filters.category} onChange={changeFilter} aria-label="Category"><option value="">All categories</option><option>Sedan</option><option>SUV</option><option>Truck</option><option>Electric</option><option>Coupe</option></select>
            <input className="field md:col-span-1" type="number" min="0" name="minPrice" value={filters.minPrice} onChange={changeFilter} placeholder="Min price" aria-label="Minimum price" />
            <input className="field md:col-span-1" type="number" min="0" name="maxPrice" value={filters.maxPrice} onChange={changeFilter} placeholder="Max price" aria-label="Maximum price" />
            <button className="button-primary md:col-span-1"><span>Search</span><span aria-hidden="true">→</span></button>
          </form>

          {error && <p className="mt-4 border-l-4 border-[#da1e28] bg-[#fff1f1] px-4 py-3 text-sm text-[#a2191f]" role="alert">{error}</p>}
          {notice && <p className="mt-4 border-l-4 border-[#24a148] bg-[#defbe6] px-4 py-3 text-sm text-[#0e6027]" role="status">{notice}</p>}

          {loading ? (
            <div className="py-24 text-center text-sm text-[#525252]">Loading inventory...</div>
          ) : vehicles.length === 0 ? (
            <div className="border border-[#c6c6c6] bg-white py-24 text-center"><h2 className="text-xl">No vehicles found</h2><p className="mt-2 text-sm text-[#525252]">Try widening the search filters.</p></div>
          ) : (
            <div className="mt-6 grid border-l border-t border-[#c6c6c6] sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin={isAdmin} onPurchase={purchase} purchasing={purchasing === vehicle.id} onEdit={(item) => { setEditing(item); setShowForm(true); }} onDelete={deleteVehicle} onRestock={restock} />)}
            </div>
          )}
        </div>
      </main>

      {showForm && <VehicleForm vehicle={editing} saving={saving} onSave={saveVehicle} onCancel={() => { setShowForm(false); setEditing(undefined); }} />}
    </div>
  );
}

