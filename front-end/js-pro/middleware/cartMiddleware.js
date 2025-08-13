const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo'); // Adjust your MongoDB import accordingly

const fetchCartData = async (req, res, next) => {
    if (!req.cookies.authToken) {
        res.locals.cartItemCount = 0; // Default to 0 for unauthenticated users
        return next();
    }

    try {
        const token = req.cookies.authToken;
        const decoded = jwt.verify(token, "randomsecretkey12345"); // Verify JWT

        req.user = decoded; // Attach decoded token to req.user
        const userId = decoded.userId;

        const cartsCollection = db.collection('carts');

        // Find user's cart document by userId
        const cartDoc = await cartsCollection.findOne({ userId });

        let cart = [];
        if (cartDoc && cartDoc.cart) {
            cart = cartDoc.cart;
        }

        // Calculate total quantity in cart
        const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

        res.locals.cartItemCount = cartItemCount;

    } catch (error) {
        console.error('Error fetching cart data:', error.message);
        res.locals.cartItemCount = 0;
    }

    next();
};

module.exports = fetchCartData;
