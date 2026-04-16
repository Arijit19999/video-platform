import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import config from '../config/index.js';

const users = [
  { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin', orgId: 'demo-org' },
  { name: 'Editor User', email: 'editor@demo.com', password: 'password123', role: 'editor', orgId: 'demo-org' },
  { name: 'Viewer User', email: 'viewer@demo.com', password: 'password123', role: 'viewer', orgId: 'demo-org' },
];

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log('\nSeed complete! Demo accounts:');
    console.log('  admin@demo.com / password123');
    console.log('  editor@demo.com / password123');
    console.log('  viewer@demo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
