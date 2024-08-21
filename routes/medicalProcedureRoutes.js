const express = require('express');
const router = express.Router();
const MedicalProcedure = require('../models/MedicalProcedure');
const ensureAdmin = require('../middleware/ensureAdmin');

// Get all medicalprocedures
router.get('/medicalprocedures', ensureAdmin, async (req, res) => {
  try {
    const medicalprocedures = await MedicalProcedure.find();
    res.render('medicalprocedures/index', { medicalprocedures });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to create new medicalprocedure
router.get('/medicalprocedures/new', ensureAdmin, (req, res) => {
  res.render('medicalprocedures/new');
});

// Create a new medicalprocedure
router.post('/medicalprocedures', ensureAdmin, async (req, res) => {
  try {
    const medicalprocedure = new MedicalProcedure(req.body);
    await medicalprocedure.save();
    res.redirect('/medicalprocedures');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get a medicalprocedure by ID
router.get('/medicalprocedures/:id', ensureAdmin, async (req, res) => {
  try {
    const medicalprocedure = await MedicalProcedure.findById(req.params.id);
    if (!medicalprocedure) {
      return res.status(404).send();
    }
    res.render('medicalprocedures/show', { medicalprocedure });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to edit medicalprocedure
router.get('/medicalprocedures/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const medicalprocedure = await MedicalProcedure.findById(req.params.id);
    if (!medicalprocedure) {
      return res.status(404).send();
    }
    res.render('medicalprocedures/edit', { medicalprocedure });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a medicalprocedure
router.patch('/medicalprocedures/:id', ensureAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name','description', 'cost'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const medicalprocedure = await MedicalProcedure.findById(req.params.id);

    if (!medicalprocedure) {
      return res.status(404).send();
    }

    updates.forEach(update => medicalprocedure[update] = req.body[update]);
    await medicalprocedure.save();
    res.redirect(`/medicalprocedures/${medicalprocedure._id}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a medicalprocedure
router.delete('/medicalprocedures/:id', ensureAdmin, async (req, res) => {
  try {
    const medicalprocedure = await MedicalProcedure.findByIdAndDelete(req.params.id);

    if (!medicalprocedure) {
      return res.status(404).send();
    }

    res.redirect('/medicalprocedures');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
