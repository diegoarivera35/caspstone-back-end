const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcryptjs');

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
        const newUser = new User({
          email,
          password,
          userType
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          newUser.password = hash;
          // Save user
          try {
            await newUser.save();
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/login');
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
