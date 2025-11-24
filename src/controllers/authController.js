/** @format */

const UserModel = require('../models/userModel');
const bcryp = require('bcrypt');
const asyncHandle = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

const getJsonWebToken = async (email, id) => {
	const payload = {
		email,
		id,
	};
	const token = jwt.sign(payload, process.env.SECRET_KEY, {
		expiresIn: '7d',
	});

	return token;
};

const handleSendMail = async (val) => {
	try {
		await transporter.sendMail(val);

		return 'OK';
	} catch (error) {
		return error;
	}
};

const register = asyncHandle(async (req, res) => {
    const { email, name, password } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        res.status(400).json({
            message: 'Email đã tồn tại. Vui lòng sử dụng email khác!',
        });
        throw new Error('User already exists!');
    }

    const salt = await bcryp.genSalt(10);
    const hashedPassword = await bcryp.hash(password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 phút

    const newUser = new UserModel({
        email,
        name,
        password: hashedPassword,
        verificationCode,
        verificationExpires: new Date(expirationTime),
    });

    await newUser.save();

    const emailData = {
        from: `"Bookstore App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code - Bookstore App',
        text: 'Your code to verify your email',
        html: `<p>Your verification code is: <strong>${verificationCode}</strong>. This code is valid for 10 minutes.</p>`,
    };

    await handleSendMail(emailData);

    res.status(200).json({
        message: 'Register new user successfully. Verification code sent!',
        data: {
            email: newUser.email,
        },
    });
});



const verification = asyncHandle(async (req, res) => {
    const { email, code } = req.body;

    // Tìm người dùng qua email
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found.',
        });
    }

    if (!user.verificationCode || !user.verificationExpires) {
        return res.status(400).json({
            success: false,
            message: 'Verification code not found. Please request a new code.',
        });
    }

    if (user.verificationExpires < Date.now()) {
        return res.status(400).json({
            success: false,
            message: 'Verification code has expired. Please request a new code.',
        });
    }

    if (user.verificationCode !== parseInt(code)) {
        return res.status(400).json({
            success: false,
            message: 'Incorrect verification code.',
        });
    }

    // Xác thực thành công, cập nhật trạng thái người dùng
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;

    await user.save();

    // Trả về phản hồi rõ ràng
    res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        data: {
            id: user._id,
            email: user.email,
        },
    });
});



const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;

    // Thêm Delay từ Header
    const delay = req.headers['delay'];
    if (delay) {
        await new Promise((resolve) => setTimeout(resolve, parseInt(delay, 10)));
    }

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
        return res.status(403).json({
            message: 'User not found!',
        });
    }

    // Kiểm tra trạng thái tài khoản
    // if (!existingUser.isActive) {
    //     return res.status(403).json({
    //         message: 'Account is not active. Please verify your email or contact support!',
    //     });
    // }

    const isMatchPassword = await bcryp.compare(password, existingUser.password);

    if (!isMatchPassword) {
        return res.status(401).json({
            message: 'Email or Password is not correct!',
        });
    }

    // Lưu lịch sử đăng nhập
    const loginHistory = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date(),
    };

    existingUser.loginHistory = existingUser.loginHistory || [];
    existingUser.loginHistory.push(loginHistory);

    await existingUser.save();


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
        }
        
    });
});


const forgotPassword = asyncHandle(async (req, res) => {  
    const { email } = req.body;  

    const randomPassword = Math.round(100000 + Math.random() * 99000);  

    const data = {  
        from: `<${process.env.USERNAME_EMAIL}>`,  
        to: email,  
        subject: 'Mật khẩu mới',  
        text: 'Mật khẩu mới của bạn là: ',  
        html: `<h1>${randomPassword}</h1>. Vui lòng không chia sẻ với ai.`,  
    };  

    const user = await UserModel.findOne({ email });  
    if (user) {  
        const salt = await bcryp.genSalt(10);  
        const hashedPassword = await bcryp.hash(`${randomPassword}`, salt);  

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
        res.status(404).json({  
            message: 'Không tìm thấy người dùng!!!',  
        });  
    }  
});

const getAccount = async (req, res) => {
    const user = await UserModel.findOne({ email: req.user.email });  

    if(!user) return res.status(404).json({
        success: false,
        message: 'User not found',
    });


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
        }
    });
};

const handleLoginWithGoogle = asyncHandle(async (req, res) => {
	const userInfo = req.body;

	const existingUser = await UserModel.findOne({ email: userInfo.email });
	let user;
	if (existingUser) {
		await UserModel.findByIdAndUpdate(existingUser.id, {
			updatedAt: Date.now(),
		});
		user = { ...existingUser };
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


module.exports = {
	register,
	login,
	verification,
	forgotPassword,
    getAccount,
	handleLoginWithGoogle,
};
