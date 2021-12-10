const express = require('express');
const router = express.Router();
const config = require("../config/config.json");
const telnyx = require("telnyx")(config.config.telnyxApiKey);
const db = require('../models');
const sequelize = db.sequelize;
const User = db.User;
const Number = db.Number;

router.get('/countryCodes', (req, res) => {
	res.status(200).json(config.numbers.countryCodes);
});

router.post('/availableNumbers', async (req, res) => {
	const { data: numberList } = await telnyx.availablePhoneNumbers.list({
		filter: {
			country_code: req.body.countryCode,
			national_destination_code: req.body.areaCode,
			phone_number: {
				starts_with: req.body.prefix
			}
		}
	});
	res.status(200).json(numberList);
});

router.post('/buyNumber', async (req, res) => {
	/*const { data: numberOrder } = await telnyx.numberOrders.create({
		phone_numbers: [
			{
				phone_number: req.body.number
			}
		]
	});*/

	await Number.create({
		number: req.body.number,
		email: req.session.user.email
	});

	emailClient.sendEmail({
		"From": "no-reply@veryfax.com",
		"To": req.session.user.email,
		"Subject": "New number purchase",
		"HtmlBody": `The number ${req.body.number} has benn purchased by your account successfully.`,
		"MessageStream": "outbound"
	});

	res.status(200).json({
		status: numberOrder.data.status
	});
});

module.exports = router;