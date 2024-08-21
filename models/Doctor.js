const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },  
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  // appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }] 
});

DoctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctorId'
});

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;
