'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const sequelize = new Sequelize(queryInterface.sequelize.config.database, queryInterface.sequelize.config.username, queryInterface.sequelize.config.password, {
			host: queryInterface.sequelize.config.host,
			dialect: 'mysql',
			dialectOptions: {
				multipleStatements: true
			}
		});

		sequelize.query(`ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY '${queryInterface.sequelize.config.password}'`);
		sequelize.query('flush privileges');
	},

	down: async (queryInterface, Sequelize) => {
	}
};
