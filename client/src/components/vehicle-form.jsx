import { useEffect, useState } from 'react';

const emptyVehicle = { make: '', model: '', category: 'Sedan', price: '', quantity: 0 };

export function VehicleForm({ vehicle, onSave, onCancel, saving }) {
  const [form, setForm] = useState(emptyVehicle);

  useEffect(() => {
    setForm(vehicle || emptyVehicle);
  }, [vehicle]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({ ...form, price: Number(form.price), quantity: Number(form.quantity) });
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-labelledby="vehicle-form-title">
      <form className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onSubmit={submit}>
        <div className="mb-6">
          <h2 id="vehicle-form-title" className="font-display text-2xl font-semibold">
            {vehicle ? 'Update vehicle' : 'Add a vehicle'}
          </h2>
          <p className="mt-1 text-sm text-stone-500">Keep the details consistent with the showroom listing.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="label">Make</span><input className="field" name="make" value={form.make} onChange={update} required /></label>
          <label><span className="label">Model</span><input className="field" name="model" value={form.model} onChange={update} required /></label>
          <label>
            <span className="label">Category</span>
            <select className="field" name="category" value={form.category} onChange={update}>
              <option>Sedan</option><option>SUV</option><option>Truck</option><option>Electric</option><option>Coupe</option>
            </select>
          </label>
          <label><span className="label">Price</span><input className="field" type="number" min="1" step="0.01" name="price" value={form.price} onChange={update} required /></label>
          <label><span className="label">Quantity</span><input className="field" type="number" min="0" name="quantity" value={form.quantity} onChange={update} required /></label>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" className="button-secondary" onClick={onCancel}>Cancel</button>
          <button className="button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save vehicle'}</button>
        </div>
      </form>
    </div>
  );
}

