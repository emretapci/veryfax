'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Numbers', {
      number: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      email: {
		type: Sequelize.STRING,
		references: {
			model: {
				tableName: 'Users',
				schema: 'schema'
			},
			key: 'email'
		}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Numbers');
  }
};