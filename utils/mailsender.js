const nodemailer = require('nodemailer');

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'irastudentliving@gmail.com', // Replace with your Gmail email
    pass: 'movn crdk ecrj hbad' // Replace with your Gmail password
  }
});

// Function to send email notification
const sendEmail = (recipient, htmlTemplate) => {
  const mailOptions = {
    from: 'irastudentliving@gmail.com', // Replace with your Gmail email
    to: recipient,
    subject: 'Notification from Ira Student Living',
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendEmail;