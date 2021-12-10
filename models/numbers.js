'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Number extends Model {
		static associate(models) {
		}
	};
	Number.init({
		number: DataTypes.STRING,
		email: DataTypes.STRING
	}, {
		sequelize,
		modelName: 'Number',
	});
	return Number;
};