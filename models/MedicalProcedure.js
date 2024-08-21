const mongoose = require('mongoose');

const MedicalProcedureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },  
  cost: {
    type: Number,
    required: true
  }
});

const MedicalProcedure = mongoose.model('MedicalProcedure', MedicalProcedureSchema);

module.exports = MedicalProcedure;
