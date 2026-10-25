const { VehicleService } = require('../src/services/vehicle.service');

describe('VehicleService', () => {
  let vehicles;
  let repository;
  let service;

  beforeEach(() => {
    vehicles = [
      { id: 'v1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 32000, quantity: 2 },
    ];
    repository = {
      findAll: jest.fn(async () => vehicles),
      findById: jest.fn(async (id) => vehicles.find((vehicle) => vehicle.id === id) || null),
      create: jest.fn(async (data) => ({ id: 'v2', ...data })),
      update: jest.fn(async (id, data) => ({ ...vehicles[0], ...data, id })),
      remove: jest.fn(async () => undefined),
      purchase: jest.fn(async (id) => ({ ...vehicles[0], id, quantity: vehicles[0].quantity - 1 })),
      restock: jest.fn(async (id, amount) => ({ ...vehicles[0], id, quantity: vehicles[0].quantity + amount })),
    };
    service = new VehicleService(repository);
  });

  test('passes normalized search filters to the repository', async () => {
    await service.list({ make: ' toyota ', model: '', category: 'sedan', minPrice: '20000', maxPrice: '40000' });

    expect(repository.findAll).toHaveBeenCalledWith({
      make: 'toyota',
      category: 'sedan',
      minPrice: 20000,
      maxPrice: 40000,
    });
  });

  test('prevents purchasing an out-of-stock vehicle', async () => {
    vehicles[0].quantity = 0;

    await expect(service.purchase('v1')).rejects.toMatchObject({
      status: 409,
      code: 'OUT_OF_STOCK',
    });
    expect(repository.purchase).not.toHaveBeenCalled();
  });

  test('purchases an available vehicle', async () => {
    const result = await service.purchase('v1');

    expect(repository.purchase).toHaveBeenCalledWith('v1');
    expect(result.quantity).toBe(1);
  });

  test('rejects a restock amount below one', async () => {
    await expect(service.restock('v1', 0)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  test('returns not found for an unknown vehicle', async () => {
    await expect(service.purchase('missing')).rejects.toMatchObject({
      status: 404,
      code: 'VEHICLE_NOT_FOUND',
    });
  });
});

