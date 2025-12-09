const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { customerCreateSchema, customerUpdateSchema } = require('../validators/schemas');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

router.use(authMiddleware); // Toutes les routes protégées

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', validateRequest(customerCreateSchema), createCustomer);
router.put('/:id', validateRequest(customerUpdateSchema), updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
