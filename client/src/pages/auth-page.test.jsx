import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/auth-context';
import { AuthPage } from './auth-page';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

test('logs in and stores the returned session', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      token: 'jwt-token',
      user: { id: 'u1', name: 'Asha Rao', email: 'asha@example.com', role: 'USER' },
    }),
  });
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/inventory" element={<p>Inventory loaded</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

  await user.type(screen.getByLabelText('Email'), 'asha@example.com');
  await user.type(screen.getByLabelText('Password'), 'StrongPass1!');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByText('Inventory loaded')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe('jwt-token');
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:4000/api/auth/login',
    expect.objectContaining({ method: 'POST' }),
  );
});

test('switches to registration and displays an API error', async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 409,
    json: async () => ({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered.' } }),
  });
  const user = userEvent.setup();
  render(<MemoryRouter><AuthProvider><AuthPage /></AuthProvider></MemoryRouter>);

  await user.click(screen.getByRole('button', { name: 'Register' }));
  await user.type(screen.getByLabelText('Full name'), 'Asha Rao');
  await user.type(screen.getByLabelText('Email'), 'asha@example.com');
  await user.type(screen.getByLabelText('Password'), 'StrongPass1!');
  await user.click(screen.getByRole('button', { name: 'Create account' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered.');
});

