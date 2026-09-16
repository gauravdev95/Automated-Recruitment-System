const express = require('express');
const router = express.Router();

// Import HR controller and authentication middleware
const hrController = require('../controllers/hr.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');


//Get HR Profile
router.get('/getProfile', authenticate, requireRole("hr"), hrController.getHRProfile);

//Update HR Profile
router.put('/updateProfile', authenticate, requireRole("hr"), hrController.updateHRProfile);

//Create Job and Get Jobs by HR
router.post('/create', authenticate, requireRole("hr"), hrController.createJob)

//Get Jobs by HR
router.post('/getjob', authenticate, requireRole("hr"), hrController.getJobsByHR)


module.exports = router;