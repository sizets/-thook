const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CourierClient } = require('@trycourier/courier');
const crypto = require('crypto');
const connectDB = require('../mongo');

const JWT_SECRET = process.env.JWT_SECRET || 'randomsecretkey12345'; // Use environment variable

// Initialize Courier client
const courier = new CourierClient({
    authorizationToken: process.env.COURIER_AUTH_TOKEN
});

const authController = {
    register: async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }



        try {
            const dbInstance = await connectDB();
            const existingUser = await dbInstance.collection('users').findOne({ email: email.trim().toLowerCase() });

            if (existingUser) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                createdAt: new Date(),
            };

            await dbInstance.collection('users').insertOne(newUser);
            return res.status(201).json({ message: 'User registered successfully' });

        } catch (error) {
            console.error('Register Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            const dbInstance = await connectDB();
            const user = await dbInstance.collection('users').findOne({ email: email.trim().toLowerCase() });

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '24h' });

            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'Strict'
            });

            return res.status(200).json({ message: 'Login successful', token });

        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    logout: (req, res) => {
        res.clearCookie('authToken');
        return res.status(200).json({ message: 'Logged out successfully' });
    },

    contact: async (req, res) => {
        const { name, email, message, subject } = req.body;

        if (!name || !email || !message || !subject) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            const dbInstance = await connectDB();
            await dbInstance.collection('contact').insertOne({
                name,
                email,
                message,
                subject,
                createdAt: new Date()
            });
            return res.status(200).json({ message: 'Contact form submitted' });
        } catch (error) {
            console.error('Contact Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    subscribe: async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            const dbInstance = await connectDB();
            await dbInstance.collection('subscribers').insertOne({
                email,
                createdAt: new Date()
            });
            return res.status(200).json({ message: 'Subscribed successfully' });
        } catch (error) {
            console.error('Subscribe Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            const dbInstance = await connectDB();
            const user = await dbInstance.collection('users').findOne({ email: email.trim().toLowerCase() });

            if (!user) {
                // For security, don't reveal if user exists or not
                return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

            // Store reset token in database
            await dbInstance.collection('users').updateOne(
                { email: email.trim().toLowerCase() },
                {
                    $set: {
                        resetToken: resetToken,
                        resetTokenExpiry: resetTokenExpiry
                    }
                }
            );

            // Email content
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

            // Check if Courier is configured
            if (!process.env.COURIER_AUTH_TOKEN) {
                console.warn('Courier not configured. Skipping email send.');
                // In development, you might want to log the reset URL
                if (process.env.NODE_ENV === 'development') {
                    console.log('Password reset URL (development):', resetUrl);
                }
            } else {
                // Send email using Courier
                try {
                    const { requestId } = await courier.send({
                        message: {
                            to: {
                                email: email,
                            },
                            template: process.env.COURIER_TEMPLATE_ID || "default",
                            data: {
                                resetUrl: resetUrl,
                                userName: user.name || 'User',
                                expiryTime: '1 hour'
                            },
                        },
                    });
                    console.log('Password reset email sent via Courier:', requestId);
                } catch (courierError) {
                    console.error('Courier email send failed:', courierError);
                    // Don't fail the request if email fails, just log it
                }
            }

            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

        } catch (error) {
            console.error('Forgot Password Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        try {
            const dbInstance = await connectDB();

            // Find user with valid reset token
            const user = await dbInstance.collection('users').findOne({
                resetToken: token,
                resetTokenExpiry: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and clear reset token
            await dbInstance.collection('users').updateOne(
                { _id: user._id },
                {
                    $set: { password: hashedPassword },
                    $unset: { resetToken: "", resetTokenExpiry: "" }
                }
            );

            return res.status(200).json({ message: 'Password reset successful' });

        } catch (error) {
            console.error('Reset Password Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = authController;
