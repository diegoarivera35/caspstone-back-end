const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
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
  age: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true
  },
  medicalHistory: {
    type: String,
    required: false
  }
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
