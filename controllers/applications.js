const Application = require('../models/applications');
const sequelize = require('../util/database');
const { uploads } = require('../util/upload');

// function upload(data, filename) {
//   const BUCKET_NAME = process.env.BUCKET_NAME;
//   const IAM_USER_KEY = process.env.IAM_USER_KEY;
//   const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

//   const s3bucket = new AWS.S3({
//     accessKeyId: IAM_USER_KEY,
//     secretAccessKey: IAM_USER_SECRET
//   });

//   // Ensure that the data is a string (or Buffer) for the Body
//   //const bufferData = Buffer.from(data, 'utf-8');  // Convert string data to Buffer if needed

//   const params = {
//     Bucket: BUCKET_NAME,
//     Key: filename,
//     Body: data,  // Body is the content of the file
//     ACL: 'public-read'
//   };

//   return new Promise((resolve, reject) =>{
//     s3bucket.upload(params, (err, s3response) => {
//       if (err) {
//         console.log("Something went wrong", err);
//         reject(err);
//       } else {
//        // console.log("Success", s3response);
//        resolve(s3response.Location);
//       }
//     });
//   })
// }



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
  const { jobTitle, company,  status, note ,dateApplied} = req.body;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the application to update
    const application = await Application.findOne({
      where: {
        id: applicationId,
        userId: req.user.id
      },
       transaction: t
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Save the updated application to the database
    await Application.update({ jobTitle, company,  status, note, dateApplied },
      { where: { id: applicationId, userId: req.user.id }, transaction: t });

      await t.commit();  // Commit the transaction
      const updatedApplication = await Application.findOne({
        where: { id: applicationId, userId: req.user.id }
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
