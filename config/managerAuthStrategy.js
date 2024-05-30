const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Manager = require('../models/AdminUser');

const managerAuthStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Find the manager by email
      const manager = await Manager.findOne({ email });

      // If no manager is found
      if (!manager) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, manager.password);

      // If the password is invalid
      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // If the password is valid, return the manager
      return done(null, manager);
    } catch (err) {
      return done(err);
    }
  }
);

module.exports = managerAuthStrategy;