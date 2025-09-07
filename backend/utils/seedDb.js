const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    try {
      await mongoose.connection.db.collection('users').drop();
    } catch (e) { /* Collection may not exist */ }
    try {
      await mongoose.connection.db.collection('stores').drop();
    } catch (e) { /* Collection may not exist */ }
    try {
      await mongoose.connection.db.collection('ratings').drop();
    } catch (e) { /* Collection may not exist */ }
    console.log('Cleared existing data');

    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'Admin123!',
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'admin'
    });
    await admin.save();
    console.log('Created admin user');

    // Create store owners
    const storeOwner1 = new User({
      name: 'John Store Owner Smith',
      email: 'owner@example.com',
      password: 'Owner123!',
      address: '456 Store Owner Ave, Business District, BD 67890',
      role: 'storeOwner'
    });
    await storeOwner1.save();

    const storeOwner2 = new User({
      name: 'Jane Store Manager Jones',
      email: 'jane.owner@example.com',
      password: 'Owner123!',
      address: '789 Commerce Blvd, Trade Center, TC 11111',
      role: 'storeOwner'
    });
    await storeOwner2.save();
    console.log('Created store owner users');

    // Create normal users
    const user1 = new User({
      name: 'Alice Regular Customer',
      email: 'user@example.com',
      password: 'User123!',
      address: '321 User Lane, Customer City, CC 22222',
      role: 'user'
    });
    await user1.save();

    const user2 = new User({
      name: 'Bob Shopping Expert',
      email: 'bob.user@example.com',
      password: 'User123!',
      address: '654 Shopping Mall Rd, Retail Town, RT 33333',
      role: 'user'
    });
    await user2.save();

    const user3 = new User({
      name: 'Carol Review Writer',
      email: 'carol.user@example.com',
      password: 'User123!',
      address: '987 Review Street, Opinion City, OC 44444',
      role: 'user'
    });
    await user3.save();
    console.log('Created normal users');

    // Create stores
    const store1 = new Store({
      name: 'Tech Electronics Superstore',
      email: 'contact@techelectronics.com',
      address: '100 Technology Drive, Silicon Valley, SV 55555',
      ownerId: storeOwner1._id
    });
    await store1.save();

    const store2 = new Store({
      name: 'Fashion Forward Boutique',
      email: 'hello@fashionforward.com',
      address: '200 Style Avenue, Fashion District, FD 66666',
      ownerId: storeOwner2._id
    });
    await store2.save();
    console.log('Created stores');

    // Update store owners with their store IDs
    storeOwner1.storeId = store1._id;
    await storeOwner1.save();
    storeOwner2.storeId = store2._id;
    await storeOwner2.save();

    // Create ratings
    const rating1 = new Rating({
      userId: user1._id,
      storeId: store1._id,
      rating: 5,
      comment: 'Amazing selection of electronics! Great customer service and competitive prices.'
    });
    await rating1.save();

    const rating2 = new Rating({
      userId: user2._id,
      storeId: store1._id,
      rating: 4,
      comment: 'Good store with quality products. Could improve checkout speed.'
    });
    await rating2.save();

    const rating3 = new Rating({
      userId: user3._id,
      storeId: store2._id,
      rating: 5,
      comment: 'Love their fashion collection! Always up-to-date with latest trends.'
    });
    await rating3.save();

    const rating4 = new Rating({
      userId: user1._id,
      storeId: store2._id,
      rating: 3,
      comment: 'Decent fashion store but prices are a bit high for the quality.'
    });
    await rating4.save();

    console.log('Created sample ratings');

    // Update store ratings
    await store1.updateRating();
    await store2.updateRating();
    console.log('Updated store ratings');

    console.log('\n=== Seeding completed successfully! ===');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / Admin123!');
    console.log('Store Owner: owner@example.com / Owner123!');
    console.log('User: user@example.com / User123!');
    console.log('\nDatabase seeded with:');
    console.log('- 1 Admin user');
    console.log('- 2 Store owners');
    console.log('- 3 Regular users');
    console.log('- 2 Stores');
    console.log('- 4 Sample ratings');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
