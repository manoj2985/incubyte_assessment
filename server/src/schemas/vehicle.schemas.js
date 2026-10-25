const { z } = require('zod');

const vehicleFields = {
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  category: z.string().trim().min(1).max(40),
  price: z.coerce.number().positive().max(10000000),
  quantity: z.coerce.number().int().min(0).max(100000),
};

const vehicleSchema = z.object(vehicleFields);
const vehicleUpdateSchema = vehicleSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required.',
});
const restockSchema = z.object({ amount: z.coerce.number().int().min(1).max(100000) });
const searchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

module.exports = { vehicleSchema, vehicleUpdateSchema, restockSchema, searchSchema };

