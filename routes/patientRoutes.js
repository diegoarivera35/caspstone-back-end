const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.render('patients/index', { patients });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to create new patient
router.get('/patients/new', (req, res) => {
  res.render('patients/new');
});

// Create a new patient
router.post('/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.redirect('/patients');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get a patient by ID
router.get('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).send();
    }
    res.render('patients/show', { patient });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to edit patient
router.get('/patients/:id/edit', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).send();
    }
    res.render('patients/edit', { patient });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a patient
router.patch('/patients/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName','lastName', 'email', 'phone', 'age', 'address','bloodType', 'medicalHistory'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send();
    }

    updates.forEach(update => patient[update] = req.body[update]);
    await patient.save();
    res.redirect(`/patients/${patient._id}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a patient
router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).send();
    }

    res.redirect('/patients');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
