require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Service = require('./models/Service');
const defaultServices = require('./config/defaultServices');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env');
    }

    await connectDB();

    // Clear existing data (optional, but good for demo reload)
    await User.deleteMany();
    await Booking.deleteMany();
    await Service.deleteMany();

    console.log('Database cleared.');

    // Seed Admin User
    const adminUser = await User.create({
      name: 'Gulab Admin',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      isVerified: true,
    });

    // Seed Normal Customer User
    const customerUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@gmail.com',
      password: 'customer123',
      isAdmin: false,
      isVerified: true,
    });

    console.log('Users seeded.');

    // Seed Sample Booking
    await Booking.create({
      userId: customerUser._id,
      name: 'Rohan Sharma',
      phone: '6299063855',
      email: customerUser.email,
      address: 'Main Road, Mirgunj, Near HiraLal Cycle',
      serviceType: 'RO Service',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'Pending',
      language: 'en',
    });
    console.log('Sample booking seeded.');

    await Service.insertMany(defaultServices);
    console.log('Services seeded.');

    mongoose.connection.close();
    console.log('Database seeding complete. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
