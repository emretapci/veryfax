'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
		}
	};
	User.init({
		firstName: DataTypes.STRING,
		lastName: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		passwordHash: DataTypes.STRING,
		isAdmin: DataTypes.BOOLEAN,
		credits: DataTypes.FLOAT,
		emailApproved: DataTypes.BOOLEAN
	}, {
		sequelize,
		modelName: 'User',
	});
	return User;
};