/** @format */

const { default: mongoose, Schema } = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
		unique: true,
	},
	password: {
		type: String,
		require: true,
	},
	photoUrl: {
		type: String,
		default: 'default-user.png',
	},
	isVerified: { 
		type: Boolean, 
		default: false 
	},
	verificationCode: { 
		type: Number, 
		default: null 
	},
	verificationExpires: { 
		type: Date, 
		default: null 
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: Date.now(),
	},
	fcmTokens: {
		type: [String],
	},
	phone: {
		type: String,
		unique: true,
	},
	address: {
		type: String,
		default: '',
	},
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
