const Order = require('../models/orderModel');   
const Bookstore = require('../models/bookstoreModel');   
const asyncHandler = require('express-async-handler');  

// API: Đặt hàng  
const placeAnOrder = asyncHandler(async (req, res) => {  
  const { bookstore, totalPrice, totalQuantity, detail } = req.body;  
  const userId = req.user.id; // Lấy userId từ middleware xác thực  

  // Kiểm tra xem nhà sách có tồn tại hay không  
  const existingBookstore = await Bookstore.findById(bookstore);  
  if (!existingBookstore) {  
    return res.status(404).json({  
      statusCode: 404,  
      message: 'Không tìm thấy nhà sách',  
      timestamp: Date.now(),  
    });  
  }  

  // Tạo đơn hàng mới và liên kết với userId  
  const newOrder = new Order({  
    bookstore,  
    user: userId, // Gán đơn hàng cho người dùng  
    totalPrice,  
    totalQuantity,  
    detail,  
  });  

  const savedOrder = await newOrder.save();  

  res.status(201).json({  
    statusCode: 201,  
    message: 'Đơn hàng đã được tạo thành công',  
    data: { _id: savedOrder._id },  
    timestamp: Date.now(),  
  });  
});  

// API: Lấy tất cả đơn hàng của người dùng đã xác thực  

//Trước cải tiến
// const getAllOrders = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const start = Date.now(); // ⏱️ bắt đầu tính thời gian


//   try {
//     const orders = await Order.find({ user: userId })
//       .populate('bookstore')
//       .sort({ createdAt: -1 });


//     const end = Date.now(); // ⏱️ kết thúc


//     res.status(200).json({
//       statusCode: 200,
//       message: 'Đã lấy tất cả đơn hàng thành công',
//       data: orders,
//       duration: `${end - start}ms`, // trả thời gian thực hiện API
//       timestamp: end,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       statusCode: 500,
//       message: 'Lỗi nội bộ',
//       timestamp: Date.now(),
//     });
//   }
// });

//Sau cải tiến
const getAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const start = Date.now();


  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;


  try {
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'bookstore',
        select: 'name address image', // chỉ lấy những gì cần dùng
      })
      .select('bookstore totalPrice totalQuantity createdAt') // tránh trả về detail nếu không cần
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    const end = Date.now();


    res.status(200).json({
      statusCode: 200,
      message: 'Đã lấy tất cả đơn hàng thành công',
      data: orders,
      duration: `${end - start}ms`,
      timestamp: end,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Lỗi nội bộ',
      timestamp: Date.now(),
    });
  }
});




module.exports = { placeAnOrder, getAllOrders };