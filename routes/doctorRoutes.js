const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ensureAdmin = require('../middleware/ensureAdmin');

// Get all doctors
router.get('/doctors', ensureAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.render('doctors/index', { doctors });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to create new doctor
router.get('/doctors/new', ensureAdmin, (req, res) => {
  res.render('doctors/new');
});

// Create a new doctor
router.post('/doctors', ensureAdmin, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.redirect('/doctors');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get a doctor by ID
router.get('/doctors/:id', ensureAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('appointments');
    if (!doctor) {
      return res.status(404).send();
    }
    res.render('doctors/show', { doctor });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to edit doctor
router.get('/doctors/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).send();
    }
    res.render('doctors/edit', { doctor });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a doctor
router.patch('/doctors/:id', ensureAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName','lastName', 'email', 'phone', 'specialization'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).send();
    }

    updates.forEach(update => doctor[update] = req.body[update]);
    await doctor.save();
    res.redirect(`/doctors/${doctor._id}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a doctor
router.delete('/doctors/:id', ensureAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).send();
    }

    res.redirect('/doctors');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
