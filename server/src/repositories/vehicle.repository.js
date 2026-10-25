const { AppError } = require('../errors/app-error');

function toVehicle(vehicle) {
  return vehicle && { ...vehicle, price: Number(vehicle.price) };
}

class VehicleRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll(filters) {
    const where = {};
    if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' };
    if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.category) where.category = { equals: filters.category, mode: 'insensitive' };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    const vehicles = await this.prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
    return vehicles.map(toVehicle);
  }

  async findById(id) {
    return toVehicle(await this.prisma.vehicle.findUnique({ where: { id } }));
  }

  async create(data) {
    return toVehicle(await this.prisma.vehicle.create({ data }));
  }

  async update(id, data) {
    return toVehicle(await this.prisma.vehicle.update({ where: { id }, data }));
  }

  remove(id) {
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async purchase(id) {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.vehicle.updateMany({
        where: { id, quantity: { gt: 0 } },
        data: { quantity: { decrement: 1 } },
      });
      if (result.count === 0) {
        throw new AppError(409, 'OUT_OF_STOCK', 'This vehicle is out of stock.');
      }
      return toVehicle(await transaction.vehicle.findUnique({ where: { id } }));
    });
  }

  async restock(id, amount) {
    return toVehicle(
      await this.prisma.vehicle.update({
        where: { id },
        data: { quantity: { increment: amount } },
      }),
    );
  }
}

module.exports = { VehicleRepository };

