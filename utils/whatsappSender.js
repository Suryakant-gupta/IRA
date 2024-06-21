const axios = require('axios');

// Replace with your API key
const apiKey = 'Nkp1Z2x2bF9GajBaMzlNM3ZCZFRDcjJVNnFaMFZ5LWxSOW1PWHlOMXJkYzo=';

const sendWhatsappMessage = (mobileNumber, templateName, messageBody, bodyValues) => {
  const phoneNumber = `+91${mobileNumber}`; // Add country code +91
  const data = {
    fullPhoneNumber: phoneNumber,
    callbackData: 'some_callback_data',
    type: 'Template',
    template: {
      name: templateName,
      body: messageBody,
      languageCode: 'en',
      bodyValues: bodyValues || [],
    }
  };

  console.log('Data being sent:', data); // Log the data object here

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
      console.error('Error sending WhatsApp message:', error.response.data);
    });
};

module.exports = sendWhatsappMessage;
