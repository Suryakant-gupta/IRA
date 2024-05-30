const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const adminAuthStrategy = require('./adminAuthStrategy');
const passport = require('passport');

module.exports = function (passport) {
 // Configure Passport.js
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({
          $or: [{ email: username }, { mobileNumber: username }],
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or phone number' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);




  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};