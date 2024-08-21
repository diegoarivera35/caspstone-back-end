const mongoose = require('mongoose');

const MedicalCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },  
  phone: {
    type: String,
    required: true,
    unique: true
  }
});

const MedicalCenter = mongoose.model('MedicalCenter', MedicalCenterSchema);

module.exports = MedicalCenter;
