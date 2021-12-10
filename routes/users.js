const express = require('express');
const router = express.Router();
const db = require('../models');
const postmark = require("postmark");
const config = require("../config/config.json");
const crypto = require('crypto');
const cipher = require('./cipher');
const env = process.env.NODE_ENV || 'development-local';
const sequelize = db.sequelize;
const User = db.User;
const emailClient = new postmark.ServerClient(config.config.postmarkApiKey);

router.get('/', async (req, res) => {
	if (!req.session.user || !req.session.user.isAdmin) {
		res.status(401).send('Only admin users can list other users.');
		return;
	}

	await sequelize.sync();
	res.status(200).json(await User.findAll());
});

router.post('/', async (req, res) => {
	if (await User.findByPk(req.body.email, { attributes: ['email'] })) {
		res.status(409).send(`A user with email ${req.body.email} already exists.`);
		return;
	}

	if (!req.body.firstName) {
		res.status(400).send('First name is a required field.');
		return;
	}
	if (!req.body.lastName) {
		res.status(400).send('Last name is a required field.');
		return;
	}
	if (!req.body.email) {
		res.status(400).send('You must supply a valid e-mail address.');
		return;
	}
	if (!req.body.password) {
		res.status(400).send('First name is a required information.');
		return;
	}

	let hash = crypto.createHash('sha256');
	hash.update(req.body.password);
	const passwordHash = hash.digest('base64');

	await sequelize.sync();
	let user = await User.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		passwordHash,
		isAdmin: req.body.isAdmin,
		credits: req.body.credits
	});

	hash = crypto.createHash('sha256');
	hash.update(req.body.email + config.config.cryptoKey.key);
	let emailConfirmationKey = Buffer.from(JSON.stringify({
		email: req.body.email,
		hash: hash.digest('base64')
	})).toString('base64');

	emailClient.sendEmail({
		"From": "no-reply@veryfax.com",
		"To": req.body.email,
		"Subject": "Password confirmation link",
		"HtmlBody": `Please click <a href="${req.protocol}://${req.headers.host}/users/receiveEmailConfirmationCode?key=${emailConfirmationKey}">here</a> to confirm your password.`,
		"TextBody": `Please navigate to "${req.protocol}://${req.headers.host}/users/receiveEmailConfirmationCode?key=${emailConfirmationKey}" to confirm your password.`,
		"MessageStream": "outbound"
	});

	req.session.user = user;

	res.status(201).json({
		user: {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			isAdmin: user.isAdmin,
			emailApproved: user.emailApproved,
			credits: user.credits
		}
	}); //created
});

router.get('/receiveEmailConfirmationCode', async (req, res) => {
	let emailConfirmation;

	try {
		emailConfirmation = JSON.parse(Buffer.from(req.query.key, 'base64').toString());
	}
	catch {
		res.status(401).send(`Invlaid email confirmation link.`);
		return;
	}

	let user = await User.findByPk(emailConfirmation.email);
	if (!user) {
		res.status(404).send(`A user with email "${emailConfirmation.email}" cannot be found.`);
		return;
	}

	if (user.emailApproved) {
		res.status(400).send(`Email address "${emailConfirmation.email}" is already approved.`);
		return;
	}

	let hash = crypto.createHash('sha256');
	hash.update(emailConfirmation.email + config.config.cryptoKey.key);
	let computedHash = hash.digest().toString('base64');
	if (computedHash == emailConfirmation.hash) {
		await sequelize.sync();
		await User.update({ emailApproved: true, updatedAt: new Date() }, { where: { email: emailConfirmation.email } });
		res.status(200).send(`Email address "${emailConfirmation.email}" is now approved.`);
		return;
	}
	res.status(401).send(`Invalid email confirmation link.`);
});

router.post('/sendResetLink', async (req, res) => {
	if (req.session.user) {
		res.status(400).send('You are already logged in. Logout before resetting password.');
		return;
	}

	if (!req.body.email) {
		res.status(400).send('You must supply an e-mail address to reset the password for.');
		return;
	}

	await sequelize.sync();

	if (!(await User.findByPk(req.body.email, { attributes: ['email'] }))) {
		res.status(404).send(`No user with e-mail address ${req.body.email} found.`);
		return;
	}

	let resetKey = encodeURIComponent(cipher.encrypt(JSON.stringify({
		em: req.body.email,
		ex: Date.now() + config.config.passwordResetExpiryPeriodMinutes * 60 * 1000
	})));

	let validMinsText = `This link is valid for ${config.config.passwordResetExpiryPeriodMinutes} minutes.`;

	emailClient.sendEmail({
		"From": "no-reply@veryfax.com",
		"To": req.body.email,
		"Subject": "Password reset link",
		"HtmlBody": `Please click <a href="https://${config.deploy[env].frontendHost}/users/resetPassword?key=${resetKey}">here</a> to reset your password.<p/>` + validMinsText,
		"TextBody": `Please navigate to "https://${config.deploy[env].frontendHost}/users/resetPassword?key=${resetKey}" to reset your password.<p/>` + validMinsText,
		"MessageStream": "outbound"
	});

	res.status(200).send(`Password reset link for ${req.body.email} is sent.`)
});

router.post('/receiveResetCode', async (req, res) => {
	let resetInfo;
	try {
		resetInfo = JSON.parse(cipher.decrypt(decodeURIComponent(req.query.key)));
	}
	catch {
		res.status(400).send(`Invalid password reset key.`);
		return;
	}

	await sequelize.sync();

	if (!(await User.findByPk(resetInfo.em, { attributes: ['email'] }))) {
		res.status(400).send(`Invalid password reset key.`);
		return;
	}

	let now = Date.now();
	if (resetInfo.ex > now) {
		let hash = crypto.createHash('sha256');
		if (!req.body.newPassword) {
			res.status(400).send(`You must set a valid password.`);
			return;
		}
		hash.update(req.body.newPassword);
		const passwordHash = hash.digest('base64');
		await User.update({ passwordHash }, { where: { email: resetInfo.em } });
		res.sendStatus(204);
	}
	else {
		res.status(400).send(`The password reset link has expired.`);
		return;
	}
});

module.exports = router;
