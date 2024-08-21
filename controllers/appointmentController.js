const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const MedicalProcedure = require('../models/MedicalProcedure');
const MedicalCenter = require('../models/MedicalCenter');
const Payment = require('../models/Payment');

// List all appointments
exports.index = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('patientId doctorId medicalProcedureId medicalCenterId paymentId');
    res.render('appointments/index', { appointments });
  } catch (err) {
    res.status(500).send(err);
  }
};

// Show form to create a new appointment
exports.new = async (req, res) => {
  try {
    const patients = await Patient.find();
    const doctors = await Doctor.find();
    const medicalProcedures = await MedicalProcedure.find();
    const medicalCenters = await MedicalCenter.find();
    res.render('appointments/new', { patients, doctors, medicalProcedures, medicalCenters });
  } catch (err) {
    res.status(500).send(err);
  }
};

// Create a new appointment
exports.create = async (req, res) => {
  try {
    const appointmentData = req.body;
    if (!appointmentData.paymentId || appointmentData.paymentId === "") {
      appointmentData.paymentId = null; // Set paymentId to null if not provided or empty
    }
    appointmentData.paymentStatus = 'Pending'; // Ensure the payment status is set to 'Pending'
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    res.redirect('/appointments');
  } catch (err) {
    res.status(400).send(err);
  }
};


// show a appointment by ID
exports.show = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId doctorId medicalProcedureId medicalCenterId paymentId');
    if (!appointment) {
      return res.status(404).send();
    }
    res.render('appointments/show', { appointment });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Show form to edit an existing appointment
exports.edit = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    const patients = await Patient.find();
    const doctors = await Doctor.find();
    const medicalProcedures = await MedicalProcedure.find();
    const medicalCenters = await MedicalCenter.find();
    res.render('appointments/edit', { appointment, patients, doctors, medicalProcedures, medicalCenters });
  } catch (err) {
    res.status(400).send(err);
  }
};

// Update an existing appointment
exports.update = async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/appointments`);
  } catch (err) {
    res.status(400).send(err);
  }
};

// Delete an appointment
exports.delete = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.redirect('/appointments');
  } catch (err) {
    res.status(400).send(err);
  }
};
