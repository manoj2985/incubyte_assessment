const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  vehicleSchema,
  vehicleUpdateSchema,
  restockSchema,
  searchSchema,
} = require('../schemas/vehicle.schemas');

function vehicleRoutes(vehicleService) {
  const router = express.Router();

  const list = async (req, res, next) => {
    try {
      res.json({ vehicles: await vehicleService.list(req.query) });
    } catch (error) {
      next(error);
    }
  };

  router.get('/', validate(searchSchema, 'query'), list);
  router.get('/search', validate(searchSchema, 'query'), list);

  router.post('/', requireAdmin, validate(vehicleSchema), async (req, res, next) => {
    try {
      res.status(201).json({ vehicle: await vehicleService.create(req.body) });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', requireAdmin, validate(vehicleUpdateSchema), async (req, res, next) => {
    try {
      res.json({ vehicle: await vehicleService.update(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
      await vehicleService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/purchase', async (req, res, next) => {
    try {
      res.json({ vehicle: await vehicleService.purchase(req.params.id) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/restock', requireAdmin, validate(restockSchema), async (req, res, next) => {
    try {
      res.json({ vehicle: await vehicleService.restock(req.params.id, req.body.amount) });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { vehicleRoutes };

