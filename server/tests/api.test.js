const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');

const config = {
  jwtSecret: 'integration-secret',
  jwtExpiresIn: '1h',
  bcryptRounds: 4,
  clientUrl: 'http://localhost:5173',
};

function buildRepositories() {
  const users = [];
  const vehicles = [
    { id: 'v1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 32000, quantity: 2 },
    { id: 'v2', make: 'Ford', model: 'Bronco', category: 'SUV', price: 48000, quantity: 0 },
  ];

  return {
    users,
    vehicles,
    userRepository: {
      findByEmail: async (email) => users.find((user) => user.email === email) || null,
      create: async (data) => {
        const user = { id: `u${users.length + 1}`, role: 'USER', ...data };
        users.push(user);
        return user;
      },
    },
    vehicleRepository: {
      findAll: async (filters) => vehicles.filter((vehicle) => {
        if (filters.make && !vehicle.make.toLowerCase().includes(filters.make)) return false;
        if (filters.model && !vehicle.model.toLowerCase().includes(filters.model)) return false;
        if (filters.category && vehicle.category.toLowerCase() !== filters.category) return false;
        if (filters.minPrice !== undefined && vehicle.price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && vehicle.price > filters.maxPrice) return false;
        return true;
      }),
      findById: async (id) => vehicles.find((vehicle) => vehicle.id === id) || null,
      create: async (data) => {
        const vehicle = { id: `v${vehicles.length + 1}`, ...data };
        vehicles.push(vehicle);
        return vehicle;
      },
      update: async (id, data) => {
        const index = vehicles.findIndex((vehicle) => vehicle.id === id);
        vehicles[index] = { ...vehicles[index], ...data };
        return vehicles[index];
      },
      remove: async (id) => vehicles.splice(vehicles.findIndex((vehicle) => vehicle.id === id), 1),
      purchase: async (id) => {
        const vehicle = vehicles.find((item) => item.id === id);
        vehicle.quantity -= 1;
        return vehicle;
      },
      restock: async (id, amount) => {
        const vehicle = vehicles.find((item) => item.id === id);
        vehicle.quantity += amount;
        return vehicle;
      },
    },
  };
}

describe('REST API', () => {
  let data;
  let app;
  let userToken;
  let adminToken;

  beforeEach(async () => {
    data = buildRepositories();
    app = createApp({
      userRepository: data.userRepository,
      vehicleRepository: data.vehicleRepository,
      config,
    });
    data.users.push({
      id: 'admin-1',
      name: 'Dealer Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('AdminPass1!', 4),
      role: 'ADMIN',
    });
    userToken = jwt.sign({ sub: 'user-1', role: 'USER', name: 'Buyer' }, config.jwtSecret);
    adminToken = jwt.sign({ sub: 'admin-1', role: 'ADMIN', name: 'Dealer Admin' }, config.jwtSecret);
  });

  test('registers and logs in a user', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      name: 'Asha Rao',
      email: 'asha@example.com',
      password: 'StrongPass1!',
    });

    expect(registration.status).toBe(201);
    expect(registration.body).toEqual(
      expect.objectContaining({ token: expect.any(String), user: expect.objectContaining({ role: 'USER' }) }),
    );

    const login = await request(app).post('/api/auth/login').send({
      email: 'asha@example.com',
      password: 'StrongPass1!',
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
  });

  test('validates registration data', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('requires authentication for vehicle listings', async () => {
    const response = await request(app).get('/api/vehicles');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('searches vehicles by make and price range', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?make=toy&minPrice=30000&maxPrice=35000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].model).toBe('Camry');
  });

  test('purchases an available vehicle', async () => {
    const response = await request(app)
      .post('/api/vehicles/v1/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicle.quantity).toBe(1);
  });

  test('allows only admins to delete vehicles', async () => {
    const forbidden = await request(app)
      .delete('/api/vehicles/v1')
      .set('Authorization', `Bearer ${userToken}`);
    expect(forbidden.status).toBe(403);

    const removed = await request(app)
      .delete('/api/vehicles/v1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(removed.status).toBe(204);
  });

  test('allows admins to create and restock vehicles', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 29000, quantity: 3 });
    expect(created.status).toBe(201);

    const restocked = await request(app)
      .post('/api/vehicles/v2/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2 });
    expect(restocked.status).toBe(200);
    expect(restocked.body.vehicle.quantity).toBe(2);
  });
});

