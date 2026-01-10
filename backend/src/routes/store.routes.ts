import { Router } from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createProductSchema, createOrderSchema } from '../schemas/store.schema.js';

const router = Router();
const storeController = new StoreController();

// Categories
router.get('/categories', storeController.getCategories);

// Products
router.get('/products', optionalAuth, storeController.getProducts);
router.get('/products/featured', optionalAuth, storeController.getFeaturedProducts);
router.get('/products/:id', optionalAuth, storeController.getProductById);

// Orders
router.post('/orders', authenticate, validateBody(createOrderSchema), storeController.createOrder);
router.get('/orders/my', authenticate, storeController.getMyOrders);
router.get('/orders/:id', authenticate, storeController.getOrderById);
router.put('/orders/:id/cancel', authenticate, storeController.cancelOrder);

// Admin routes
router.post('/categories', authenticate, requireAdmin, storeController.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, storeController.updateCategory);

router.post('/products', authenticate, requireAdmin, validateBody(createProductSchema), storeController.createProduct);
router.put('/products/:id', authenticate, requireAdmin, validateBody(createProductSchema), storeController.updateProduct);
router.delete('/products/:id', authenticate, requireAdmin, storeController.deleteProduct);

router.get('/admin/orders', authenticate, requireAdmin, storeController.getAllOrders);
router.put('/orders/:id/status', authenticate, requireAdmin, storeController.updateOrderStatus);

export default router;
