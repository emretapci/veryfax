const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const faxRouter = require('./fax');
const db = require('../models');
const crypto = require('crypto');

const sequelize = db.sequelize;
const User = db.User;

router.get('/', (req, res) => {
	res.render('index', { title: 'Express' });
});

router.get('/checksession', async (req, res) => {
	if (req.session && req.session.user) {
		let user = await User.findByPk(req.session.user.email);
		if (user)
			res.status(200).json({ user });
		else
			res.status(404).send(`No user with e-mail address ${req.body.email} found.`);
	}
	else
		res.sendStatus(401);
});

router.post('/login', async (req, res) => {
	await sequelize.sync();
	const user = await User.findOne({
		where: {
			email: req.body.email
		},
		attributes: [
			'email',
			'firstName',
			'lastName',
			'passwordHash',
			'isAdmin',
			'emailApproved',
			'credits'
		]
	});
	if (!user) {
		res.status(404).send(`User with email "${req.body.email}" not found.`);
		return;
	}

	if (!req.body.password) {
		res.status(400).send(`You must supply a password.`);
		return;
	}

	let hash = crypto.createHash('sha256');
	hash.update(req.body.password);
	const passwordHash = hash.digest('base64');

	if (user.passwordHash == passwordHash) {
		req.session.user = user;
		res.status(200).json({
			user: {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin,
				emailApproved: user.emailApproved,
				credits: user.credits
			}
		});
	}
	else {
		res.status(401).send('Invalid credentials.');
	}
});

router.delete('/logout', async (req, res) => {
	if (!req.session || !req.session.user) {
		res.status(401).send('Not logged in.');
		return;
	}

	req.session.destroy();
	res.sendStatus(200);
});

router.use('/users', usersRouter);
router.use('/fax', faxRouter);

module.exports = router;
