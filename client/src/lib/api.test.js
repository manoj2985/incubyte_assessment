import { api } from './api';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

test('sends JSON requests with the stored authentication token', async () => {
  localStorage.setItem('token', 'test-token');
  fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ vehicles: [] }) });

  await api('/vehicles', { method: 'POST', body: '{}' });

  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:4000/api/vehicles',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
    }),
  );
});

test('throws the API error message and code', async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ error: { code: 'INVALID_TOKEN', message: 'Session expired.' } }),
  });

  await expect(api('/vehicles')).rejects.toMatchObject({
    message: 'Session expired.',
    code: 'INVALID_TOKEN',
  });
});

test('returns null for a successful no-content response', async () => {
  fetch.mockResolvedValue({ ok: true, status: 204 });
  await expect(api('/vehicles/v1', { method: 'DELETE' })).resolves.toBeNull();
});

