const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const ensureAdmin = require('../middleware/ensureAdmin');

// Get all appointments
router.get('/', ensureAdmin, appointmentController.index);

// Get one appointment with details
router.get('/:id', ensureAdmin, appointmentController.show);

// Show form to create a new appointment
router.get('/new', ensureAdmin, appointmentController.new);

// Create a new appointment
router.post('/', ensureAdmin, appointmentController.create);

// Show form to edit an existing appointment
router.get('/:id/edit', ensureAdmin, appointmentController.edit);

// Update an existing appointment
router.patch('/:id', ensureAdmin, appointmentController.update);

// Delete an appointment
router.delete('/:id', ensureAdmin, appointmentController.delete);

module.exports = router;
