const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
  // Configure Passport.js
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // or 'mobileNumber' depending on your form
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
    done(null, { id: user.id, role: user.role });
  });

  passport.deserializeUser(async (data, done) => {
    try {
      const user = await User.findById(data.id);
      if (user) {
        user.role = data.role;
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  });
};