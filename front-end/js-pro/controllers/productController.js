const { ObjectId } = require('mongodb');
const connectDB = require('../mongo');

const productController = {
    // Get all tablets
    getAllTablets: async (req, res) => {
        try {
            const dbInstance = await connectDB();
            const tabletsCollection = dbInstance.collection('tablets');
            
            const tablets = await tabletsCollection.find({}).toArray();
            
            res.json({
                success: true,
                tablets
            });
        } catch (error) {
            console.error('Error fetching tablets:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tablets'
            });
        }
    },

    // Get tablet by ID
    getTabletById: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid tablet ID'
                });
            }

            const dbInstance = await connectDB();
            const tabletsCollection = dbInstance.collection('tablets');
            
            const tablet = await tabletsCollection.findOne({ _id: new ObjectId(id) });
            
            if (!tablet) {
                return res.status(404).json({
                    success: false,
                    message: 'Tablet not found'
                });
            }

            res.json({
                success: true,
                tablet
            });
        } catch (error) {
            console.error('Error fetching tablet:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tablet'
            });
        }
    },

    // Get bestseller tablets
    getBestsellers: async (req, res) => {
        try {
            const dbInstance = await connectDB();
            const tabletsCollection = dbInstance.collection('tablets');
            
            const bestsellers = await tabletsCollection.find({ bestseller: true }).toArray();
            
            res.json({
                success: true,
                bestsellers
            });
        } catch (error) {
            console.error('Error fetching bestsellers:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bestsellers'
            });
        }
    },

    // Search tablets
    searchTablets: async (req, res) => {
        try {
            const { query, category, minPrice, maxPrice } = req.query;
            
            const dbInstance = await connectDB();
            const tabletsCollection = dbInstance.collection('tablets');
            
            let filter = {};
            
            // Text search
            if (query) {
                filter.$text = { $search: query };
            }
            
            // Category filter
            if (category) {
                filter.category = category;
            }
            
            // Price filter
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = parseFloat(minPrice);
                if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
            }
            
            const tablets = await tabletsCollection.find(filter).toArray();
            
            res.json({
                success: true,
                tablets,
                count: tablets.length
            });
        } catch (error) {
            console.error('Error searching tablets:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to search tablets'
            });
        }
    },

    // Get tablets by category
    getTabletsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            
            const dbInstance = await connectDB();
            const tabletsCollection = dbInstance.collection('tablets');
            
            const tablets = await tabletsCollection.find({ category }).toArray();
            
            res.json({
                success: true,
                tablets,
                count: tablets.length
            });
        } catch (error) {
            console.error('Error fetching tablets by category:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tablets by category'
            });
        }
    }
};

module.exports = productController;
