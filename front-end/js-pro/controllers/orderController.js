const { ObjectId } = require('mongodb');
const connectDB = require('../mongo');

const orderController = {
    // Get user's orders
    getUserOrders: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const dbInstance = await connectDB();
            const ordersCollection = dbInstance.collection('orders');
            
            const orders = await ordersCollection.find({ userId })
                .sort({ createdAt: -1 })
                .toArray();
            
            res.json({
                success: true,
                orders
            });
        } catch (error) {
            console.error('Error fetching orders:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch orders'
            });
        }
    },

    // Get order by ID
    getOrderById: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order ID'
                });
            }

            const dbInstance = await connectDB();
            const ordersCollection = dbInstance.collection('orders');
            
            const order = await ordersCollection.findOne({ 
                _id: new ObjectId(id),
                userId 
            });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                order
            });
        } catch (error) {
            console.error('Error fetching order:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch order'
            });
        }
    },

    // Update order status (for admin use)
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order ID'
                });
            }

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const dbInstance = await connectDB();
            const ordersCollection = dbInstance.collection('orders');
            
            const result = await ordersCollection.updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status,
                        updatedAt: new Date()
                    } 
                }
            );
            
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });
        } catch (error) {
            console.error('Error updating order status:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to update order status'
            });
        }
    },

    // Cancel order
    cancelOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order ID'
                });
            }

            const dbInstance = await connectDB();
            const ordersCollection = dbInstance.collection('orders');
            
            const order = await ordersCollection.findOne({ 
                _id: new ObjectId(id),
                userId 
            });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            if (order.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Only pending orders can be cancelled'
                });
            }

            await ordersCollection.updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: 'cancelled',
                        updatedAt: new Date()
                    } 
                }
            );

            res.json({
                success: true,
                message: 'Order cancelled successfully'
            });
        } catch (error) {
            console.error('Error cancelling order:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel order'
            });
        }
    }
};

module.exports = orderController;
