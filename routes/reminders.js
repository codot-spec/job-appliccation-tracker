const express = require('express');
const reminderController = require('../controllers/reminders');
const userauthentication = require('../middleware/auth')

const router = express.Router();


router.post('/',userauthentication.authenticate, reminderController.logReminder);

router.get('/', userauthentication.authenticate, reminderController.getReminders);

router.put('/:reminderId',userauthentication.authenticate, reminderController.updateReminder);

router.delete('/:reminderId',userauthentication.authenticate, reminderController.deleteReminder);

// router.get('/download',userauthentication.authenticate, reminderController.downloadreminder)

// router.get('/downloaded-content',userauthentication.authenticate, reminderController.getDownloadedContent);

// router.get('/date-range', userauthentication.authenticate, reminderController.getremindersByDateRange);

module.exports = router;