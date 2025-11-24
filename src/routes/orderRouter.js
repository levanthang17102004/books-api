const Router = require('express');
const { placeAnOrder, getAllOrders } = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');
const orderRouter = Router();

orderRouter.post('/',verifyToken, placeAnOrder);
orderRouter.get('/',verifyToken, getAllOrders);

module.exports = orderRouter;
