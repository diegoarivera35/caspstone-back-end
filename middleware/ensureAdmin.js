module.exports = function(req, res, next) {
    if (req.isAuthenticated() && req.user.userType === 'Admin') {
      return next();
    } else {
      req.flash('error_msg', ['You are not authorized to view this resource']);
      res.redirect('/login');
    }
  };