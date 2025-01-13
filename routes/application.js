const express = require('express');
const applicationController = require('../controllers/applications');
const userauthentication = require('../middleware/auth')
const multer = require('multer');

const storage = multer.memoryStorage();

// Initialize multer with the memory storage configuration
const upload = multer({ storage: storage });

const router = express.Router();


router.post('/',userauthentication.authenticate, upload.single('image'), applicationController.logApplication);

router.get('/', userauthentication.authenticate, applicationController.getApplications);

router.put('/:applicationId',userauthentication.authenticate, applicationController.updateApplication);

router.delete('/:applicationId',userauthentication.authenticate, applicationController.deleteApplication);

// router.get('/download',userauthentication.authenticate, expenseController.downloadExpense)

// router.get('/downloaded-content',userauthentication.authenticate, expenseController.getDownloadedContent);

// router.get('/date-range', userauthentication.authenticate, expenseController.getExpensesByDateRange);

module.exports = router;
