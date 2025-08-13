const connectDB = require('./mongo');
const bcrypt = require('bcryptjs');

// Sample tablet data with diverse, relevant images for each product
const tablets = [
    {
        name: "Apple iPad Pro 12.9-inch",
        description: "The most powerful iPad ever with the M2 chip, 12.9-inch Liquid Retina XDR display, and support for Apple Pencil and Magic Keyboard.",
        price: 1099,
        image: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Premium",
        subCategory: "Pro",
        sizes: ["128GB", "256GB", "512GB", "1TB"],
        date: Date.now(),
        bestseller: true,
        specs: {
            screen: "12.9-inch Liquid Retina XDR",
            processor: "M2 chip",
            storage: "128GB - 1TB",
            connectivity: "Wi-Fi + Cellular"
        }
    },
    {
        name: "Samsung Galaxy Tab S9 Ultra",
        description: "Premium Android tablet with 14.6-inch AMOLED display, Snapdragon 8 Gen 2 processor, and S Pen support.",
        price: 1199,
        image: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Premium",
        subCategory: "Ultra",
        sizes: ["128GB", "256GB", "512GB"],
        date: Date.now(),
        bestseller: true,
        specs: {
            screen: "14.6-inch AMOLED",
            processor: "Snapdragon 8 Gen 2",
            storage: "128GB - 512GB",
            connectivity: "Wi-Fi + 5G"
        }
    },
    {
        name: "Microsoft Surface Pro 9",
        description: "2-in-1 tablet and laptop with 13-inch PixelSense display, Intel Core processors, and Windows 11.",
        price: 999,
        image: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Premium",
        subCategory: "2-in-1",
        sizes: ["128GB", "256GB", "512GB", "1TB"],
        date: Date.now(),
        bestseller: true,
        specs: {
            screen: "13-inch PixelSense",
            processor: "Intel Core i5/i7",
            storage: "128GB - 1TB",
            connectivity: "Wi-Fi + LTE"
        }
    },
    {
        name: "Apple iPad Air",
        description: "Powerful and colorful iPad with M1 chip, 10.9-inch Liquid Retina display, and support for Apple Pencil and Magic Keyboard.",
        price: 599,
        image: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Mid-Range",
        subCategory: "Air",
        sizes: ["64GB", "256GB"],
        date: Date.now(),
        bestseller: true,
        specs: {
            screen: "10.9-inch Liquid Retina",
            processor: "M1 chip",
            storage: "64GB - 256GB",
            connectivity: "Wi-Fi + Cellular"
        }
    },
    {
        name: "Samsung Galaxy Tab S9",
        description: "Premium Android tablet with 11-inch AMOLED display, Snapdragon 8 Gen 2 processor, and S Pen included.",
        price: 799,
        image: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Mid-Range",
        subCategory: "Standard",
        sizes: ["128GB", "256GB"],
        date: Date.now(),
        bestseller: false,
        specs: {
            screen: "11-inch AMOLED",
            processor: "Snapdragon 8 Gen 2",
            storage: "128GB - 256GB",
            connectivity: "Wi-Fi + 5G"
        }
    },
    {
        name: "Lenovo Tab P12 Pro",
        description: "Android tablet with 12.6-inch OLED display, Snapdragon 870 processor, and premium design.",
        price: 649,
        image: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Mid-Range",
        subCategory: "Pro",
        sizes: ["128GB", "256GB"],
        date: Date.now(),
        bestseller: false,
        specs: {
            screen: "12.6-inch OLED",
            processor: "Snapdragon 870",
            storage: "128GB - 256GB",
            connectivity: "Wi-Fi"
        }
    },
    {
        name: "Amazon Fire HD 10",
        description: "Affordable Android tablet with 10.1-inch HD display, quad-core processor, and Alexa integration.",
        price: 149,
        image: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Budget",
        subCategory: "HD",
        sizes: ["32GB", "64GB"],
        date: Date.now(),
        bestseller: false,
        specs: {
            screen: "10.1-inch HD",
            processor: "Quad-core",
            storage: "32GB - 64GB",
            connectivity: "Wi-Fi"
        }
    },
    {
        name: "Apple iPad (10th generation)",
        description: "Colorful iPad with A14 Bionic chip, 10.9-inch Liquid Retina display, and USB-C connector.",
        price: 449,
        image: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center&q=80"
        ],
        category: "Budget",
        subCategory: "Standard",
        sizes: ["64GB", "256GB"],
        date: Date.now(),
        bestseller: false,
        specs: {
            screen: "10.9-inch Liquid Retina",
            processor: "A14 Bionic",
            storage: "64GB - 256GB",
            connectivity: "Wi-Fi + Cellular"
        }
    }
];

async function seedDatabase() {
    try {
        const dbInstance = await connectDB();

        // Clear existing tablets
        await dbInstance.collection('tablets').deleteMany({});
        console.log('Cleared existing tablets');

        // Insert new tablets
        const result = await dbInstance.collection('tablets').insertMany(tablets);
        console.log(`Inserted ${result.insertedCount} tablets`);

        // Create text index for search functionality
        await dbInstance.collection('tablets').createIndex({
            name: "text",
            description: "text"
        });
        console.log('Created text index for search');

        // Create admin user if it doesn't exist
        await createAdminUser(dbInstance);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Function to create admin user
async function createAdminUser(dbInstance) {
    try {
        // Check if admin already exists
        const existingAdmin = await dbInstance.collection('users').findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists, skipping creation');
            return;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

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

        await dbInstance.collection('users').insertOne(adminUser);
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: admin123');
        console.log('⚠️  Remember to change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
}

seedDatabase();
