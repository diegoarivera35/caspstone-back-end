const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ensureAdmin = require('../middleware/ensureAdmin');
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
          password, // Password will be hashed by the pre-save middleware
          userType,
          verificationToken,
          isVerified: false
        });

        // Save user to the database
        try {
          await newUser.save();

          // Send verification email
          const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
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
              req.flash('success_msg', ['You are now registered. Please check your email to verify your account.']);
              res.redirect('/login');
            }
          });
        } catch (err) {
          console.log(err);
          req.flash('error_msg', ['Error saving user']);
          res.redirect('/register');
        }
      }
    } catch (err) {
      console.log(err);
      req.flash('error_msg', ['Error finding user']);
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
      req.flash('error_msg', ['Invalid token']);
      res.redirect('/login');
    } else {
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      req.flash('success_msg', ['Your account has been verified']);
      res.redirect('/login');
    }
  } catch (err) {
    console.error('Error verifying email:', err);
    req.flash('error_msg', ['Error verifying email']);
    res.redirect('/login');
  }
});

//------------CRUD USERS START-----------------------------

// Show form to create new user (Admin only)
router.get('/users/new', ensureAdmin, (req, res) => {
  res.render('users/new');
});

// Create a new user (Admin only)
router.post('/users', ensureAdmin, async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      userType,
      isVerified: true // Assuming admin-created users are verified by default
    });

    await user.save();
    req.flash('success_msg', ['New user created successfully']);
    res.redirect('/users');
  } catch (error) {
    req.flash('error_msg', ['Error creating user']);
    res.status(400).redirect('/users/new');
  }
});

// Get all users (Admin only)
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render('users/index', { users });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a user by ID (Admin only)
router.get('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.render('users/show', { user });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Show form to edit user (Admin only)
router.get('/users/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.render('users/edit', { user });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a user (Admin only)
router.patch('/users/:id', ensureAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['email', 'password', 'userType', 'isVerified'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    // Remove password from updates if it's empty
    if (req.body.password === '') {
      delete req.body.password;
    }

    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Apply the updates to the user object
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        user[update] = req.body[update];
      }
    });

    await user.save();
    req.flash('success_msg', ['User updated successfully']);
    res.redirect(`/users/${user._id}`);
  } catch (error) {
    req.flash('error_msg', ['Error updating user']);
    res.status(400).send(error);
  }
});

// Delete a user (Admin only)
router.delete('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    req.flash('success_msg', ['User deleted successfully']);
    res.redirect('/users');
  } catch (error) {
    req.flash('error_msg', ['Error deleting user']);
    res.status(500).send(error);
  }
});

//------------CRUD USERS END--------------------------------

// Login Page
router.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error_msg', ['Invalid email or password.']);
      return res.redirect('/login'); // Authentication failed, redirect to login
    }

    // Check if the user is verified
    if (!user.isVerified) {
      req.flash('error_msg', ['Please verify your account by clicking the link in the email we sent you.']);
      return res.redirect('/login');
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Check userType and redirect accordingly
      if (user.userType === 'Admin') {
        return res.redirect('/admin/dashboard');
      } else if (user.userType === 'Patient') {
        return res.redirect('/');
      } else if (user.userType === 'Doctor') {
        return res.redirect('/doctor/dashboard');
      } else {
        return res.redirect('/'); // Default redirect for other user types
      }
    });
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', ['You are logged out']);
    res.redirect('/login');
  });
});

module.exports = router;
