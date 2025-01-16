const Application = require('../models/applications');
const sequelize = require('../util/database');
const { uploads } = require('../util/upload');



// Log Job Application
exports.logApplication = async (req, res, next) => {
   const t = await sequelize.transaction();
  const { jobTitle, company,  status, note , dateApplied} = req.body;
  const imageFile = req.file;

  try {
    // Create new application in the database
    const uploadedImageUrl = await uploads(imageFile);
    const application = await Application.create({
      userId: req.user.id, 
      jobTitle, 
      company, 
      status,
      note,
      dateApplied,
      attachment : uploadedImageUrl
    }, {transaction : t});

    await t.commit();
    res.status(201).json(application); // Respond with the created application
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error logging application', error });
  }
};

// Get all job applications for a user
exports.getApplications = async (req, res, next) => {

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
const limit = parseInt(req.query.limit, 10) || 2; // Default to limit 2 if not provided
  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await Application.findAndCountAll({
      where: { userId: req.user.id },
      limit: limit,
      offset: offset
    });

     // Calculate total pages
     const totalPages = Math.ceil(count / limit);

     res.status(200).json({ 
       applications: rows, 
       pagination: {
         totalItems: count,
         totalPages: totalPages,
         currentPage: page,
         itemsPerPage: limit
       }
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching applications', error });
  }
};



// Update a job application by ID
exports.updateApplication = async (req, res, next) => {
  const applicationId = req.params.applicationId;
  const { jobTitle, company, status, note, dateApplied } = req.body;
  const imageFile = req.file; // Get the uploaded image file (if any)
  const t = await sequelize.transaction(); // Start transaction

  try {
    // Find the application to update
    const application = await Application.findOne({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
      transaction: t,
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let uploadedImageUrl;

    // Handle attachment update logic
    if (imageFile) {
      // Upload the new image and store the URL
      uploadedImageUrl = await uploads(imageFile);

      // If the application already has an attachment, delete it (optional)
      if (application.attachment) {
        // Implement logic to delete the existing attachment file (based on your storage strategy)
        console.log('Delete existing attachment:', application.attachment); // Placeholder for deletion logic
      }
    } else {
      // Use the existing attachment URL if no new image is uploaded
      uploadedImageUrl = application.attachment;
    }

    // Update the application with new details (including attachment URL)
    await Application.update(
      { jobTitle, company, status, note, dateApplied, attachment: uploadedImageUrl },
      { where: { id: applicationId, userId: req.user.id }, transaction: t }
    );

    await t.commit(); // Commit the transaction

    const updatedApplication = await Application.findOne({
      where: { id: applicationId, userId: req.user.id },
    });

    res.status(200).json(updatedApplication);
  } catch (error) {
    t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error updating application', error });
  }
};
// Delete a job application by ID
exports.deleteApplication = async (req, res, next) => {
  const applicationId = req.params.applicationId;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the application to delete
   const application = await Application.findOne({
    where: { id: applicationId, userId: req.user.id },
    transaction: t
  });

  if (!application) {
    return res.status(404).json({ message: 'application not found' });
  }

    // Delete the application
    await Application.destroy({
      where: { id: applicationId, userId: req.user.id },
      transaction: t
    });

  await t.commit();
    res.status(200).json({ message: 'Application deleted successfully' }); // Respond with success message
  } catch (error) {
    t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error deleting application', error });
  }
};
