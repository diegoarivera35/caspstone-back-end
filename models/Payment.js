const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  appointmentId: { // Reference to the appointment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
