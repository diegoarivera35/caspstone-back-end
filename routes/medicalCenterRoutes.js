const express = require('express');
const router = express.Router();
const MedicalCenter = require('../models/MedicalCenter');
const ensureAdmin = require('../middleware/ensureAdmin');

// Get all medicalcenters
router.get('/medicalcenters', ensureAdmin, async (req, res) => {
  try {
    const medicalcenters = await MedicalCenter.find();
    res.render('medicalcenters/index', { medicalcenters });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to create new medicalcenter
router.get('/medicalcenters/new', ensureAdmin, (req, res) => {
  res.render('medicalcenters/new');
});

// Create a new medicalcenter
router.post('/medicalcenters', ensureAdmin, async (req, res) => {
  try {
    const medicalcenter = new MedicalCenter(req.body);
    await medicalcenter.save();
    res.redirect('/medicalcenters');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get a medicalcenter by ID
router.get('/medicalcenters/:id', ensureAdmin, async (req, res) => {
  try {
    const medicalcenter = await MedicalCenter.findById(req.params.id);
    if (!medicalcenter) {
      return res.status(404).send();
    }
    res.render('medicalcenters/show', { medicalcenter });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to edit medicalcenter
router.get('/medicalcenters/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const medicalcenter = await MedicalCenter.findById(req.params.id);
    if (!medicalcenter) {
      return res.status(404).send();
    }
    res.render('medicalcenters/edit', { medicalcenter });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a medicalcenter
router.patch('/medicalcenters/:id', ensureAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name','address', 'phone'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const medicalcenter = await MedicalCenter.findById(req.params.id);

    if (!medicalcenter) {
      return res.status(404).send();
    }

    updates.forEach(update => medicalcenter[update] = req.body[update]);
    await medicalcenter.save();
    res.redirect(`/medicalcenters/${medicalcenter._id}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a medicalcenter
router.delete('/medicalcenters/:id', ensureAdmin, async (req, res) => {
  try {
    const medicalcenter = await MedicalCenter.findByIdAndDelete(req.params.id);

    if (!medicalcenter) {
      return res.status(404).send();
    }

    res.redirect('/medicalcenters');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
