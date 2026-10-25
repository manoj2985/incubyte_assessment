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
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rust font-display text-lg text-white">A</span>
            <div><p className="font-semibold leading-4">AutoVault</p><p className="text-xs text-stone-500">Inventory</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-stone-500">{isAdmin ? 'Administrator' : 'Customer'}</p></div>
            <button className="button-secondary !py-2" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">Current selection</p><h1 className="mt-2 font-display text-4xl font-semibold">{isAdmin ? 'Manage inventory' : 'Available vehicles'}</h1><p className="mt-2 text-stone-600">{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} match the current filters.</p></div>
          {isAdmin && <button className="button-primary" onClick={() => { setEditing(undefined); setShowForm(true); }}>Add vehicle</button>}
        </div>

        <form className="mt-8 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-6" onSubmit={(event) => { event.preventDefault(); loadVehicles(); }}>
          <input className="field md:col-span-1" name="make" value={filters.make} onChange={changeFilter} placeholder="Make" aria-label="Make" />
          <input className="field md:col-span-1" name="model" value={filters.model} onChange={changeFilter} placeholder="Model" aria-label="Model" />
          <select className="field md:col-span-1" name="category" value={filters.category} onChange={changeFilter} aria-label="Category"><option value="">All categories</option><option>Sedan</option><option>SUV</option><option>Truck</option><option>Electric</option><option>Coupe</option></select>
          <input className="field md:col-span-1" type="number" min="0" name="minPrice" value={filters.minPrice} onChange={changeFilter} placeholder="Min price" aria-label="Minimum price" />
          <input className="field md:col-span-1" type="number" min="0" name="maxPrice" value={filters.maxPrice} onChange={changeFilter} placeholder="Max price" aria-label="Maximum price" />
          <button className="button-primary md:col-span-1">Search</button>
        </form>

        {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        {notice && <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</p>}

        {loading ? (
          <div className="py-24 text-center text-stone-500">Loading inventory...</div>
        ) : vehicles.length === 0 ? (
          <div className="py-24 text-center"><h2 className="font-display text-2xl">No vehicles found</h2><p className="mt-2 text-stone-500">Try widening the search filters.</p></div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin={isAdmin} onPurchase={purchase} purchasing={purchasing === vehicle.id} onEdit={(item) => { setEditing(item); setShowForm(true); }} onDelete={deleteVehicle} onRestock={restock} />)}
          </div>
        )}
      </main>

      {showForm && <VehicleForm vehicle={editing} saving={saving} onSave={saveVehicle} onCancel={() => { setShowForm(false); setEditing(undefined); }} />}
    </div>
  );
}

