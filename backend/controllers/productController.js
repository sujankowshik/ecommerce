import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { cloudinary, isMockCloudinary } from '../config/cloudinary.js';

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Filters
    const query = {};

    // 1. Text Search (Matches title & description text indexes)
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // 2. Category Filter (Supports Category slugs or ObjectIds)
    if (req.query.category) {
      // Find category by slug first if it's not a mongoose ObjectId
      const isObjectId = req.query.category.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category.toLowerCase() });
        if (cat) {
          query.category = cat._id;
        } else {
          // If category slug is not found, return empty results
          return res.json({ products: [], page, pages: 0, total: 0 });
        }
      }
    }

    // 3. Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // 4. Featured Filter
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }

    // Sorting Modes
    let sortQuery = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'priceAsc':
          sortQuery = { price: 1 };
          break;
        case 'priceDesc':
          sortQuery = { price: -1 };
          break;
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'ratings':
          sortQuery = { ratings: -1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    // Execute queries
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id with its reviews
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
      // Find reviews of the product
      const reviews = await Review.find({ product: product._id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

      res.json({
        ...product.toJSON(),
        reviews
      });
    } else {
      res.status(404);
      next(new Error('Product not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  const { title, description, price, category, stock, images, featured } = req.body;

  if (!title || !price || !category) {
    res.status(400);
    return next(new Error('Title, Price, and Category are required fields.'));
  }

  try {
    // Check if category exists
    const cat = await Category.findById(category);
    if (!cat) {
      res.status(404);
      return next(new Error('Invalid category identifier.'));
    }

    const product = await Product.create({
      title,
      description: description || '',
      price,
      images: images || [],
      category,
      stock: stock || 0,
      featured: featured === true || featured === 'true'
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  const { title, description, price, category, stock, images, featured } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.description = description !== undefined ? description : product.description;
      product.price = price !== undefined ? price : product.price;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images !== undefined ? images : product.images;
      product.featured = featured !== undefined ? (featured === true || featured === 'true') : product.featured;

      if (category) {
        const cat = await Category.findById(category);
        if (!cat) {
          res.status(404);
          return next(new Error('Category not found.'));
        }
        product.category = category;
      }

      const updatedProduct = await Product.findByIdAndUpdate(product._id, product, { new: true });
      res.json(updatedProduct);
    } else {
      res.status(404);
      next(new Error('Product not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(product._id);
      // Delete associated reviews
      await Review.deleteMany({ product: product._id });
      res.json({ message: 'Product and associated reviews deleted.' });
    } else {
      res.status(404);
      next(new Error('Product not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    return next(new Error('Rating (1-5) and comment are required.'));
  }

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already reviewed
      const alreadyReviewed = await Review.findOne({
        product: product._id,
        user: req.user._id
      });

      if (alreadyReviewed) {
        res.status(400);
        return next(new Error('You have already submitted a review for this product.'));
      }

      // Create new review
      const review = await Review.create({
        product: product._id,
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
      });

      // Recalculate average rating & review count for the product
      const reviews = await Review.find({ product: product._id });
      product.numReviews = reviews.length;
      product.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review successfully created.', review });
    } else {
      res.status(404);
      next(new Error('Product not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple product images
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      return next(new Error('Please upload at least one image.'));
    }

    const uploadPromises = req.files.map((file, index) => {
      if (isMockCloudinary) {
        // Return stunning, premium high-res product placeholders from Unsplash
        const placeholders = [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', // Watch
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', // Red Shoe
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', // Headphone
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80', // Camera
          'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80'  // Shoe black
        ];
        const placeholder = placeholders[index % placeholders.length];
        return Promise.resolve(placeholder);
      }

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    res.json({ urls: imageUrls });
  } catch (error) {
    next(error);
  }
};
