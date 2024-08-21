const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const medicalProcedureRoutes = require('./routes/medicalProcedureRoutes');
const medicalCenterRoutes = require('./routes/medicalCenterRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');


// Load User model
const User = require('./models/User');

dotenv.config();

const app = express();

// Passport config
require('./config/passport')(passport);

// Set Pug as the templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// so the App can use PATCH
app.use(methodOverride('_method'));

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.messages = req.flash(); // This includes all flash messages
  res.locals.user = req.user || null;
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home Page',
    heading: 'Welcome to MedLinked',
    items: ['Feature 1', 'Feature 2', 'Feature 3']
  });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.use('/api/users', userRoutes);
app.use('/', userRoutes);
app.use('/', patientRoutes);
app.use('/', doctorRoutes);
app.use('/', medicalProcedureRoutes);
app.use('/', medicalCenterRoutes);
app.use('/', paymentRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/', adminRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
