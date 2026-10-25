import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleForm } from './vehicle-form';

test('submits numeric price and quantity values', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<VehicleForm onSave={onSave} onCancel={vi.fn()} saving={false} />);

  await user.type(screen.getByLabelText('Make'), 'Honda');
  await user.type(screen.getByLabelText('Model'), 'Civic');
  await user.type(screen.getByLabelText('Price'), '29000');
  await user.clear(screen.getByLabelText('Quantity'));
  await user.type(screen.getByLabelText('Quantity'), '3');
  await user.click(screen.getByRole('button', { name: 'Save vehicle' }));

  expect(onSave).toHaveBeenCalledWith({
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: 29000,
    quantity: 3,
  });
});

test('loads an existing vehicle for editing and supports cancellation', async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  render(
    <VehicleForm
      vehicle={{ make: 'Ford', model: 'Bronco', category: 'SUV', price: 48000, quantity: 2 }}
      onSave={vi.fn()}
      onCancel={onCancel}
      saving={false}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Update vehicle' })).toBeInTheDocument();
  expect(screen.getByLabelText('Make')).toHaveValue('Ford');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalled();
});

