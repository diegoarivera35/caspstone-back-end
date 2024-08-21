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
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;