const Book = require('../models/bookModel');

const getBooksByCategory = async (req, res) => {
  try {
    const books = await Book.find({ category: req.params.categoryId });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
};

module.exports = {
	getBooksByCategory
};

