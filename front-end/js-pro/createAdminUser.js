const bcrypt = require('bcryptjs');
const connectDB = require('./mongo');

// Create admin user function
const createAdminUser = async () => {
    try {
        const dbInstance = await connectDB();

        // Check if admin already exists
        const existingAdmin = await dbInstance.collection('users').findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const adminUser = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            phone: '+1234567890',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await dbInstance.collection('users').insertOne(adminUser);
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: admin123');
        console.log('⚠️  Remember to change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        // Close database connection
        process.exit(0);
    }
};

// Run the script
createAdminUser();
