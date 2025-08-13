const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');

router.get('/ping', (req, res) => {
    res.status(200).json({ message: 'PING endpoint' });
});

// Product Controller (Public routes)
router.get('/tablets', productController.getAllTablets);
router.get('/tablets/bestsellers', productController.getBestsellers);
router.get('/tablets/search', productController.searchTablets);
router.get('/tablets/category/:category', productController.getTabletsByCategory);
router.get('/tablets/:id', productController.getTabletById);

// Cart Controller (Protected routes)
router.post('/cart/add', authenticate, cartController.addCart);
router.get('/cart', authenticate, cartController.getCart);
router.put('/cart/update', authenticate, cartController.updateCartItem);
router.delete('/cart/clear', authenticate, cartController.clearCart);
router.post('/checkout', authenticate, cartController.checkout);

// Order Controller (Protected routes)
router.get('/orders', authenticate, orderController.getUserOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.put('/orders/:id/status', authenticate, orderController.updateOrderStatus);
router.delete('/orders/:id', authenticate, orderController.cancelOrder);

// Auth Controller (Public routes)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authenticate, authController.logout);
router.post('/contact', authController.contact);
router.post('/subscribe', authController.subscribe);

// User Controller (Protected routes)
router.get('/me', authenticate, userController.me);
router.put('/profile', authenticate, userController.updateProfile);

// Admin Routes (Protected + Admin only)
router.get('/admin/stats', authenticate, adminController.isAdmin, adminController.getStats);
router.get('/admin/users', authenticate, adminController.isAdmin, adminController.getAllUsers);
router.post('/admin/users', authenticate, adminController.isAdmin, adminController.createUser);
router.put('/admin/users/:id', authenticate, adminController.isAdmin, adminController.updateUser);
router.delete('/admin/users/:id', authenticate, adminController.isAdmin, adminController.deleteUser);
router.get('/admin/orders', authenticate, adminController.isAdmin, adminController.getAllOrders);
router.put('/admin/orders/:id/status', authenticate, adminController.isAdmin, adminController.updateOrderStatus);
router.post('/admin/products', authenticate, adminController.isAdmin, adminController.createProduct);
router.put('/admin/products/:id', authenticate, adminController.isAdmin, adminController.updateProduct);
router.delete('/admin/products/:id', authenticate, adminController.isAdmin, adminController.deleteProduct);

module.exports = router; 
