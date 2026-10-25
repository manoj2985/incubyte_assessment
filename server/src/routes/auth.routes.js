const express = require('express');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../schemas/auth.schemas');

function authRoutes(authService) {
  const router = express.Router();

  router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
      res.status(201).json(await authService.register(req.body));
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
      res.json(await authService.login(req.body));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { authRoutes };

