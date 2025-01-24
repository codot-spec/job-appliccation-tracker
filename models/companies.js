
const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const Application = sequelize.define('company', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
 jobTitle: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  company: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  note: {
    type: Sequelize.STRING,
    allowNull: true, 
  },
  attachment: {
    type: Sequelize.STRING,
    allowNull: true,  // The URL of the file uploaded to S3
  },
});


module.exports = Application;
