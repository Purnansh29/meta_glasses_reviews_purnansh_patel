const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: './.env' });

// Load models
const User = require('../models/User');
const Country = require('../models/Country');
const Review = require('../models/Review');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/meta-reviews');

// Import into DB
const importData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Country.deleteMany();
    await Review.deleteMany();
    console.log('Database cleared.');

    // Load dataset JSON
    const rawData = fs.readFileSync('./dataset.json', 'utf-8');
    const dataset = JSON.parse(rawData);
    console.log(`Loaded ${dataset.length} records from dataset.json`);

    // 1. Create Countries
    const countriesData = [
      { name: 'United States', code: 'USA' },
      { name: 'India', code: 'IND' },
      { name: 'Canada', code: 'CAN' },
      { name: 'United Kingdom', code: 'GBR' },
      { name: 'Germany', code: 'DEU' }
    ];
    const seededCountries = await Country.insertMany(countriesData);
    console.log(`${seededCountries.length} countries seeded.`);

    // Map country name -> country doc
    const countryMap = {};
    seededCountries.forEach(c => {
      countryMap[c.name] = c;
    });

    // 2. Identify Unique Users & Profiles
    const userMap = new Map();
    dataset.forEach(item => {
      if (item.name) {
        const key = item.name.trim();
        if (!userMap.has(key)) {
          userMap.set(key, {
            name: key,
            profile: item.profile ? item.profile.trim() : ''
          });
        }
      }
    });

    console.log(`Found ${userMap.size} unique users in dataset.`);

    // Generate emails and passwords for unique users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersData = [];
    let idx = 0;
    for (const [name, info] of userMap.entries()) {
      // Create clean email
      const emailName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${emailName || 'user' + idx}@meta.com`;
      
      // Assign HebeZ and Karla silva as admins
      const role = (name === 'HebeZ' || name === 'Karla silva') ? 'admin' : 'user';

      usersData.push({
        name,
        profile: info.profile,
        email,
        password: hashedPassword, // Pre-hashed to bypass save hooks for speed
        role
      });
      idx++;
    }

    const seededUsers = await User.insertMany(usersData);
    console.log(`${seededUsers.length} users seeded.`);

    // Map username -> user doc
    const userDocMap = {};
    seededUsers.forEach(u => {
      userDocMap[u.name] = u;
    });

    // 3. Create Reviews
    console.log('Mapping reviews...');
    const countryList = ['United States', 'India', 'Canada', 'United Kingdom', 'Germany'];
    const deviceList = ['Ray-Ban Meta Wayfarer', 'Ray-Ban Meta Headliner', 'Ray-Ban Meta Smart Glasses'];

    const seenReviewIDs = new Set();
    const reviewsToSeed = [];

    dataset.forEach((item, index) => {
      let reviewID = item.reviewID ? item.reviewID.trim() : '';
      if (!reviewID) {
        reviewID = `REV-${index}-${Math.floor(Math.random() * 100000)}`;
      }

      if (seenReviewIDs.has(reviewID)) {
        reviewID = `${reviewID}-${index}`;
      }
      seenReviewIDs.add(reviewID);

      // Find corresponding user doc
      const userNameKey = item.name ? item.name.trim() : '';
      const userDoc = userDocMap[userNameKey] || seededUsers[index % seededUsers.length];

      // Distribute countries: 75% USA, 10% India, 5% Canada, 5% UK, 5% Germany
      let countryName = 'United States';
      const rand = Math.random();
      if (rand < 0.75) {
        countryName = 'United States';
      } else if (rand < 0.85) {
        countryName = 'India';
      } else if (rand < 0.90) {
        countryName = 'Canada';
      } else if (rand < 0.95) {
        countryName = 'United Kingdom';
      } else {
        countryName = 'Germany';
      }
      const countryDoc = countryMap[countryName];

      // Parse date: e.g. "March 9, 2025" or fallback to now
      let parsedDate = new Date();
      if (item.date) {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          parsedDate = d;
        }
      }

      // Distribute verifiedPurchase: 90% true, 10% false
      const verifiedPurchase = Math.random() < 0.9;

      // Parse rating
      const rating = parseFloat(item.rating) || 5.0;

      // Determine positive
      const isPositive = rating >= 4.0;

      // Determine deviceName
      let deviceName = 'Ray-Ban Meta Smart Glasses';
      const text = `${item.title} ${item.review}`.toLowerCase();
      if (text.includes('wayfarer')) {
        deviceName = 'Ray-Ban Meta Wayfarer';
      } else if (text.includes('headliner')) {
        deviceName = 'Ray-Ban Meta Headliner';
      } else {
        // Randomly assign one of the three
        deviceName = deviceList[Math.floor(Math.random() * deviceList.length)];
      }

      reviewsToSeed.push({
        reviewID,
        user: userDoc._id,
        country: countryDoc._id,
        date: parsedDate,
        verifiedPurchase,
        rating,
        helpful: parseInt(item.helpful) || 0,
        helpful_aug: parseInt(item.helpful_aug) || 0,
        title: item.title || 'Review Title',
        review: item.review || 'No review content provided.',
        profile: item.profile || '',
        reviewLink: item.reviewLink || '',
        reviewImage: item.reviewImage || '',
        is_positive_review: isPositive,
        helpfulness_score: parseFloat(item.helpfulness_score) || 0.0,
        deviceName
      });
    });

    console.log('Inserting reviews...');
    // Seed in chunks of 2000 to prevent memory overhead
    const chunkSize = 2000;
    for (let i = 0; i < reviewsToSeed.length; i += chunkSize) {
      const chunk = reviewsToSeed.slice(i, i + chunkSize);
      await Review.insertMany(chunk);
      console.log(`Inserted chunk ${i / chunkSize + 1} (${chunk.length} reviews)...`);
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    console.log('Clearing database...');
    await User.deleteMany();
    await Country.deleteMany();
    await Review.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (err) {
    console.error('Error destroying data:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
