const express = require("express");
const mongoose = require("mongoose")
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const RoomListing = require("./models/roomListing");
const FormData = require("./models/tenant");
const User = require("./models/User");
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const sendEmail = require('./utils/mailsender');
// const sendWhatsappMessage = require('./utils/whatsappSender');
const { ensureAuthenticated } = require('./middleware/auth');
const flash = require('connect-flash');
const puppeteer = require('puppeteer');

const nodemailer = require("nodemailer");
const { getMaxListeners } = require("events");
// const axios = require('axios');


// making connection with mongodb and checking if any error occured
main().then(() => {
  console.log("connected to the DB");
}).catch((err) => {
  console.log(err);
})
async function main() {
  await mongoose.connect("mongodb+srv://suryakantgupta:LtuEm9hUCyI022AR@cluster0.vfa8ubc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}


app.use(
  session({
    secret: 'irastudentliving', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://suryakantgupta:LtuEm9hUCyI022AR@cluster0.vfa8ubc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', // Replace with your MongoDB connection string
      collectionName: 'sessions', // Optional, default: 'sessions'
    }),
    cookie: {
      maxAge: 48 * 60 * 60 * 1000, // 24 hours (adjust as needed)
    },
  })
);



app.use(passport.initialize());
require('./config/passport')(passport);
app.use(passport.session());




app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.use(flash());

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
app.use((req, res, next) => {
  res.locals.authenticated = req.user;
  console.log("requested user from middleware", req.user);
  next();
});

app.use((req, res, next) => {
  req.headers['if-none-match'] = '';
  req.headers['if-modified-since'] = '';
  next();
});




const generatePDF = async (html, callback) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'], // Add this line to run Puppeteer in non-headless mode
      timeout: 60000 // Increase the timeout to 60 seconds (adjust as needed)
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    callback(null, pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    callback(err);
  }
};


const sendPDFEmail = async (pdfBuffer, recipient) => {
  // Create a reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'irastudentliving@gmail.com', // Replace with your Gmail email
      pass: 'movn crdk ecrj hbad' // Replace with your Gmail password
    }
  });

  // Setup email data with attachments
  const mailOptions = {
    from: 'irastudentliving@gmail.com', // Replace with your Gmail email
    to: recipient,
    subject: 'New Form Submission',
    text: 'Please find attached the form submission in PDF format.',
    attachments: [
      {
        filename: 'form_submission.pdf',
        content: pdfBuffer
      }
    ]
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



app.get("/", (req, res) => {
  res.redirect("/home");
})





// Home page route
app.get("/home", async (req, res) => {
  try {
    let query = {};

    // Apply filters if query parameters are present
    if (req.query.location) {
      query.location = 'Delhi';
    }
    // if (req.query.type) {
    //     query.type = req.query.type;
    // }
    if (req.query.ac) {
      query.ac = req.query.ac === 'true'; // Convert string to boolean
    }

    // Fetch room listings from both Delhi and Noida
    const roomListingsDelhi = await RoomListing.find({ location: 'Delhi', ...query });
    // const roomListingsNoida = await RoomListing.find({ location: 'Noida', ...query }).limit(3);

    // Combine room listings from both cities
    const roomListings = [...roomListingsDelhi];



    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    // Render the tenant view only if the user exists
    res.render('index', {
      roomListings, initialFilters: {
        location: '', // or any default location value
        ac: false,
        nonAc: false,
        // ... (any other initial filter values)
      },
      successMessage: successMessage.length > 0 ? successMessage : null, // Render success message only if it exists
      errorMessage: errorMessage.length > 0 ? errorMessage : null, // Render error message only if it exists
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving room listings");
  }
});


app.get('/profile', ensureAuthenticated, (req, res) => {
  const userId = req.user._id;
  res.redirect(`/tenant_details/${userId}`);
});


// policies page route
app.get("/policies", (req, res) => {
  res.render("policy");
})



// cookie policy page
app.get("/cookie-policy" , (req, res)=>{
  res.render("cookiePolicy")
})


// cookie policy page
app.get("/privacy-policy" , (req, res)=>{
  res.render("privacyPolicy")
})


// cookie policy page
app.get("/terms-of-use" , (req, res)=>{
  res.render("termsOfUse")
})


// contact-us page

app.get("/contact-us" , (req, res)=>{
  res.render("contactUs")
})


// profile page route
app.get("/profile/:id", ensureAuthenticated, async (req, res) => {
  try {
    // Find the user's form data from the database
    const formData = await FormData.findOne({ user: req.user._id }) || {};
    console.log(formData);

    // Render the profile page with the user's form data (or an empty object if no data is found)
    res.render("profile", { formData });
  } catch (err) {
    console.error("Error rendering profile page:", err);
    res.status(500).send("Error rendering profile page");
  }
});



app.put('/update-profile', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedFormData = req.body;

    // Find the existing form data for the user
    let formData = await FormData.findOne({ user: userId });

    if (!formData) {
      // If no form data exists, create a new one
      formData = new FormData({ user: userId, ...updatedFormData });
    } else {
      // If form data exists, update the fields
      Object.assign(formData, updatedFormData);
    }

    // Save the updated form data
    await formData.save();

    // Find the user by ID
    const user = await User.findById(userId);

    // Update the user information with the relevant fields from the form data
    user.name = updatedFormData.name || user.name;
    user.email = updatedFormData.email || user.email;
    user.mobileNumber = updatedFormData.mobileNumber || user.mobileNumber;
    // Update any other user fields as needed

    // Save the updated user
    await user.save();

    // Optionally, you can set a success message
    req.flash('success', 'Profile updated successfully!');

    // Render the tenant_details view with the updated formData and user
    // res.render('tenant', { user, userId, formData, successMessage: req.flash('success'), errorMessage: req.flash('error') });
    res.redirect(`/tenant_details/${userId}`);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Error updating profile');
  }
});


app.get("/room_details/:id", async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomDetails = await RoomListing.findById(roomId);

    if (!roomDetails) {
      return res.status(404).send("Room not found");
    }

    req.session.roomId = roomId;
    // Get the location information from the query parameters

    const roomLocation = roomDetails.location;

    // Query the database for suggested room units based on the user-selected location
    const suggestedRoomListings = await RoomListing.find({ location: roomLocation });

    // console.log(suggestedRoomListings);

    // Pass room details, room location, user-selected location, and suggested room units to the room details page
    res.render("room", { roomDetails, suggestedRoomListings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving room details");
  }
});


// tenant_info page route
app.get('/tenant_info', async (req, res) => {
  const showPaymentPopup = req.query.showPaymentPopup === 'true';

  // Retrieve the roomId from the session or query parameter
  const roomId = req.session.roomId || req.query.roomId;
  console.log("room id : ", roomId);

  let roomDetails = {};
  if (roomId) {
    try {
      roomDetails = await RoomListing.findById(roomId);
      console.log("room details :", roomDetails);
    } catch (err) {
      console.error('Error fetching room details:', err);
    }
  }

  // Render the tenant_info view only if roomDetails is not empty
  if (Object.keys(roomDetails).length > 0) {
    res.render('tenant_info', { showPaymentPopup, roomDetails });
  } else {
    // Handle the case where roomDetails is empty
    // You can redirect to a different page or render an error message
    res.redirect('/home');
  }
});




app.post('/tenant_info', async (req, res) => {
  try {
    const formData = new FormData(req.body);

    // Generate a random password
    const randomPassword = "Welcome@IRA"

     // Retrieve the roomId from the session or query parameter
     const roomId = req.session.roomId || req.query.roomId;

     let roomDetails = {};
     if (roomId) {
       try {
         roomDetails = await RoomListing.findById(roomId);
         console.log("room details :", roomDetails);
       } catch (err) {
         console.error('Error fetching room details:', err);
       }
     }

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: randomPassword,
    });

    console.log(`Random password for ${newUser.name}: ${randomPassword}`);

    const user = await newUser.save();
    formData.user = user._id;
    await formData.save();

    req.login(user, async (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/tenant_info');
      }

      // Email address where you want to send the form data
      const email = 'irastudentliving@gmail.com';

      // Call the mailSender function with the email address and form data
      sendEmail(formData, email);

      const userData = {
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        password: randomPassword
      };

      sendEmail(userData, formData.email);

      console.log('User session:', req.session.passport.user);

      // Render the tenant_info.ejs view with showPaymentPopup set to true
      res.render('tenant_info', { showPaymentPopup: true , roomDetails}, async (err, html) => {
        if (err) {
          console.error('Error rendering HTML:', err);
          return res.redirect('/tenant_info');
        }

        // Generate PDF from the rendered HTML
        generatePDF(html, (err, pdfBuffer) => {
          if (err) {
            console.error('Error generating PDF:', err);
            return res.redirect('/tenant_info');
          }

          // Send the PDF as an email attachment
          sendPDFEmail(pdfBuffer, email);
        });
      });
      res.render('tenant_info', { showPaymentPopup: true , roomDetails});
    });
  } catch (err) {
    console.error(err);
    res.redirect('/tenant_info');
  }
});


app.post('/submit-payment', ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const formData = await FormData.findOne({ user: user._id });
    const UTR = req.body;

    if (!formData) {
      return res.status(404).send('Form data not found');
    }

    formData.paymentInformation = req.body;
    await formData.save();

    // Email address where you want to send the form data
    const email = 'irastudentliving@gmail.com';

    // Call the mailSender function with the email address and form data
    sendEmail(UTR, email);

    return res.redirect('/tenant_details/' + user._id);
  } catch (err) {
    console.error(err);
    res.redirect('/tenant_info');
  }
});








app.get('/tenant_details/:userId', ensureAuthenticated, async (req, res) => {
  console.log('Entering tenant_details route');

  try {
    const userId = req.params.userId;
    console.log('User ID from URL:', userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    // Render the tenant view only if the user exists
    res.render('tenant', {
      user,
      userId,
      successMessage: successMessage.length > 0 ? successMessage : null, // Render success message only if it exists
      errorMessage: errorMessage.length > 0 ? errorMessage : null, // Render error message only if it exists
    });
  } catch (err) {
    console.error('Error rendering tenant details page:', err);
    res.status(500).send('Error rendering tenant details page');
  }
});
// about us page route
app.get("/about-us", (req, res) => {
  res.render("about");
})

// vacate page route
app.get("/vacate-request", (req, res) => {
  res.render("vacate_form");
})

app.post(
  '/login/phone',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    const userId = req.user.id;
    res.redirect(`/tenant_details/${userId}`);
  }
);

app.post(
  '/login/email',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    const userId = req.user.id;
    res.redirect(`/tenant_details/${userId}`);
  }
);


// Login page route
app.get('/login', (req, res) => {
  res.render('login');
});


// logout route
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Error logging out');
    }
    // Redirect or send a response after successful logout
    res.redirect('/home');
  });
})

app.post('/send-data', (req, res) => {
  // Extract form data from the request body
  console.log(req.body);
  const formData = req.body;
  console.log(formData);

  // Email address where you want to send the form data
  const email = ['irastudentliving@gmail.com', formData.email];

  // Call the mailSender function with the email address and form data
  sendEmail(formData, email);

  // Set a flash message
  req.flash('success', 'Form data sent successfully!');

  // Send response back to the client
  res.redirect('/'); // Replace '/some-route' with the route you want to redirect to after setting the flash message
});

app.post('/send-contact-data', (req, res) => {
  // Extract form data from the request body
  console.log(req.body);
  const formData = req.body;
  console.log(formData);

  // Email address where you want to send the form data
  const email = ['irastudentliving@gmail.com', formData.email];

  // Call the mailSender function with the email address and form data
  sendEmail(formData, email);

  // Set a flash message
  req.flash('success', 'Form data sent successfully!');

  // Send response back to the client
  res.redirect('/contact-us'); // Replace '/some-route' with the route you want to redirect to after setting the flash message
});




// app.js

app.get('/get-room-number', ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const formData = await FormData.findOne({ user: user._id });

    if (!formData) {
      return res.status(404).json({ error: 'Form data not found' });
    }

    res.json({ roomNumber: formData.roomNumber });
  } catch (error) {
    console.error('Error fetching room number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.post('/sendd-data', async (req, res) => {
  // Extract form data from the request body
  const formData = req.body;
  console.log(formData);

  // Get the user's email from the session
  const userEmail = req.user.email;

  // Email address where you want to send the form data (owner's email)
  const ownerEmail = 'irastudentliving@gmail.com';

  

  // Prepare the notification data
  const notificationData = {
    requestType: formData.requestType,
    roomNumber: formData.roomNumber,
    requestNumber: formData.requestNumber,
    userEmail,
    
  };

  // Call the mailSender function with the notification data
  sendEmail(notificationData, [ownerEmail, userEmail]);

  // Set a flash message
  req.flash('success', 'Request submitted successfully!');




  res.redirect(`/tenant_details/${req.user._id}`);
});






// rent receipt generator

function generateRentReceiptHTML(userData, startDate, endDate) {
  // Replace the placeholders with actual user data
  const rentReceiptHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>House Rent Receipt</title>
      <style>
      
        h1{
          text-align:center;
          margin-block:1.5rem;
        }
      </style>
    </head>
    <body>
      <h1>House Rent Receipt</h1>
      <p>Date Range: ${startDate} - ${endDate}</p>
      <p>This is to acknowledge the receipt from ${userData.name} the sum of rupees ${userData.rentAmount}/- (Rs. ${userData.rentAmountInWords}) in lieu of rent payment for the specified date range, towards the property bearing the address: "${userData.propertyAddress}".</p>
      <p>Owner's Name and Address:</p>
      <p>${userData.ownerName}</p>
      <p>${userData.ownerAddress}</p>
      <div class="signature">Signature</div>
      <div class="signature">(${userData.ownerName})</div>
    </body>
    </html>
  `;

  return rentReceiptHTML;
}



function convertNumberToWords(number) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  function convert_millions(num) {
    if (num >= 1000000) {
      return convert_millions(Math.floor(num / 1000000)) + " million " + convert_thousands(num % 1000000);
    } else {
      return convert_thousands(num);
    }
  }

  function convert_thousands(num) {
    if (num >= 1000) {
      return convert_hundreds(Math.floor(num / 1000)) + " thousand " + convert_hundreds(num % 1000);
    } else {
      return convert_hundreds(num);
    }
  }

  function convert_hundreds(num) {
    if (num > 99) {
      return ones[Math.floor(num / 100)] + " hundred " + convert_tens(num % 100);
    } else {
      return convert_tens(num);
    }
  }

  function convert_tens(num) {
    if (num < 10) return ones[num];
    else if (num >= 10 && num < 20) return teens[num - 10];
    else {
      return tens[Math.floor(num / 10)] + " " + ones[num % 10];
    }
  }

  return convert_millions(number) + " rupees";
}




app.post('/generate-rent-receipt', ensureAuthenticated, async (req, res) => {
  const user = req.user;
  try {
    const { startDate, endDate } = req.body;
    const formData = await FormData.findOne({ user: user._id });
    if (!formData) {
      req.flash('error', 'Form data not found');
      return res.redirect(`/tenant_details/${user._id}`);
    }

    // Fetch room data based on room number and building number
    const roomNumber = formData.roomNumber;
    const buildingNumber = formData.buildingNumber;
    const roomData = await RoomListing.findOne({ roomNumber, buildingNumber });
    if (!roomData) {
      req.flash('error', 'Room data not found');
      return res.redirect(`/tenant_details/${user._id}`);
    }

    // Calculate the number of months between startDate and endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    // const amount = roomData.price * months;
    // Fetch user data and property details from the user and formData
    const userData = {
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      propertyAddress: roomData.location,
      ownerName: "IRA Student Living",
      ownerAddress: "owner address",
      rentAmount: roomData.price,
      rentAmountInWords: convertNumberToWords(roomData.price),
    };

    const rentReceiptHTML = generateRentReceiptHTML(userData, startDate, endDate);
    generatePDF(rentReceiptHTML, (err, pdfBuffer) => {
      if (err) {
        console.error('Error generating PDF:', err);
        req.flash('error', 'Error generating PDF');
        return res.redirect(`/tenant_details/${user._id}`);
      }

      // Send the PDF as an email attachment
      const recipient = "bgmilelomujhse@gmail.com";
      sendPDFEmail(pdfBuffer, recipient);

      // Set a flash message
      req.flash('success', 'Rent receipt sent successfully!');
      res.redirect(`/tenant_details/${user._id}`);
    });
  } catch (error) {
    console.error('Error generating rent receipt:', error);
    req.flash('error', 'Rent receipt not generated');
    res.redirect(`/tenant_details/${user._id}`);
  }
});








app.all("*", (req, res) => {
  res.render("error");
});

app.listen(3100, () => {
  console.log("Listening on port 3100");
})