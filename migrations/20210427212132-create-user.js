'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('Users', {
			email: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.STRING
			},
			firstName: {
				allowNull: false,
				type: Sequelize.STRING
			},
			lastName: {
				allowNull: false,
				type: Sequelize.STRING
			},
			passwordHash: {
				allowNull: false,
				type: Sequelize.STRING
			},
			isAdmin: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},
			credits: {
				allowNull: false,
				type: Sequelize.INTEGER,
				defaultValue: 0
			},
			emailApproved: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date()
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date()
			}
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('Users');
	}
};