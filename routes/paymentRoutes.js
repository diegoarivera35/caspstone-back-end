const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const ensureAdmin = require('../middleware/ensureAdmin');

// Get all payments
router.get('/payments', ensureAdmin, async (req, res) => {
  try {
    const payments = await Payment.find().populate('appointmentId');
    res.render('payments/index', { payments });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to create a new Payment
router.get('/payments/new', ensureAdmin, async (req, res) => {
  try {
    // Fetch appointments with paymentStatus 'Pending'
    const pendingAppointments = await Appointment.find({ paymentStatus: 'Pending' }).populate('patientId');

    res.render('payments/new', { pendingAppointments });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create a new payment and update the associated appointment
router.post('/payments', ensureAdmin, async (req, res) => {
  try {
    // Create the payment with the appointmentId
    const payment = new Payment({
      amount: req.body.amount,
      appointmentId: req.body.appointmentId,
      status: 'completed' // Set the status to 'completed' when the payment is created
    });
    await payment.save();

    // Find the appointment and update it with the new payment details
    const appointment = await Appointment.findById(req.body.appointmentId);

    if (appointment) {
      appointment.paymentStatus = 'Completed';
      appointment.paymentId = payment._id;
      await appointment.save();
    }

    res.redirect('/payments'); // Redirect to the list of payments after creation
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get a payment by ID
router.get('/payments/:id', ensureAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('appointmentId');
    if (!payment) {
      return res.status(404).send();
    }
    res.render('payments/show', { payment });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to edit payment
router.get('/payments/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).send();
    }
    res.render('payments/edit', { payment });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a payment
router.patch('/payments/:id', ensureAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['amount', 'date', 'status'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).send();
    }

    updates.forEach(update => payment[update] = req.body[update]);
    await payment.save();
    res.redirect(`/payments/${payment._id}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a payment
router.delete('/payments/:id', ensureAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).send();
    }

    // Optionally, update the appointment to set paymentStatus back to 'Pending' if the payment is deleted
    if (payment.appointmentId) {
      const appointment = await Appointment.findById(payment.appointmentId);
      if (appointment) {
        appointment.paymentStatus = 'Pending';
        appointment.paymentId = null; // Remove the reference to the payment
        await appointment.save();
      }
    }

    res.redirect('/payments');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
