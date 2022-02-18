const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/task_db', (err) => {
	if (err) console.error(err);
	console.log('DB connected');
});

app.use('/user', require('./src/api/rotues/user.route'));
app.listen(8080, (err) => {
	if (err) console.error(err);
	console.log('server running on 8080');
});
