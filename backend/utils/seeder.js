import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Wishlist from '../models/Wishlist.js';

dotenv.config();

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fitness & Outdoors',
    slug: 'fitness-outdoors',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
  }
];

const productsData = [
  // Electronics
  {
    title: 'AcousticMax Wireless Noise Cancelling Headphones',
    description: 'Immerse yourself in pure high-fidelity sound. Features active hybrid noise cancellation (ANC), 40-hour battery life, fast charging capabilities, and dual soft leather ear cups for ergonomic all-day comfort. Experience deeper bass and clear high-frequency notes.',
    price: 189.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Electronics',
    stock: 25,
    featured: true,
    ratings: 4.8,
    numReviews: 2
  },
  {
    title: 'Precision Chronograph Smart Watch v4',
    description: 'Track your vital analytics with styling. Incorporates a gorgeous 1.4-inch AMOLED display, dynamic blood-oxygen monitoring, continuous heart rate trackers, 15 dedicated sport modes, offline GPS routing, and fully integrated sleep tracking metrics.',
    price: 149.50,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Electronics',
    stock: 15,
    featured: true,
    ratings: 4.5,
    numReviews: 0
  },
  // Fashion
  {
    title: 'Apex Aero Knit Performance Running Shoes',
    description: 'Engineered lightweight trainers featuring responsive double-density EVA midsoles, breathable high-airflow woven mesh knit, and high-traction rubber outsole layouts. Perfect for road marathons, sprint training, and modern style statements.',
    price: 110.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Fashion & Apparel',
    stock: 30,
    featured: true,
    ratings: 4.6,
    numReviews: 1
  },
  {
    title: 'Heritage Wool Blend Trench Coat',
    description: 'A timeless silhouette tailored with thick, insulation wool-blend fabric. Features a premium double-breasted button front, waist-cinching matching belt, structured lapels, and interior satin lining to keep you incredibly warm and sharp through freezing seasons.',
    price: 245.00,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Fashion & Apparel',
    stock: 8,
    featured: false,
    ratings: 4.0,
    numReviews: 0
  },
  // Home
  {
    title: 'Minimalist Handwoven Ceramic Table Lamp',
    description: 'Add a subtle touch of organic warmth. Combining an authentic hand-turned beige clay ceramic base and a textured cream linen shade, this lamp provides soft, glare-free ambient lighting for bedside tables, study desks, and modern living rooms.',
    price: 79.99,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Home & Living',
    stock: 12,
    featured: false,
    ratings: 4.7,
    numReviews: 1
  },
  {
    title: 'Abstract Geometric Tufted Area Rug',
    description: 'Warm up hard floors and frame furniture with our luxurious 5x8 ft area rug. Tufted from stain-resistant plush fibers, it showcases high-contrast abstract grid lines that instantly elevate mid-century, scandinavian, or sleek minimalist decor aesthetics.',
    price: 195.00,
    images: [
      'https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Home & Living',
    stock: 6,
    featured: true,
    ratings: 4.9,
    numReviews: 0
  },
  // Fitness
  {
    title: 'High-Density Non-Slip Cork Yoga Mat',
    description: 'A premium, eco-friendly cork mat engineered with an anti-microbial natural cork surface and an ultra-dense TPE bottom layer. Delivers exceptional slip-resistant grip during high-perspiration hot yoga, core pilates, and strength training drills.',
    price: 65.00,
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Fitness & Outdoors',
    stock: 20,
    featured: false,
    ratings: 4.4,
    numReviews: 0
  },
  {
    title: 'Adjustable Dumbbell Weight Set (50 lbs)',
    description: 'Premium space-saving single dumbbell system that adjusts easily from 5 to 50 lbs with a smooth, simple slider lock interface. Fitted with solid steel plates and textured steel handles to facilitate safe and heavy compound bicep curls, chest press, and squat sessions.',
    price: 299.99,
    images: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80'
    ],
    categoryName: 'Fitness & Outdoors',
    stock: 10,
    featured: true,
    ratings: 4.7,
    numReviews: 0
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing database records...');
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Wishlist.deleteMany();
    // Keep users and orders so developer accounts don't get deleted, 
    // or let's delete only if user explicitly wants, but let's keep users/orders for ease of use.

    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Successfully seeded ${createdCategories.length} categories.`);

    console.log('Seeding products...');
    const productsToInsert = [];

    for (const productInfo of productsData) {
      const matchedCategory = createdCategories.find(
        (c) => c.name === productInfo.categoryName
      );

      if (matchedCategory) {
        const { categoryName, ...restProduct } = productInfo;
        productsToInsert.push({
          ...restProduct,
          category: matchedCategory._id
        });
      }
    }

    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${createdProducts.length} products.`);

    console.log('Seeding default coupons...');
    await Coupon.create([
      {
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        expiryDate: new Date('2028-12-31'),
        isActive: true
      },
      {
        code: 'FREESHIP10',
        discountType: 'fixed',
        discountValue: 10,
        expiryDate: new Date('2028-12-31'),
        isActive: true
      }
    ]);
    console.log('Successfully seeded active discount coupons.');

    // Seed mock reviews for first item to make Details look populated
    const mockUser = await User.findOne({});
    if (mockUser) {
      console.log('Found user account. Seeding mock product reviews...');
      await Review.create([
        {
          product: createdProducts[0]._id,
          user: mockUser._id,
          name: mockUser.name,
          rating: 5,
          comment: 'Absolutely outstanding sound quality and noise cancellation! Highly recommend to audiophiles.'
        },
        {
          product: createdProducts[0]._id,
          user: mockUser._id,
          name: mockUser.name,
          rating: 4,
          comment: 'Excellent headphones, battery life easily lasts me a week of daily commutes.'
        },
        {
          product: createdProducts[2]._id,
          user: mockUser._id,
          name: mockUser.name,
          rating: 5,
          comment: 'Super light and bouncy running shoes! Reduced my foot pain significantly.'
        }
      ]);
      
      // Update first product rating stats
      createdProducts[0].numReviews = 2;
      createdProducts[0].ratings = 4.5;
      await createdProducts[0].save();

      createdProducts[2].numReviews = 1;
      createdProducts[2].ratings = 5.0;
      await createdProducts[2].save();

      console.log('Successfully seeded mock product reviews.');
    }

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
