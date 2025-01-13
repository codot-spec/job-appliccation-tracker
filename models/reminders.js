
const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const Reminders = sequelize.define('reminder', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  reminderDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  reminderMessage: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});


module.exports = Reminders;