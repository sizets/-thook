const { ObjectId } = require('mongodb');
const connectDB = require('../mongo');

const userController = {
    me: async (req, res) => {
        try {
            const userId = req.user.id;

            const dbInstance = await connectDB();
            const user = await dbInstance.collection('users').findOne(
                { _id: new ObjectId(userId) },
                { projection: { password: 0 } }
            );

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            res.status(200).json({ success: true, user });
        } catch (error) {
            console.error('Error in /me endpoint:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, phone, address } = req.body;

            // Validate input
            if (!name || name.trim().length < 2) {
                return res.status(400).json({ error: 'Name must be at least 2 characters long' });
            }

            const dbInstance = await connectDB();
            const result = await dbInstance.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                {
                    $set: {
                        name: name.trim(),
                        phone: phone || '',
                        address: address || '',
                        updatedAt: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get updated user data
            const updatedUser = await dbInstance.collection('users').findOne(
                { _id: new ObjectId(userId) },
                { projection: { password: 0 } }
            );

            res.status(200).json({
                message: 'Profile updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
};

module.exports = userController;
