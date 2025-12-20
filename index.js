/** @format */
const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routes/authRouter');
const errorMiddleHandle = require('./src/middleware/errorMiddleware');
const connectDB = require('./src/config/connectDb');
const path = require('path');
const bookstoreRouter = require('./src/routes/bookstoreRouter');
const orderRouter = require('./src/routes/orderRouter');
const userRouter = require('./src/routes/userRouter');
const likeRouter = require('./src/routes/likeRouter');
const notificationRouter = require('./src/routes/notificationRouter');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use('/auth', authRouter);
app.use('/bookstore', bookstoreRouter);
app.use('/order', orderRouter);
app.use('/user', userRouter);
app.use('/like', likeRouter);
app.use('/notification', notificationRouter);

app.use('/images', express.static(path.join(__dirname, '/src/public/images')));

// Error middleware phải được đặt sau tất cả các routes
app.use(errorMiddleHandle);

connectDB();


app.listen(PORT, "0.0.0.0", (err) => {
	if (err) {
		console.log(err);
		return;
	}

	console.log(`Server running at http://0.0.0.0:${PORT}`);
});
