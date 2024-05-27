const FormData = require('../models/tenant');

module.exports = {
  handleFormSubmission: async (req, res) => {
    try {
      const formData = new FormData(req.body);
      const savedFormData = await formData.save();
      console.log('Form data saved to MongoDB:', savedFormData);
      res.status(200).json({ message: 'Form data submitted successfully' });
    } catch (err) {
      console.error('Error saving form data:', err);
      res.status(500).json({ error: 'Failed to submit form data' });
    }
  }
};