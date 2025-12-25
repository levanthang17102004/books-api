/** @format */

/**
 * ==============================
 * IMPORT THƯ VIỆN / MODULE
 * ==============================
 */
const UserModel = require('../models/userModel'); // Model người dùng (MongoDB/Mongoose)
const bcryp = require('bcrypt'); // Thư viện mã hoá mật khẩu
const asyncHandle = require('express-async-handler'); // Bắt lỗi async cho express route handler
const jwt = require('jsonwebtoken'); // Tạo/verify JWT token
const nodemailer = require('nodemailer'); // Gửi email
require('dotenv').config(); // Đọc biến môi trường từ file .env

/**
 * ==============================
 * CẤU HÌNH GỬI EMAIL (NODEMAILER)
 * ==============================
 * Dùng Gmail SMTP:
 * - host: smtp.gmail.com
 * - port 465 (SSL)
 * - secure: true
 * Lưu ý: EMAIL_USER và EMAIL_PASSWORD phải tồn tại trong .env
 */
const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER, // Email gửi
		pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng/app password (khuyến nghị)
	},
});

/**
 * ==============================
 * HÀM TẠO JSON WEB TOKEN
 * ==============================
 * @param {string} email - email user
 * @param {string} id - id user
 * @returns {string} token JWT có hạn 7 ngày
 */
const getJsonWebToken = async (email, id) => {
	const payload = {
		email,
		id,
	};

	// Tạo token bằng SECRET_KEY trong .env
	const token = jwt.sign(payload, process.env.SECRET_KEY, {
		expiresIn: '7d',
	});

	return token;
};

/**
 * ==============================
 * HÀM GỬI EMAIL CHUNG
 * ==============================
 * @param {object} val - cấu hình sendMail (from, to, subject, text/html,...)
 * @returns {'OK' | error}
 */
const handleSendMail = async (val) => {
	try {
		await transporter.sendMail(val);
		return 'OK';
	} catch (error) {
		return error;
	}
};

/**
 * ==============================
 * API: ĐĂNG KÝ TÀI KHOẢN (REGISTER)
 * ==============================
 * - Nhận email, name, password từ req.body
 * - Kiểm tra email đã tồn tại chưa
 * - Mã hoá mật khẩu bằng bcrypt
 * - Tạo mã xác thực (OTP 6 số) + thời hạn 10 phút
 * - Lưu user vào DB
 * - Gửi OTP qua email
 */
const register = asyncHandle(async (req, res) => {
	const { email, name, password } = req.body;

	// 1) Kiểm tra xem email đã tồn tại trong DB chưa
	const existingUser = await UserModel.findOne({ email });

	if (existingUser) {
		// Trả lỗi 400 nếu email đã tồn tại
		res.status(400).json({
			message: 'Email đã tồn tại. Vui lòng sử dụng email khác!',
		});
		throw new Error('User already exists!');
	}

	// 2) Hash mật khẩu
	const salt = await bcryp.genSalt(10);
	const hashedPassword = await bcryp.hash(password, salt);

	// 3) Tạo mã xác thực 6 số và thời gian hết hạn (10 phút)
	const verificationCode = Math.floor(100000 + Math.random() * 900000);
	const expirationTime = Date.now() + 10 * 60 * 1000; // 10 phút

	// 4) Tạo user mới và lưu vào DB (kèm mã xác thực)
	const newUser = new UserModel({
		email,
		name,
		password: hashedPassword,
		verificationCode,
		verificationExpires: new Date(expirationTime),
	});

	await newUser.save();

	// 5) Tạo nội dung email gửi mã xác thực
	const emailData = {
		from: `"Bookstore App" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: 'Your Verification Code - Bookstore App',
		text: 'Your code to verify your email',
		html: `<p>Your verification code is: <strong>${verificationCode}</strong>. This code is valid for 10 minutes.</p>`,
	};

	// 6) Gửi email
	await handleSendMail(emailData);

	// 7) Trả response
	res.status(200).json({
		message: 'Register new user successfully. Verification code sent!',
		data: {
			email: newUser.email,
		},
	});
});

/**
 * ==============================
 * API: XÁC THỰC EMAIL (VERIFICATION)
 * ==============================
 * - Nhận email và code từ req.body
 * - Tìm user theo email
 * - Kiểm tra:
 *   + user có tồn tại không
 *   + user có mã OTP và thời hạn OTP không
 *   + OTP đã hết hạn chưa
 *   + code nhập vào có đúng không
 * - Nếu đúng: set isVerified = true, xoá code và expires
 */
const verification = asyncHandle(async (req, res) => {
	const { email, code } = req.body;

	// 1) Tìm người dùng theo email
	const user = await UserModel.findOne({ email });

	// 2) Nếu không thấy user
	if (!user) {
		return res.status(404).json({
			success: false,
			message: 'User not found.',
		});
	}

	// 3) Nếu user không có mã xác thực hoặc thời hạn
	if (!user.verificationCode || !user.verificationExpires) {
		return res.status(400).json({
			success: false,
			message: 'Verification code not found. Please request a new code.',
		});
	}

	// 4) Kiểm tra hết hạn OTP (so sánh thời gian)
	if (user.verificationExpires < Date.now()) {
		return res.status(400).json({
			success: false,
			message: 'Verification code has expired. Please request a new code.',
		});
	}

	// 5) Kiểm tra code có đúng không (code gửi là số)
	if (user.verificationCode !== parseInt(code)) {
		return res.status(400).json({
			success: false,
			message: 'Incorrect verification code.',
		});
	}

	// 6) Nếu đúng: cập nhật trạng thái xác thực
	user.isVerified = true;
	user.verificationCode = null;
	user.verificationExpires = null;

	await user.save();

	// 7) Trả response
	res.status(200).json({
		success: true,
		message: 'Email verified successfully!',
		data: {
			id: user._id,
			email: user.email,
		},
	});
});

/**
 * ==============================
 * API: ĐĂNG NHẬP (LOGIN)
 * ==============================
 * - Nhận email, password từ req.body
 * - (Tuỳ chọn) đọc header 'delay' để tạo độ trễ giả lập
 * - Tìm user theo email
 * - So sánh password với bcrypt.compare
 * - Lưu lịch sử đăng nhập (ip, user-agent, timestamp)
 * - Trả về thông tin user + access token
 */
const login = asyncHandle(async (req, res) => {
	const { email, password } = req.body;

	// 1) Thêm Delay từ Header (nếu client gửi) => phục vụ test
	const delay = req.headers['delay'];
	if (delay) {
		await new Promise((resolve) => setTimeout(resolve, parseInt(delay, 10)));
	}

	// 2) Tìm user theo email
	const existingUser = await UserModel.findOne({ email });

	// 3) Không tìm thấy user
	if (!existingUser) {
		return res.status(403).json({
			message: 'User not found!',
		});
	}

	// 4) (Tuỳ chọn) kiểm tra trạng thái tài khoản (đang comment)
	// if (!existingUser.isActive) {
	//     return res.status(403).json({
	//         message: 'Account is not active. Please verify your email or contact support!',
	//     });
	// }

	// 5) So sánh mật khẩu
	const isMatchPassword = await bcryp.compare(password, existingUser.password);

	// 6) Nếu mật khẩu sai
	if (!isMatchPassword) {
		return res.status(401).json({
			message: 'Email or Password is not correct!',
		});
	}

	// 7) Lưu lịch sử đăng nhập (phục vụ audit/monitor)
	const loginHistory = {
		ip: req.ip,
		userAgent: req.headers['user-agent'],
		timestamp: new Date(),
	};

	existingUser.loginHistory = existingUser.loginHistory || [];
	existingUser.loginHistory.push(loginHistory);

	await existingUser.save();

	// 8) Trả về thông tin user và token
	res.status(200).json({
		message: 'Login successfully',
		data: {
			user: {
				id: existingUser.id,
				email: existingUser.email,
				fcmTokens: existingUser.fcmTokens ?? [],
				photo: existingUser.photoUrl ?? '',
				phone: existingUser.phone ?? '',
				name: existingUser.name ?? '',
				address: existingUser.address ?? '',
			},
			accesstoken: await getJsonWebToken(email, existingUser.id),
		},
	});
});

/**
 * ==============================
 * API: QUÊN MẬT KHẨU (FORGOT PASSWORD)
 * ==============================
 * - Nhận email
 * - Tạo mật khẩu random (dạng số)
 * - Hash mật khẩu mới và update vào DB
 * - Gửi mật khẩu mới qua email
 *
 * Lưu ý bảo mật:
 * - Cách này gửi mật khẩu thẳng qua email => không khuyến nghị.
 * - Nên dùng reset token + link đổi mật khẩu.
 */
const forgotPassword = asyncHandle(async (req, res) => {
	const { email } = req.body;

	// 1) Tạo mật khẩu mới ngẫu nhiên (số)
	const randomPassword = Math.round(100000 + Math.random() * 99000);

	// 2) Dữ liệu email gửi mật khẩu mới
	const data = {
		from: `<${process.env.USERNAME_EMAIL}>`, // chú ý biến env này khác EMAIL_USER
		to: email,
		subject: 'Mật khẩu mới',
		text: 'Mật khẩu mới của bạn là: ',
		html: `<h1>${randomPassword}</h1>. Vui lòng không chia sẻ với ai.`,
	};

	// 3) Tìm user theo email
	const user = await UserModel.findOne({ email });

	if (user) {
		// 4) Hash mật khẩu mới
		const salt = await bcryp.genSalt(10);
		const hashedPassword = await bcryp.hash(`${randomPassword}`, salt);

		// 5) Update mật khẩu mới + đánh dấu đã đổi mật khẩu
		await UserModel.findByIdAndUpdate(user._id, {
			password: hashedPassword,
			isChangePassword: true,
		})
			.then(() => {
				console.log('Đã hoàn thành');
			})
			.catch((error) => {
				console.log(error);
				return res.status(500).json({
					message: 'Đã xảy ra lỗi khi cập nhật mật khẩu!',
				});
			});

		// 6) Gửi email mật khẩu mới
		await handleSendMail(data)
			.then(() => {
				res.status(200).json({
					message: 'Gửi email mật khẩu mới thành công!!!',
					data: [],
				});
			})
			.catch((error) => {
				console.log(error);
				res.status(500).json({
					message: 'Không thể gửi email',
				});
			});
	} else {
		// 7) Nếu không có user
		res.status(404).json({
			message: 'Không tìm thấy người dùng!!!',
		});
	}
});

/**
 * ==============================
 * API: LẤY THÔNG TIN TÀI KHOẢN (GET ACCOUNT)
 * ==============================
 * - req.user.email thường được middleware auth gắn vào (sau khi verify token)
 * - tìm user theo email rồi trả về dữ liệu
 */
const getAccount = async (req, res) => {
	const user = await UserModel.findOne({ email: req.user.email });

	// Nếu không có user
	if (!user)
		return res.status(404).json({
			success: false,
			message: 'User not found',
		});

	// Trả dữ liệu tài khoản
	res.status(200).json({
		success: true,
		message: 'User account retrieved successfully',
		data: {
			id: user.id,
			email: user.email,
			fcmTokens: user.fcmTokens ?? [],
			photo: user.photoUrl ?? '',
			phone: user.phone ?? '',
			name: user.name ?? '',
			address: user.address ?? '',
		},
	});
};

/**
 * ==============================
 * API: ĐĂNG NHẬP BẰNG GOOGLE
 * ==============================
 * - Nhận userInfo từ req.body (email, name, ...)
 * - Nếu đã tồn tại user:
 *   + update updatedAt
 *   + tạo token và trả về
 * - Nếu chưa có:
 *   + tạo user mới, save
 *   + tạo token và trả về
 *
 * Lưu ý: đoạn này có chỗ dùng userInfo.id để tạo token (có thể sai),
 * thường nên dùng existingUser.id hoặc newUser.id.
 */
const handleLoginWithGoogle = asyncHandle(async (req, res) => {
	const userInfo = req.body;

	const existingUser = await UserModel.findOne({ email: userInfo.email });
	let user;

	if (existingUser) {
		// Nếu user đã tồn tại -> cập nhật thời gian
		await UserModel.findByIdAndUpdate(existingUser.id, {
			updatedAt: Date.now(),
		});

		// Clone user
		user = { ...existingUser };

		// Tạo token (LƯU Ý: userInfo.id có thể không đúng)
		user.accesstoken = await getJsonWebToken(userInfo.email, userInfo.id);

		if (user) {
			const data = {
				accesstoken: user.accesstoken,
				id: existingUser._id,
				email: existingUser.email,
				fcmTokens: existingUser.fcmTokens,
				photo: existingUser.photoUrl,
				name: existingUser.name,
			};

			res.status(200).json({
				message: 'Login with google successfully!!!',
				data,
			});
		} else {
			res.sendStatus(401);
			throw new Error('fafsf');
		}
	} else {
		// Nếu chưa có user -> tạo mới
		const newUser = new UserModel({
			email: userInfo.email,
			fullname: userInfo.name,
			...userInfo,
		});

		await newUser.save();

		user = { ...newUser };
		user.accesstoken = await getJsonWebToken(userInfo.email, newUser.id);

		if (user) {
			res.status(200).json({
				message: 'Login with google successfully!!!',
				data: {
					accesstoken: user.accesstoken,
					id: user._id,
					email: user.email,
					fcmTokens: user.fcmTokens,
					photo: user.photoUrl,
					name: user.name,
				},
			});
		} else {
			res.sendStatus(401);
			throw new Error('fafsf');
		}
	}
});

/**
 * ==============================
 * EXPORT CÁC HÀM CONTROLLER
 * ==============================
 */
module.exports = {
	register,
	login,
	verification,
	forgotPassword,
	getAccount,
	handleLoginWithGoogle,
};
