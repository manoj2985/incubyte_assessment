import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCard } from './vehicle-card';

const vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 32000,
  quantity: 2,
};

test('shows vehicle details and purchases an available vehicle', async () => {
  const onPurchase = vi.fn();
  const user = userEvent.setup();

  render(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} purchasing={false} />);

  expect(screen.getByRole('heading', { name: 'Toyota Camry' })).toBeInTheDocument();
  expect(screen.getByText('$32,000')).toBeInTheDocument();
  expect(screen.getByText('2 available')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Purchase Toyota Camry' }));
  expect(onPurchase).toHaveBeenCalledWith('v1');
});

test('disables purchasing when a vehicle is out of stock', () => {
  render(
    <VehicleCard
      vehicle={{ ...vehicle, quantity: 0 }}
      onPurchase={vi.fn()}
      purchasing={false}
    />,
  );

  expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
});

