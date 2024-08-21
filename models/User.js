const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true 
  },
  userType: {
    type: String,
    required: true,
    enum: ['Admin', 'Doctor', 'Patient']
  },  
  createdAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Mongoose middleware to hash password before saving, only if password is modified
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
