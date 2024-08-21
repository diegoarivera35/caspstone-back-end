const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  medicalProcedureId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalProcedure', required: true },
  medicalCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalCenter', required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null }, // Initially null, set once payment is processed
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' } // Initial status is 'Pending'
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
