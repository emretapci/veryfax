'use strict';
const crypto = require('crypto');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let hash = crypto.createHash('sha256');
		hash.update('adminpwd');
		const passwordHash = hash.digest('base64');

		return queryInterface.bulkInsert('Users', [{
			firstName: 'administrator',
			lastName: 'administrator',
			email: 'administrator@veryfax.com',
			passwordHash,
			isAdmin: true,
			credits: 10000000,
			emailApproved: true
		}]);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('Users', { where: { email: 'administrator@veryfax.com' } });
	}
};
