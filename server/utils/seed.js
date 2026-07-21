const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Location = require('../models/Location');
const CanteenItem = require('../models/CanteenItem');

dotenv.config({ path: '../.env' });

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-navigator');

  const adminUser = await User.findOneAndUpdate(
    { email: 'admin@campus.com' },
    {
      name: 'Admin User',
      email: 'admin@campus.com',
      passwordHash: '$2a$10$QwZrYj5gU8DPhwUgBChC1uY5Q5b7vN5neD/8pJjLlYgHc9wO9nqnm',
      role: 'admin',
    },
    { upsert: true, new: true }
  );

  await Location.deleteMany({});
  await CanteenItem.deleteMany({});

  await Location.create([
    {
      name: 'Main Lecture Hall',
      type: 'classroom',
      building: 'Block A',
      floor: 1,
      coordinates: { x: 20, y: 40 },
      description: 'Large lecture hall for first-year classes.',
      createdBy: adminUser._id,
    },
    {
      name: 'Engineering Lab',
      type: 'lab',
      building: 'Block B',
      floor: 2,
      coordinates: { x: 60, y: 25 },
      description: 'Computer and electronics lab.',
      createdBy: adminUser._id,
    },
  ]);

  await CanteenItem.create([
    { name: 'Veg Sandwich', price: 45, status: 'available', category: 'Snacks', lastUpdatedBy: adminUser._id },
    { name: 'Paneer Wrap', price: 70, status: 'limited', category: 'Meals', lastUpdatedBy: adminUser._id },
  ]);

  console.log('Seed complete');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
