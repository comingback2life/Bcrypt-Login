const express = require('express');
const app = express();
const User = require('./models/user'); //user model
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('./models/user');
const session = require('express-session');

mongoose
	.connect('mongodb://localhost:27017/authApp', { useNewUrlParser: true })
	.then(() => {
		console.log('Database has been connected');
	})
	.catch((err) => console.log(err));

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret', resave: false, saveUninitialized: true }));
const requireLogin = (req, res, next) => {
	if (!req.session.user_id) {
		return res.redirect('/login');
	}
	next();
};
app.get('/', (req, res) => {
	res.send('Home page');
});
app.post('/register', async (req, res) => {
	const { username, password } = req.body;
	const user = new User({ username, password });
	await user.save();
	req.session.user_id = user._id;
	res.redirect('/secret');
});
app.get('/login', (req, res) => {
	res.render('login');
});
app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const foundUser = await User.findMyUser(username, password);
	if (foundUser) {
		req.session.user_id = foundUser._id;
		res.redirect('/secret');
	} else {
		res.redirect('/login');
	}
});
app.post('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/login');
});
app.get('/register', (req, res) => {
	res.render('register');
});
app.get('/secret', requireLogin, (req, res) => {
	res.render('secret');
});
app.get('/topsecret', requireLogin, (req, res) => {
	res.send('Not logged in ');
});
app.listen(3000, () => {
	console.log('Serving app on port 3000');
});
