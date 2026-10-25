const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { AuthService } = require('./services/auth.service');
const { VehicleService } = require('./services/vehicle.service');
const { authRoutes } = require('./routes/auth.routes');
const { vehicleRoutes } = require('./routes/vehicle.routes');
const { authenticate } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/error-handler');

function createApp({ userRepository, vehicleRepository, config }) {
  const app = express();
  const authService = new AuthService(userRepository, config);
  const vehicleService = new VehicleService(vehicleRepository);

  app.use(helmet());
  app.use(cors({ origin: config.clientUrl }));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes(authService));
  app.use('/api/vehicles', authenticate(config.jwtSecret), vehicleRoutes(vehicleService));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

