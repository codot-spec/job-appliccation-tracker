const cron = require('node-cron');
const nodemailer = require('nodemailer');

const Reminders = require('../models/reminders');
const User = require('../models/users');
const sequelize = require('../util/database')
// Log Job Reminder
exports.logReminder = async (req, res, next) => {
   const t = await sequelize.transaction();
  const { reminderDate, reminderMessage } = req.body;

  try {
    // Create new reminder in the database
    const reminder = await Reminders.create({
      userId: req.user.id, 
      reminderDate, 
      reminderMessage
    }, {transaction : t});

    await t.commit();
    res.status(201).json(reminder); // Respond with the created reminder
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error logging reminder', error });
  }
};

// Get all job reminders for a user
exports.getReminders = async (req, res, next) => {

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
const limit = parseInt(req.query.limit, 10) || 2; // Default to limit 2 if not provided
  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await Reminders.findAndCountAll({
      where: { userId: req.user.id },
      limit: limit,
      offset: offset
    });

     // Calculate total pages
     const totalPages = Math.ceil(count / limit);

     res.status(200).json({ 
       reminders: rows, 
       pagination: {
         totalItems: count,
         totalPages: totalPages,
         currentPage: page,
         itemsPerPage: limit
       }
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reminders', error });
  }
};



// Update a job reminder by ID
exports.updateReminder = async (req, res, next) => {
  const reminderId = req.params.reminderId;
  const { reminderDate, reminderMessage} = req.body;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the reminder to update
    const reminder = await Reminders.findOne({
      where: {
        id: reminderId,
        userId: req.user.id
      },
       transaction: t
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Save the updated reminder to the database
    await Reminders.update({ reminderDate, reminderMessage },
      { where: { id: reminderId, userId: req.user.id }, transaction: t });

      await t.commit();  // Commit the transaction
      const updatedReminder = await Reminders.findOne({
        where: { id: reminderId, userId: req.user.id }
      });
  
      res.status(200).json(updatedReminder);
  } catch (error) {
    t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error updating reminder', error });
  }
};

// Delete a job reminder by ID
exports.deleteReminder = async (req, res, next) => {
  const reminderId = req.params.reminderId;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the reminder to delete
   const reminder = await Reminders.findOne({
    where: { id: reminderId, userId: req.user.id },
    transaction: t
  });

  if (!reminder) {
    return res.status(404).json({ message: 'reminder not found' });
  }

    // Delete the reminder
    await Reminders.destroy({
      where: { id: reminderId, userId: req.user.id },
      transaction: t
    });

  await t.commit();
    res.status(200).json({ message: 'Reminder deleted successfully' }); // Respond with success message
  } catch (error) {
    t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error deleting reminder', error });
  }
};



//Reminder 
//Reminder 
//reminder 
//Reminder
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'exform.arc@gmail.com', 
    pass: 'password'  
  }
});

// Function to send email
async function sendReminderEmail(reminder) {
  const user = await User.findOne({ where: { id: reminder.userId } });

  if (user && user.email) {
    const mailOptions = {
      from: 'exform.arc@gmail.com',
      to: user.email,
      subject: 'Job Application Reminder',
      text: `Reminder: You applied for the job titled "${reminder.reminderMessage}" on ${reminder.reminderDate}.`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending reminder email', error);
    }
  }
}

// Cron job to run at 8 AM daily
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily reminder email job');

  try {
    const today = new Date().toISOString().split('T')[0];
    const reminders = await Reminders.findAll({
      where: {
        reminderDate: {
          [Op.like]: `${today}%`
        }
      }
    });

    reminders.forEach(reminder => {
      sendReminderEmail(reminder);
    });
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});
