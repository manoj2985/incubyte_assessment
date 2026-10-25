const { AppError } = require('../errors/app-error');

class VehicleService {
  constructor(vehicleRepository) {
    this.vehicles = vehicleRepository;
  }

  list(filters = {}) {
    const normalized = {};

    for (const key of ['make', 'model', 'category']) {
      if (filters[key]?.trim()) normalized[key] = filters[key].trim().toLowerCase();
    }
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      normalized.minPrice = Number(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      normalized.maxPrice = Number(filters.maxPrice);
    }

    return this.vehicles.findAll(normalized);
  }

  create(data) {
    return this.vehicles.create(data);
  }

  async update(id, data) {
    await this.requireVehicle(id);
    return this.vehicles.update(id, data);
  }

  async remove(id) {
    await this.requireVehicle(id);
    await this.vehicles.remove(id);
  }

  async purchase(id) {
    const vehicle = await this.requireVehicle(id);
    if (vehicle.quantity === 0) {
      throw new AppError(409, 'OUT_OF_STOCK', 'This vehicle is out of stock.');
    }
    return this.vehicles.purchase(id);
  }

  async restock(id, amount) {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Restock amount must be a positive integer.');
    }
    await this.requireVehicle(id);
    return this.vehicles.restock(id, amount);
  }

  async requireVehicle(id) {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found.');
    }
    return vehicle;
  }
}

module.exports = { VehicleService };

