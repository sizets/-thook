const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../mongo');


const JWT_SECRET = 'randomsecretkey12345'; // Move to env in production

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
            const dbInstance = await db;
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
            const dbInstance = await db;
            await dbInstance.collection('subscribers').insertOne({
                email,
                createdAt: new Date()
            });
            return res.status(200).json({ message: 'Subscribed successfully' });
        } catch (error) {
            console.error('Subscribe Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = authController;
