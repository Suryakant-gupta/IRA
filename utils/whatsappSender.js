const axios = require('axios');

// Replace with your API key
const apiKey = 'OXBwWEJJbEl2Q1ppR2ZnQjNqZmRzdmM1T1NVVkp3VnFQdl9JRmJLX0ZaWTo=';

// Default message to be sent
const defaultMessage = 'This is a default message.';

// Function to send WhatsApp message
const sendWhatsappMessage = (mobileNumber) => {
  const phoneNumber = `+91${mobileNumber}`; // Add country code +91

  const data = {
    fullPhoneNumber: phoneNumber,
    callbackData: 'some_callback_data',
    type: 'Template',
    template: {
      name: 'amc_due',
      body: defaultMessage,
      languageCode: 'en'
    }
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.interakt.ai/v1/public/message/',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)
  };

  axios(config)
    .then(function (response) {
      console.log('WhatsApp message sent successfully:', response.data);
    })
    .catch(function (error) {
      console.error('Error sending WhatsApp message:', error);
    });
};

module.exports = sendWhatsappMessage;