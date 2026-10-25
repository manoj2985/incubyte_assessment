const { PrismaClient } = require('@prisma/client');
const { createApp } = require('./app');
const { loadConfig } = require('./config');
const { UserRepository } = require('./repositories/user.repository');
const { VehicleRepository } = require('./repositories/vehicle.repository');

const config = loadConfig();
const prisma = new PrismaClient();
const app = createApp({
  userRepository: new UserRepository(prisma),
  vehicleRepository: new VehicleRepository(prisma),
  config,
});

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

