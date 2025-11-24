const Bookstore = require('../models/bookstoreModel');
const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel'); 
const Book = require('../models/bookModel');

const getBookstores = async (req, res) => {
  try {
    const bookstores = await Bookstore.find();
    res.status(200).json(bookstores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookstores', error });
  }
};

const topRatingBookstores = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.body;

  const bookstores = await Bookstore.find({ isActive: true })
    .sort({ rating: -1 })
    .limit(parseInt(limit, 10)); 

  if (!bookstores || bookstores.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'No top-rated bookstores found.' 
    });
  }

  res.status(200).json({
    success: true,
    message: 'Top Bookstore Rating 5*.',
    data: bookstores,
  });
});

const newCommerBookstores = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.body; 

  const bookstores = await Bookstore.find({ isActive: true })
    .sort({ createdAt: -1 }) 
    .limit(parseInt(limit, 10));

  if (!bookstores || bookstores.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No new bookstores found.',
    });
  }

  res.status(200).json({
    success: true,
    message: 'List of newcomer bookstores.',
    data: bookstores,
  });
});

const topFreeshipBookstores = asyncHandler(async (req, res) => {
  const bookstores = await Bookstore.find({ isActive: true })
    .sort({ rating: -1 }); 

  if (!bookstores || bookstores.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No top freeship bookstores found.',
    });
  }

  res.status(200).json({
    success: true,
    message: 'List of top freeship bookstores.',
    data: bookstores,
  });
});

// Fetch a bookstore by ID  
const getBookstoreById = async (req, res) => {  
  try {  
    const bookstoreId = req.params.id;  

    // Tìm nhà sách theo ID  
    const bookstore = await Bookstore.findById(bookstoreId);  
    if (!bookstore) {  
      return res.status(404).json({  
        statusCode: 404,  
        message: 'Bookstore not found',  
        data: null,  
      });  
    }  

    // Lấy danh sách category của nhà sách này  
    const categories = await Category.find({ bookstore: bookstoreId });  

    // Tạo một danh sách hứng chứa book cho từng category  
    const categoryPromises = categories.map(async (category) => {  
      const books = await Book.find({ category: category._id });  
      return {  
        _id: category._id,  
        bookstore: category.bookstore,  
        title: category.title,  
        createdAt: category.createdAt,  
        updatedAt: category.updatedAt,  
        __v: 0, 
        book: books.map(item => ({  
          _id: item._id,  
          category: item.category,  
          title: item.title,  
          description: item.description || '',
          basePrice: item.basePrice,  
          image: item.image,  
          options: item.options,  
          createdAt: item.createdAt,  
          updatedAt: item.updatedAt,  
          __v: 0,  
        })),  
      };  
    });  

    // Chờ đợi tất cả promises trong categoryPromises  
    const categoryWithBooks = await Promise.all(categoryPromises);  

    // Chuyển đổi dữ liệu để phù hợp với định dạng yêu cầu  
    const responseData = {  
      _id: bookstore._id,  
      name: bookstore.name,  
      phone: bookstore.phone,  
      address: bookstore.address,  
      email: bookstore.email,  
      rating: bookstore.rating,  
      image: bookstore.image,  
      isActive: bookstore.isActive,  
      createdAt: bookstore.createdAt,  
      updatedAt: bookstore.updatedAt,  
      __v: 0, 
      category: categoryWithBooks,  
    };  

    res.status(200).json({  
      statusCode: 200,  
      message: 'Fetch a bookstore by id',  
      data: responseData,  
    });  
  } catch (error) {  
    console.error(error);  
    res.status(500).json({  
      statusCode: 500,  
      message: 'An error occurred while fetching the bookstore',  
      data: null,  
    });  
  }  
};  

// Tìm kiếm nhà sách theo tên với phân trang
const getBookstoresByName = asyncHandler(async (req, res) => {
  const { current = 1, pageSize = 10, name = "" } = req.query;

  try {
    // Chuyển đổi current và pageSize sang số nguyên
    const currentPage = parseInt(current, 10);
    const size = parseInt(pageSize, 10);

    // Tạo regex tìm kiếm theo tên
    const nameRegex = new RegExp(name, 'i');

    // Tìm nhà sách theo tên và phân trang
    const bookstores = await Bookstore.find({ name: { $regex: nameRegex } })
      .skip((currentPage - 1) * size)
      .limit(size);

    // Tổng số nhà sách phù hợp
    const total = await Bookstore.countDocuments({ name: { $regex: nameRegex } });

    // Số trang tính toán
    const pages = Math.ceil(total / size);

    res.status(200).json({
      statusCode: 200,
      message: 'Fetch bookstores',
      data: {
        meta: {
          current: currentPage,
          pageSize: size,
          pages,
          total,
        },
        results: bookstores,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'An error occurred while fetching bookstores',
    });
  }
});


module.exports = {
	getBookstores,
  topRatingBookstores,
  newCommerBookstores,
  topFreeshipBookstores,
  getBookstoreById,
  getBookstoresByName
    
};

