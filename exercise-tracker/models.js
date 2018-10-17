'use strict'

const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
	name: {
		type: String, 
		required: true,
		unique: true,
		maxlength: [16, 'username too long']
	}
}));

const Exercise = mongoose.model('Exercise', new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		index: true
	},
	description: {
		type: String,
		required: true,
		maxlength: [32, 'description too long']
	},
	duration: {
		type: Number,
		required: true,
		min: [1, 'duration too short']
	},
	date: {
		type: Date,
		default: Date.now
	}
}));

module.exports = {
	User,
	Exercise
};
