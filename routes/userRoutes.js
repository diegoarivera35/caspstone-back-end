const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', async (req, res) => {
  const { email, password, password2, userType } = req.body;
  let errors = [];

  // Check required fields
  if (!email || !password || !password2 || !userType) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      email,
      password,
      password2,
      userType
    });
  } else {
    // Validation passed
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
          errors,
          email,
          password,
          password2,
          userType
        });
      } else {
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const newUser = new User({
          email,
          password,
          userType,
          verificationToken,
          isVerified: false
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          newUser.password = hash;
          // Save user
          try {
            await newUser.save();

            // Send verification email
            const transporter = nodemailer.createTransport({
              host: 'smtp.office365.com',
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: process.env.EMAIL_USER, // your Outlook email address
                pass: process.env.EMAIL_PASS  // your Outlook email password
              }
            });

            const mailOptions = {
              to: newUser.email,
              from: process.env.EMAIL_USER,
              subject: 'Account Verification',
              text: `Please click the following link to verify your account: \n\n http://${req.headers.host}/api/users/verify-email?token=${verificationToken}`
            };

            transporter.sendMail(mailOptions, (err) => {
              if (err) {
                console.error('Error sending email:', err);
              } else {
                req.flash('success_msg', 'You are now registered. Please check your email to verify your account.');
                res.redirect('/login');
              }
            });
          } catch (err) {
            console.log(err);
            req.flash('error_msg', 'Error saving user');
            res.redirect('/register');
          }
        }));
      }
    } catch (err) {
      console.log(err);
      req.flash('error_msg', 'Error finding user');
      res.redirect('/register');
    }
  }
});

// Verify Email Handle
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      req.flash('error_msg', 'Invalid token');
      res.redirect('/login');
    } else {
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      req.flash('success_msg', 'Your account has been verified');
      res.redirect('/login');
    }
  } catch (err) {
    console.error('Error verifying email:', err);
    req.flash('error_msg', 'Error verifying email');
    res.redirect('/login');
  }
});

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;
