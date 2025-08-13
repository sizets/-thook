const connectDB = require('../mongo');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get admin dashboard statistics
const getStats = async (req, res) => {
    try {
        const dbInstance = await connectDB();

        const totalUsers = await dbInstance.collection('users').countDocuments();
        const totalOrders = await dbInstance.collection('orders').countDocuments();
        const totalRevenue = await dbInstance.collection('orders').aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]).toArray();

        const recentOrders = await dbInstance.collection('orders')
            .find()
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        const stats = {
            totalUsers,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentOrders,
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const dbInstance = await connectDB();
        const users = await dbInstance.collection('users')
            .find({}, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .toArray();
        res.json({ users });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new user (admin only)
const createUser = async (req, res) => {
    try {
        const { name, email, role, phone } = req.body;

        const dbInstance = await connectDB();

        // Check if user already exists
        const existingUser = await dbInstance.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash default password
        const hashedPassword = await bcrypt.hash('defaultPassword123', 10);

        // Create user with default password (they can change it later)
        const user = {
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            phone,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await dbInstance.collection('users').insertOne(user);

        // Remove password from response
        const userResponse = { ...user, _id: result.insertedId };
        delete userResponse.password;

        res.status(201).json({ user: userResponse });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        const { name, email, role, phone } = req.body;
        const userId = req.params.id;

        const dbInstance = await connectDB();
        const user = await dbInstance.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email !== user.email) {
            const existingUser = await dbInstance.collection('users').findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateData = {
            name: name || user.name,
            email: email || user.email,
            role: role || user.role,
            phone: phone || user.phone,
            updatedAt: new Date()
        };

        await dbInstance.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        // Get updated user without password
        const updatedUser = await dbInstance.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const dbInstance = await connectDB();
        const user = await dbInstance.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has any orders
        const userOrders = await dbInstance.collection('orders').find({ user: userId }).toArray();
        if (userOrders.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete user with existing orders'
            });
        }

        await dbInstance.collection('users').deleteOne({ _id: new ObjectId(userId) });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const dbInstance = await connectDB();
        const orders = await dbInstance.collection('orders')
            .find()
            .sort({ createdAt: -1 })
            .toArray();
        res.json({ orders });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const dbInstance = await connectDB();
        const order = await dbInstance.collection('orders').findOne({ _id: new ObjectId(orderId) });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await dbInstance.collection('orders').updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status, updatedAt: new Date() } }
        );

        const updatedOrder = await dbInstance.collection('orders').findOne({ _id: new ObjectId(orderId) });
        res.json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new product (admin only)
const createProduct = async (req, res) => {
    try {
        const { name, price, category, subCategory, description, image, bestseller, stock } = req.body;

        const dbInstance = await connectDB();
        const product = {
            name,
            price,
            category,
            subCategory,
            description,
            image,
            bestseller: bestseller || false,
            stock: stock || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await dbInstance.collection('tablets').insertOne(product);
        const createdProduct = { ...product, _id: result.insertedId };

        res.status(201).json({ product: createdProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;

        const dbInstance = await connectDB();
        const product = await dbInstance.collection('tablets').findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updateData = {
            ...updates,
            updatedAt: new Date()
        };

        await dbInstance.collection('tablets').updateOne(
            { _id: new ObjectId(productId) },
            { $set: updateData }
        );

        const updatedProduct = await dbInstance.collection('tablets').findOne({ _id: new ObjectId(productId) });
        res.json({ product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const dbInstance = await connectDB();
        const product = await dbInstance.collection('tablets').findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product is in any orders
        const productOrders = await dbInstance.collection('orders').find({
            'items.product': productId
        }).toArray();

        if (productOrders.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete product with existing orders'
            });
        }

        await dbInstance.collection('tablets').deleteOne({ _id: new ObjectId(productId) });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    isAdmin,
    getStats,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    createProduct,
    updateProduct,
    deleteProduct,
};
