const express = require('express');
const router = express.Router();
const ensureAdmin = require('../middleware/ensureAdmin');

// Example admin-only route
router.get('/admin/dashboard', ensureAdmin, (req, res) => {
  res.render('admin/dashboard');
});


// Admin users management
router.get('/admin/users', ensureAdmin, async (req, res) => {
    const users = await User.find();
    res.render('admin/users', { users });
  });
  
  // Admin appointments management
  router.get('/admin/appointments', ensureAdmin, async (req, res) => {
    const appointments = await Appointment.find().populate('patientId doctorId');
    res.render('admin/appointments', { appointments });
  });

module.exports = router;