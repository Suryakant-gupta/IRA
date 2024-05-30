const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');

const adminAuthStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Find the admin user by email
      const adminUser = await AdminUser.findOne({ email });

      // If no admin user is found
      if (!adminUser) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);

      // If the password is invalid
      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // If the password is valid, return the admin user
      return done(null, adminUser);
    } catch (err) {
      return done(err);
    }
  }
);

module.exports = adminAuthStrategy;