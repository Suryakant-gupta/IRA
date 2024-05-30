const passport = require('passport');
const adminAuthStrategy = require('./adminAuthStrategy');
const managerAuthStrategy = require('./managerAuthStrategy');

// Configure the admin authentication strategy
passport.use('admin-local', adminAuthStrategy);
passport.use('manager-local', managerAuthStrategy);

module.exports = passport;