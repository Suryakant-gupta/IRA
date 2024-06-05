module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      // Check user's role
      if (req.user.role === 'admin') {
        // Redirect to admin panel
        return res.redirect('/admin/admin-panel');
      } else if (req.user.role === 'manager') {
        // Redirect to manager panel
        return res.redirect('/manager/manager-panel');
      } else if (req.user.role === 'tenant') {
        // Redirect to tenant panel or desired route
        return res.redirect('/tenant/tenant-panel');
      } else {
        // Redirect to login page or handle invalid role
        return res.redirect('/login');
      }
    }
    // If not authenticated, redirect to login page
    res.redirect('/login');
  },
};