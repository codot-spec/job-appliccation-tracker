const express = require('express');
const applicationController = require('../controllers/companies');
const userauthentication = require('../middleware/auth')
const multer = require('multer');

const storage = multer.memoryStorage();

// Initialize multer with the memory storage configuration
const upload = multer({ storage: storage });

const router = express.Router();


router.post('/',userauthentication.authenticate, upload.single('image'), applicationController.logApplication);

router.get('/', userauthentication.authenticate, applicationController.getApplications);

router.put('/:applicationId',userauthentication.authenticate,  upload.single('image'), applicationController.updateApplication);

router.delete('/:applicationId',userauthentication.authenticate, applicationController.deleteApplication);


module.exports = router;
