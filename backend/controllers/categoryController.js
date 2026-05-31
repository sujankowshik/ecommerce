import Category from '../models/Category.js';

// Helper to slugify a name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  const { name, image } = req.body;

  if (!name) {
    res.status(400);
    return next(new Error('Category name is required.'));
  }

  try {
    const slug = slugify(name);
    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      res.status(400);
      return next(new Error('Category with this name or slug already exists.'));
    }

    const category = await Category.create({
      name,
      slug,
      image: image || ''
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  const { name, image } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      if (name) {
        category.slug = slugify(name);
      }
      category.image = image !== undefined ? image : category.image;

      const updatedCategory = await Category.findByIdAndUpdate(category._id, category, { new: true });
      res.json(updatedCategory);
    } else {
      res.status(404);
      next(new Error('Category not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.findByIdAndDelete(category._id);
      res.json({ message: 'Category deleted successfully.' });
    } else {
      res.status(404);
      next(new Error('Category not found.'));
    }
  } catch (error) {
    next(error);
  }
};
