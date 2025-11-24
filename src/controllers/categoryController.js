const Category = require('../models/categoryModel');

const getCategoriesByBookstore = async (req, res) => {
  try {
    const categories = await Category.find({ bookstore: req.params.bookstoreId });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error });
  }
};

module.exports = {
	getCategoriesByBookstore,
	createCategory
};

