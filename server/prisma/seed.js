require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@autovault.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name: 'Dealership Admin', passwordHash, role: 'ADMIN' },
    create: { name: 'Dealership Admin', email, passwordHash, role: 'ADMIN' },
  });

  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount === 0) {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 31950, quantity: 4 },
        { make: 'Ford', model: 'Bronco', category: 'SUV', price: 48690, quantity: 2 },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 27100, quantity: 5 },
        { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 42490, quantity: 0 },
        { make: 'Mazda', model: 'CX-5', category: 'SUV', price: 30250, quantity: 3 },
        { make: 'Ford', model: 'F-150', category: 'Truck', price: 38960, quantity: 2 },
      ],
    });
  }
}

main()
  .then(() => console.log('Database seeded.'))
  .finally(() => prisma.$disconnect());

