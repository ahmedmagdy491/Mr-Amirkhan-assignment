const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	user: {
		type: String,
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
