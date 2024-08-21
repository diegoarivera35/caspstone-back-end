const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const ensureAdmin = require('../middleware/ensureAdmin');

// Get all patients
router.get('/patients', ensureAdmin, async (req, res) => {
  try {
    const patients = await Patient.find();
    res.render('patients/index', { patients });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to create new patient
router.get('/patients/new', ensureAdmin, (req, res) => {
  res.render('patients/new');
});

// Create a new patient
router.post('/patients', ensureAdmin, async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.redirect('/patients');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get a patient by ID
router.get('/patients/:id', ensureAdmin, async (req, res) => {
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
router.get('/patients/:id/edit', ensureAdmin, async (req, res) => {
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
router.patch('/patients/:id', ensureAdmin, async (req, res) => {
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
// router.delete('/patients/:id', ensureAdmin, async (req, res) => {
//   try {
//     const patient = await Patient.findByIdAndDelete(req.params.id);

//     if (!patient) {
//       return res.status(404).send();
//     }

//     res.redirect('/patients');
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });


// Soft delete a patient or deactivate patient
router.delete('/patients/:id', ensureAdmin, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, {
      isActive: false,
      deactivatedAt: new Date()
    }, { new: true });

    if (!patient) {
      req.flash('error_msg', 'Patient not found');
      return res.status(404).redirect('/patients');
    }

    req.flash('success_msg', 'Patient deactivated successfully');
    res.redirect('/patients');
  } catch (error) {
    console.error('Error deactivating patient:', error);
    req.flash('error_msg', 'Error deactivating patient');
    res.status(500).redirect('/patients');
  }
});


// Reactivate a patient
router.patch('/patients/:id/reactivate', ensureAdmin, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, {
      isActive: true,
      deactivatedAt: null
    }, { new: true });

    if (!patient) {
      req.flash('error_msg', 'Patient not found');
      return res.status(404).redirect('/patients');
    }

    req.flash('success_msg', 'Patient reactivated successfully');
    res.redirect('/patients');
  } catch (error) {
    console.error('Error reactivating patient:', error);
    req.flash('error_msg', 'Error reactivating patient');
    res.status(500).redirect('/patients');
  }
});

module.exports = router;
