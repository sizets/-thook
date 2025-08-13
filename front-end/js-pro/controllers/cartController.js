const { ObjectId } = require('mongodb');
const connectDB = require('../mongo');

const cartController = {

    addCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { tabletId, size, quantity = 1 } = req.body;

            if (!tabletId || !size) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tablet ID and size are required' 
                });
            }

            const dbInstance = await connectDB();
            const cartsCollection = dbInstance.collection('carts');
            const tabletsCollection = dbInstance.collection('tablets');

            // Find the tablet by its _id
            const tablet = await tabletsCollection.findOne({ _id: new ObjectId(tabletId) });

            if (!tablet) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Tablet not found' 
                });
            }

            // Find the user's cart document
            let cartDoc = await cartsCollection.findOne({ userId });

            let cart = cartDoc ? cartDoc.cart : [];

            // Check if tablet with same size already in cart
            const existingItemIndex = cart.findIndex(item => 
                item._id === tabletId && item.size === size
            );

            if (existingItemIndex > -1) {
                // Update quantity
                cart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item with full product data
                cart.push({
                    _id: tabletId,
                    size,
                    quantity,
                    product: {
                        _id: tablet._id,
                        name: tablet.name,
                        price: tablet.price,
                        image: tablet.image,
                        description: tablet.description
                    }
                });
            }

            if (cartDoc) {
                // Update existing cart document
                await cartsCollection.updateOne(
                    { userId },
                    { $set: { cart, updatedAt: new Date() } }
                );
            } else {
                // Create new cart document
                await cartsCollection.insertOne({ 
                    userId, 
                    cart, 
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
            res.json({ 
                success: true, 
                message: 'Item added to cart', 
                cartItemCount,
                cart 
            });

        } catch (error) {
            console.error('Error adding to cart:', error.message);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to add item to cart' 
            });
        }
    },

    getCart: async (req, res) => {
        try {
            const userId = req.user.id;

            const dbInstance = await connectDB();
            const cartsCollection = dbInstance.collection('carts');
            const cartDoc = await cartsCollection.findOne({ userId });

            const cartItems = cartDoc ? cartDoc.cart : [];

            res.json({ 
                success: true, 
                cart: cartItems 
            });

        } catch (error) {
            console.error('Error fetching cart data:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching cart data' 
            });
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const userId = req.user.id;
            const { tabletId, size, quantity } = req.body;

            if (!tabletId || !size || quantity === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tablet ID, size, and quantity are required' 
                });
            }

            const dbInstance = await connectDB();
            const cartsCollection = dbInstance.collection('carts');

            if (quantity === 0) {
                // Remove item from cart
                await cartsCollection.updateOne(
                    { userId },
                    { 
                        $pull: { 
                            cart: { 
                                _id: tabletId, 
                                size 
                            } 
                        },
                        $set: { updatedAt: new Date() }
                    }
                );
            } else {
                // Update quantity
                await cartsCollection.updateOne(
                    { 
                        userId, 
                        'cart._id': tabletId, 
                        'cart.size': size 
                    },
                    { 
                        $set: { 
                            'cart.$.quantity': quantity,
                            updatedAt: new Date()
                        } 
                    }
                );
            }

            // Get updated cart
            const cartDoc = await cartsCollection.findOne({ userId });
            const cartItems = cartDoc ? cartDoc.cart : [];

            res.json({ 
                success: true, 
                message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
                cart: cartItems 
            });

        } catch (error) {
            console.error('Error updating cart:', error.message);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to update cart' 
            });
        }
    },

    clearCart: async (req, res) => {
        try {
            const userId = req.user.id;

            const dbInstance = await connectDB();
            const cartsCollection = dbInstance.collection('carts');

            await cartsCollection.updateOne(
                { userId },
                { 
                    $set: { 
                        cart: [],
                        updatedAt: new Date()
                    } 
                }
            );

            res.json({ 
                success: true, 
                message: 'Cart cleared successfully' 
            });

        } catch (error) {
            console.error('Error clearing cart:', error.message);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to clear cart' 
            });
        }
    },

    checkout: async (req, res) => {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        try {
            const dbInstance = await connectDB();
            const cartsCollection = dbInstance.collection('carts');
            const ordersCollection = dbInstance.collection('orders');

            // Get user's cart
            const cartDoc = await cartsCollection.findOne({ userId });
            if (!cartDoc || !cartDoc.cart.length) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cart is empty' 
                });
            }

            // Calculate total
            const total = cartDoc.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const deliveryFee = 10;
            const finalTotal = total + deliveryFee;

            // Create order
            const order = {
                userId,
                items: cartDoc.cart,
                total,
                deliveryFee,
                finalTotal,
                shippingAddress,
                paymentMethod,
                status: 'pending',
                createdAt: new Date()
            };

            await ordersCollection.insertOne(order);

            // Clear cart
            await cartsCollection.updateOne(
                { userId },
                { 
                    $set: { 
                        cart: [],
                        updatedAt: new Date()
                    } 
                }
            );

            res.json({ 
                success: true, 
                message: 'Order placed successfully',
                orderId: order._id,
                total: finalTotal
            });

        } catch (error) {
            console.error('Error during checkout:', error.message);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to process checkout' 
            });
        }
    },

};

module.exports = cartController;
