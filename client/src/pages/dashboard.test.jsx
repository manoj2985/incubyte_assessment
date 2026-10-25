import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/auth-context';
import { Dashboard } from './dashboard';

const vehicle = {
  id: 'vehicle-1',
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 32000,
  quantity: 2,
};

function renderDashboard(role = 'USER') {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Asha', role }));
  return render(<MemoryRouter><AuthProvider><Dashboard /></AuthProvider></MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

test('loads inventory and updates the quantity after a purchase', async () => {
  fetch
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ vehicles: [vehicle] }) })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ vehicle: { ...vehicle, quantity: 1 } }) });
  const user = userEvent.setup();
  renderDashboard();

  expect(await screen.findByRole('heading', { name: 'Toyota Camry' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Purchase Toyota Camry' }));

  expect(await screen.findByText('1 available')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Purchase recorded');
});

test('shows inventory management controls to an administrator', async () => {
  fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ vehicles: [vehicle] }) });
  const user = userEvent.setup();
  renderDashboard('ADMIN');

  expect(await screen.findByRole('heading', { name: 'Manage inventory' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add vehicle' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Add a vehicle' })).toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
});

