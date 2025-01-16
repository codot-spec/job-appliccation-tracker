const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const sequelize = require('./util/database');
const User = require('./models/users');
const Application = require('./models/applications');
const Reminders = require('./models/reminders')
 const Forgotpassword = require('./models/forgotpassword');


const userRoutes = require('./routes/user');  // Importing user routes
const applicationRoutes = require('./routes/application');
const reminderRoutes = require('./routes/reminders')
 const resetPasswordRoutes = require('./routes/resetpassword')



const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  { flags: 'a'});


app.use(cors());  // Allows cross-origin requests


app.use(morgan('combined',{stream: accessLogStream}));
app.use(express.json());

// Route to serve login.html from the 'login' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login','login.html'));  // Serve 'login.html' from 'public/login' folder
});

 // Serve static files for other routes
app.use(express.static(path.join(__dirname, 'public')));



app.use('/user', userRoutes);  // Use /user routes for user operations
app.use('/applications',applicationRoutes);
app.use('/reminders', reminderRoutes);
 app.use('/password', resetPasswordRoutes);


Application.belongsTo(User);
User.hasMany(Application);

Reminders.belongsTo(User);
User.hasMany(Reminders);

 User.hasMany(Forgotpassword);
 Forgotpassword.belongsTo(User);

// User.hasMany(DownloadedContent);
// DownloadedContent.belongsTo(User);

sequelize.sync()
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.error(err);
  });

// Once the email is entered for password reset, generate the reset link.
// Open the link generation process and manually insert the user ID after the reset link.
// Note: The email sending API is not registered, so email will not be sent automatically.
