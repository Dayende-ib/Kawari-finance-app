const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required(),
});

const customerCreateSchema = Joi.object({
  name: Joi.string().min(2).required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
});

const customerUpdateSchema = Joi.object({
  name: Joi.string().min(2).required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
});

const transactionCreateSchema = Joi.object({
  type: Joi.string().valid('sale', 'expense').required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
  date: Joi.date().iso().required(),
  description: Joi.string().allow('', null),
  paymentMethod: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  customerId: Joi.number().integer().optional(),
});

const transactionUpdateSchema = Joi.object({
  type: Joi.string().valid('sale', 'expense').optional(),
  amount: Joi.number().positive().optional(),
  currency: Joi.string().optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().allow('', null),
  paymentMethod: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  customerId: Joi.number().integer().optional(),
});

const invoiceItemSchema = Joi.object({
  label: Joi.string().min(1).required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
});

const invoiceCreateSchema = Joi.object({
  customerId: Joi.number().integer().optional(),
  number: Joi.string().allow('', null),
  total: Joi.number().positive().required(),
  issuedAt: Joi.date().iso().required(),
  status: Joi.string().valid('pending', 'paid', 'overdue').allow('', null),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
});

const invoiceUpdateSchema = Joi.object({
  customerId: Joi.number().integer().optional(),
  number: Joi.string().allow('', null),
  total: Joi.number().positive().optional(),
  issuedAt: Joi.date().iso().optional(),
  status: Joi.string().valid('pending', 'paid', 'overdue').allow('', null),
  items: Joi.array().items(invoiceItemSchema).min(1).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  customerCreateSchema,
  customerUpdateSchema,
  transactionCreateSchema,
  transactionUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
};
