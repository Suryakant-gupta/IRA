const express = require("express");
const mongoose = require("mongoose")
const app = express();
const path = require("path");
const User = require("./models/User");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const RoomListing = require("./models/roomListing");
const VacateRequest = require("./models/vacateRequest");
const FormData = require("./models/tenant");
const ServiceRequest = require('./models/serviceRequest');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const sendEmail = require('./utils/mailsender');
const sendWhatsappMessage = require('./utils/whatsappSender');
const { ensureAuthenticated } = require('./middleware/auth');
const flash = require('connect-flash');
const puppeteer = require('puppeteer');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const ownerNumber = 8595606089;



// making connection with mongodb and checking if any error occured
main().then(() => {
  console.log("connected to the DB");
}).catch((err) => {
  console.log(err);
})
async function main() {
  await mongoose.connect("mongodb://iraUser:IralivingDB%402604@93.127.195.9:27017/admin");
}


app.use(
  session({
    secret: 'irastudentliving', 
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb://iraUser:IralivingDB%402604@93.127.195.9:27017/admin', 
      collectionName: 'sessions', 
    }),
    cookie: {
      maxAge: 48 * 60 * 60 * 1000, // 48 hours (adjust as needed)
    },
  })
);



app.use(passport.initialize());
require('./config/passport')(passport);
app.use(passport.session());




app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.locals.loop = [];
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
require('dotenv').config();

app.use(flash());

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

// sendWhatsappMessage('7084992604', 'amc_due', 'This is a default message.');

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

app.get('/profile', ensureAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (user.role === 'tenant') {
    res.redirect(`/tenant_details/${userId}`);
  } else if (user.role === 'admin') {
    res.redirect('/admin/admin-panel');
  } else if (user.role === 'manager') {
    res.redirect('/manager/manager-panel');
  } else {
    // Handle any other roles or send an error response
    res.status(400).send('Invalid user role');
  }
});

// policies page route
app.get("/policies", (req, res) => {
  res.render("policy");
})



// cookie policy page
app.get("/cookie-policy", (req, res) => {
  res.render("cookiePolicy")
})


// cookie policy page
app.get("/privacy-policy", (req, res) => {
  res.render("privacyPolicy")
})


// cookie policy page
app.get("/terms-of-use", (req, res) => {
  res.render("termsOfUse")
})


// faq page
app.get("/faq", (req, res) => {
  res.render("faq")
})


// contact-us page

app.get("/contact-us", (req, res) => {
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
  const buildingNumbers = await RoomListing.distinct('buildingNumber');
  const rooms = await RoomListing.find();

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
    res.render('tenant_info', { showPaymentPopup, roomDetails, buildingNumbers, rooms });
  } else {
    // Handle the case where roomDetails is empty
    // You can redirect to a different page or render an error message
    res.redirect('/home');
  }
});



app.get('/get-room-details', async (req, res) => {
  const { buildingNumber, roomNumber } = req.query;

  try {

    const roomDetails = await RoomListing.findOne({ buildingNumber, roomNumber });

    if (!roomDetails) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(roomDetails);
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// sendWhatsappMessage(7084992604);
app.post('/tenant_info', async (req, res) => {
  try {
    const formData = new FormData(req.body);
    const roomId = formData.get('roomId');

    // Generate a random password
    const randomPassword = "Welcome@IRA"

    // Retrieve the roomId from the session or query parameter
    // const roomId = req.session.roomId || req.query.roomId;

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
      role: "tenant",
      password: randomPassword,
      createdAt: req.body.agreementStartDate,
    });



    console.log(`Random password for ${newUser.name}: ${randomPassword}`);

    const user = await newUser.save();
    if (user.role === 'tenant') {
      formData.user = user._id;
    } else {
      console.log('User role is not tenant, skipping user ID assignment to formData');
    }
    formData.room = roomId;
    await formData.save();


    // Find the corresponding RoomListing document
    const roomNumber = formData.roomNumber;
    const buildingNumber = formData.buildingNumber;
    const roomListing = await RoomListing.findOne({ roomNumber, buildingNumber });

    // Update the availability of the room to 'unavailable'
    if (roomListing) {
      roomListing.availability = 'unavailable';
      await roomListing.save();
    }



    req.login(user, async (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/tenant_info');
      }

      // Email address where you want to send the form data
      const email = 'irastudentliving@gmail.com';


      const userData = {
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        role: newUser.role,
        password: randomPassword
      };

      const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>User Registration</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #fff;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  padding: 20px;
              }
              h1 {
                  text-align: center;
                  margin-bottom: 20px;
              }
              .user-info {
                  margin-bottom: 10px;
              }
              .user-info strong {
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>New User Registration</h1>
              <div class="user-info">
                  <strong>Name:</strong> ${userData.name}
              </div>
              <div class="user-info">
                  <strong>Email:</strong> ${userData.email}
              </div>
              <div class="user-info">
                  <strong>Mobile Number:</strong> ${userData.mobileNumber}
              </div>
              <div class="user-info">
                  <strong>Password:</strong> ${userData.password}
              </div>
          </div>
      </body>
      </html>
`;

      sendEmail(formData.email, htmlTemplate);

      console.log('User session:', req.session.passport.user);
      const buildingNumbers = await RoomListing.distinct('buildingNumber');
      const rooms = await RoomListing.find();

      // Render the tenant_info.ejs view with showPaymentPopup set to true
      res.render('tenant_info', { showPaymentPopup: true, roomDetails, buildingNumbers, rooms }, async (err, html) => {
        if (err) {
          console.error('Error rendering HTML:', err);
          return res.redirect('/tenant_info');
        }


        const infoFormPdf = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <!-- <link rel="stylesheet" href="/public/css/style.css"> -->
        
            <style>
                *,
        *::after,
        *::before {
            margin: 0;
            padding: 0;
            -webkit-box-sizing: border-box;
                    box-sizing: border-box;
        }
        
        html,
        body {
            height: 100%;
            width: 100%;
        }
        
        .main-page {
            width: 100%;
            position: relative;
            font-family: "roboto", sans-serif;
            position: relative;
        }
                .payment-popup{
            position: absolute;
            top: 0;
            z-index: 999;
            display: none;
        }
        .show-popup{
            position: absolute;
            top: 0;
            z-index: 999;
            display: flex;
        }
        
        .info-pad{
            padding-inline: 5vw;
            padding-block: 5vw;
        }
        .opt{
            width: 350px;
            border-bottom: 2px solid #7b7b7b;
            display: flex;
            align-items: center;
            justify-content: space-between;
            
            border-radius: 6px;
            padding-inline: .5rem;
        
        }
        
        .opt input{
            background:transparent;
            border: none;
            width: 70px;
            text-align: center;
           
        
        }
        
        .f-h{
            margin-block: 1.5rem;
            height: 2px;
            border: 1.5px solid #929292;
        }
        
        .s-h{
            margin-block: 1.5rem;
            height: 2px;
            border: 1.5px solid #E7991C;
        }
        
        .calc-img{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
            margin-block: 1.5rem;
        }
        .rm-1{
            margin-bottom: 1.5rem;
        }
        .calc{
            width: 70%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            flex-direction: column;
            gap: 1.5rem;
            
        }
        
        .rent-calc{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
           
            gap: 1.5vw;
        }
        .rent-calc .f-c{
           width: 40%;
           border-bottom: 2px solid #7b7b7b;
           border-radius: 6px;
        }
        .l-c span{
            display: inline-block;
            text-align: center;
            /* width: 50px; */
            border-bottom: 2px solid #7b7b7b;
            border-radius: 6px;
        }
        .sel{
           
            position: relative;
            width: 13%;
            border-bottom: 2px solid #7b7b7b;
            border-radius: 6px; 
            display: flex;
            align-items: center;
            justify-content:center;
        }
        .rent-calc select{
           width: 10px;
           height: 5px;
           
        }
        .rent-sec{
            width: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
           
            gap: 1rem;
        }
        .rent-sec p{
            color: #959595;
            line-height: 2;
        }
        .agree{
            width: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
           
            gap: 1rem;
        }
        .agree p{
            line-height: 2;
        }
        .agree p span{
            color: #E7991C;
        }
        
        .room-num, .s-p{
            width: 40%;
        }
        
        .s-p{
            border-bottom: 2px solid #7b7b7b;
            border-radius: 6px; 
        }
        
        .upload-img{
            width: 30%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-direction: column;
            gap: 1rem;
        }
        .circle{
            display: none;
            width: 80px;
            height: 80px;
            background-color: #cfcaca;
            border-radius: 50%;
        }
        .upload{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }
        
        .agree-sheet{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .sheet{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            
            gap: 1.5rem;
        }
        
        
        
        .sheet p{
            width: 32%;
            border-bottom: 2px solid #7b7b7b;
            border-radius: 6px;
            line-height: 2;
            color: #959595;
            padding-left: 1vw;
        }
        
        .bb-n{
            border-bottom: none;
        }
        
        .rules{
            color: #959595;
            margin-bottom: 1.5rem;
        }
        
        .note{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            position: relative;
            border: 2px solid #7b7b7b;
            padding: 1rem;
            border-radius: 6px;
        }
        
        .note p{
            margin-bottom: 2rem;
            text-align: center;
            font-size: .9rem;
            color: #E7991C;
        }
        
        .note p span{
           font-size: 1rem;
           font-weight: bold;
            color: #000;
        }
        
        
        .note a{
        
            position: absolute;
            bottom: 10px;
            right: 10px;
        }
        
        .info-form{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1vw;
            margin-block: 1.8rem;
        }
        
        .info-form input, textarea{
            border: 2px solid #baadada8;
            padding:.5rem 1vw;
            border-radius: 5px;
            /* text-transform: uppercase; */
        }
        
        .info-form input::placeholder, textarea::placeholder{
           color: #959595;
           font-family: roboto;
           font-weight: 500;
        }
        
        .form1{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1vw;
        }
        
        .form1 input:first-child{
            width: 50%;
        }
        .form1 input:nth-child(2){
            width: 40%;
        }
        
        .form1 input:last-child{
            width: 10%;
        }
        .form2{
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1vw;
        }
        .form2 input{
            width: 100%;
            flex-wrap: wrap;
        }
        
        .textarea-form, textarea{
            width: 100%;
            resize: none;
        }
        
        .form3{
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1vw;
        }
        .form3 input{
            width: 100%;
            
        }
        
        .emer{
            text-align: center;
            color: #E7991C;
            margin-bottom: 1.5rem;
        }
        
        .contact-table{
            width: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            flex-direction: column;
        }
        .row{
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #7b7b7b;
            border-bottom: none;
            
        }
        .row:last-child{
            border-bottom: 2px solid #7b7b7b;
        }
        .col{
            width: 25%;
            height: 40px;
            
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7b7b7b;
            font-family: roboto;
            text-align: center;
            /* padding: .5rem 1rem; */
        }
        .col:first-child{
            width: 15%;
            
           
        }
        .col:nth-child(3){
            width: 35%;
            border-right: 2px solid #7b7b7b;
            border-left: 2px solid #7b7b7b;
           
        }
        .col:nth-child(2){
            border-left: 2px solid #7b7b7b;
        }
        .col:nth-child(2),.col:last-child {
            width: 25%;
           
        }
        .col input{
            width: 100%;
            height: 100%;
            border: none;
            background-color: #FDFAEF;
        }
        .col input:focus{
           outline: none;
        }
        
        .dec{
            font-weight: bold;
            font-size: .9rem;
            margin-top: 1.5rem;
            margin-bottom:.8rem;
        }
        
        .dec-p{
            color: #7b7b7b;
        }
        
        
        .verify{
            width: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-top: 1.5rem;
            padding-bottom:  5rem;
            gap: 2vw;
        }
        .sign{
            /* width: 100%; */
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: .5rem;
            
        }
        
        .verify .c-b{
            background-color: #E7991C;
            padding-inline: 2rem;
            padding-block: .5rem;
            border-radius: 5px;
            text-transform: uppercase;
            border: none;
        }
        
        .sign a:last-child{
            font-weight: normal;
            color: blue;
            text-transform: capitalize;
        }
        .top-head {
            color: #929292;
            font-family: "roboto", sans-serif;
            padding-block: 2rem;
            text-align: center;
        }
        
            </style>
        </head>
        <body>
            <div class="main-page info">
            <h2 class="top-head">TENANT INFORMATION FORM</h2>

            <form class="info-pad">
                <div class="opt build-num">
                    <p>Building Number</p>
                    <div>
                        <input type="text" name="buildingNumber" value="<%= formData.buildingNumber %>" readonly>
                    </div>
                </div>
                <hr class="f-h">
    
                <div class="calc-img">
                    <div class="calc">
                        <div class="opt room-num rm-1">
                            <p>Room Number</p>
                            <div>
                                <input type="text" name="roomNumber" value="<%= formData.roomNumber %>" readonly>
                            </div>
                        </div>
                        <div class="rent-calc">
                            <p class="f-c">Rent per dat X days</p>
                            <div class="sel">
                                <p><%= formData.rentPerDay %></p>
                            </div>
                            <p class="l-c">X &nbsp;&nbsp; <span style="width: 25px;" id="daysRemainingInMonth"><%= formData.daysRemainingInMonth %></span> &nbsp;&nbsp; = &nbsp;&nbsp; <span id="rentForRemainingDays"><%= formData.rentForRemainingDays %></span></p>
                        </div>
    
                        <div class="rent-sec">
                            <div class="opt room-num">
                                <p>Rent per month</p>
                                <div>
                                    <input type="text" name="rentPerMonth" value="<%= formData.rentPerMonth %>" readonly>
                                </div>
                            </div>
                            <p class="s-p">Security</p>
                        </div>
    
                        <div class="agree">
                            <p class="s-p">-*Agreement <span>-Rs. 500</span></p>
                            <p class="s-p">Total <%= formData.totalRent %></p>
                        </div>
                    </div>
                </div>
    
                <hr class="s-h">
    
                <div class="agree-sheet">
                    <div class="sheet sheet1">
                        <p id="inDate"><%= formData.inDate %></p>
                        <p id="agreementStartDate"><%= formData.agreementStartDate %></p>
                        <p id="agreementEndDate"><%= formData.agreementEndDate %></p>
                    </div>
                    <div class="sheet sheet2">
                        <p id="lockInDate"><%= formData.lockInDate %></p>
                        <div class="opt room-unit">
                            <p class="bb-n" style="border-bottom: none !important;">Room unit</p>
                            <div>
                                <input type="text" name="roomUnit" value="<%= formData.roomUnit %>" readonly>
                            </div>
                        </div>
                        <p>Bathroom unit</p>
                    </div>
                </div>
    
                <hr class="f-h">
    
                <div class="rules">
                    <p>
                        1. Please refer to the annexure at the back of this page for monthly rent of the rooms and per day rent.
                    </p>
                    <p>
                        2. Per day rent is calculated only in case the tenant occupies the room before the start of the month.
                    </p>
                </div>
    
                <div class="note">
                    <p><span>Note- </span>SECURITY AMOUNT WILL NOT BE REFUNDED IF THE STAY IS LESS THAN 3 MONTH + 1 MONTH NOTICE RENT ONCE PAID WILL NOT BE REFUNDED UNDER ANY CIRCUMSTANCES</p>
                </div>
    
                <div class="info-form">
                    <div class="form1">
                        <input type="text" name="name" placeholder="Name" id="" value="<%= formData.name %>">
                        <input type="text" name="dob" placeholder="Date of Birth" id="" value="<%= formData.dob %>">
                        <input type="text" placeholder="age" name="age" value="<%= formData.age %>">
                    </div>
    
                    <div class="form2">
                        <input type="text" name="mobileNumber" placeholder="Mobile number" id="" value="<%= formData.mobileNumber %>">
                        <input type="text" name="whatsappNumber" placeholder="Whatsapp number" id="" value="<%= formData.whatsappNumber %>">
                        <input type="text" name="aadharNumber" placeholder="Aadhar card number" id="" value="<%= formData.aadharNumber %>">
                        <input type="text" name="email" placeholder="Email id" id="" value="<%= formData.email %>">
                    </div>
                    <div action="/submit-from" method="post" class="textarea-form">
                        <textarea name="address" placeholder="Residential Address" id=""><%= formData.address %></textarea>
                    </div>
    
                    <div class="form3">
                        <input type="text" name="fathersName" placeholder="Father's name" id="" value="<%= formData.fathersName %>">
                        <input type="text" name="fathersOccupation" placeholder="Father's Occupation" id="" value="<%= formData.fathersOccupation %>">
                        <input type="number" name="fathersContactNumber" placeholder="Father's contact number" id="" value="<%= formData.fathersContactNumber %>">
                        <input type="number" name="homePhone" placeholder="Home Phone" id="" value="<%= formData.homePhone %>">
                        <input type="text" name="mothersName" placeholder="Mother's name" id="" value="<%= formData.mothersName %>">
                        <input type="text" name="siblingName" placeholder="Brother's/sister's name" id="" value="<%= formData.siblingName %>">
                        <input type="text" name="propertyDealer" placeholder="Property Dealer" id="" value="<%= formData.propertyDealer %>">
                        <input type="text" name="durationOfStay" placeholder="Duration of stay" id="" value="<%= formData.durationOfStay %>">
                        <input type="number" name="dealersContactNumber" placeholder="Dealer's Contact number" id="" value="<%= formData.dealersContactNumber %>">
                        <input type="text" name="policeStationHomeTown" placeholder="Police station home town" id="" value="<%= formData.policeStationHomeTown %>">
                    </div>
                </div>
    
        
                            <h3 class="emer">People to Contact In Case of Emergency</h3>
        
                            <div action="" id="contactTableForm">
                            <div class="contact-table">
                                <div class="row r-1">
                                    <p class="col c-1"></p>
                                    <p class="col c-2">NAME</p>
                                    <p class="col c-3">CONTACT NUMBER</p>
                                    <p class="col c-4">RELATION</p>
                                </div>
                                <% formData.contactTable.forEach(function(contact, index) { %>
                                <div class="row">
                                    <p class="col c-1"><%= contact.type %></p>
                                    <p class="col c-2"><input type="text" name="contactTable[<%= index %>][name]" value="<%= contact.name %>"></p>
                                    <p class="col c-3"><input type="text" name="contactTable[<%= index %>][contactNumber]" value="<%= contact.contactNumber %>"></p>
                                    <p class="col c-4"><input type="text" name="contactTable[<%= index %>][relation]" value="<%= contact.relation %>"></p>
                                </div>
                                <% }); %>
                            </div>
                        </div>
        
                            <h3 class="dec">DECLARATION-</h3>
        
                            <p class="dec-p">i hereby declare that above particulars of information and facts started are true ,
                                correct
                                and complete to the best of my knowledge and belief.</p>
        
                            
                        </form>
        
        
                       
            </div>
        </body>
        
        
        </html>
        `

        // Generate PDF from the rendered HTML
        generatePDF(infoFormPdf, (err, pdfBuffer) => {
          if (err) {
            console.error('Error generating PDF:', err);
            return res.redirect('/tenant_info');
          }

          // Send the PDF as an email attachment
          sendPDFEmail(pdfBuffer, email);
        });
      });
      res.render('tenant_info', { showPaymentPopup: true, roomDetails });
    });
  } catch (err) {
    console.error(err);
    res.redirect('/tenant_info');
  }
});


// sendWhatsappMessage(7084992604);
app.post('/submit-payment', ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const userEmail = req.user.email;
    const userMobile = req.user.mobileNumber;
    const formData = await FormData.findOne({ user: user._id });
    const UTR = req.body.UTR;

    if (!formData) {
      return res.status(404).send('Form data not found');
    }

    formData.paymentInformation = req.body;
    await formData.save();

    // Email address where you want to send the form data
    const email = 'irastudentliving@gmail.com';

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UTR Notification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f8f8;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }

        .info {
          margin-bottom: 10px;
        }

        .info label {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>UTR Notification</h1>
        <div class="info">
          <label>User Email:</label>
          <span>${userEmail}</span>
        </div>
        <div class="info">
          <label>UTR:</label>
          <span>${UTR}</span>
        </div>
      </div>
    </body>
    </html>
  `;



    // Call the mailSender function with the email address and form data
    sendEmail(email, htmlTemplate);
    sendWhatsappMessage(userMobile , "payment_notification_to_tenant" ,"Thank you for attempting to make the payment. Please reply with screenshot of the receipt or payment successful page for confirmation. Thank you for your prompt attention to this matter." );

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

    const formDataDoc = await FormData.findOne({ user: userId });
    const roomId = formDataDoc.room;

    if (!user) {
      return res.status(404).send('User not found');
    }

    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    // Find all open service requests for the current user
    const openServiceRequests = await ServiceRequest.find({
      user: req.user._id,
      status: 'open',
    });

    console.log("open service requests", openServiceRequests);

    const rentPayment = await RentPayment.findOne({ user: userId, room: roomId })
      .sort({ createdAt: -1 })
      .exec();


    // Render the tenant view only if the user exists
    res.render('tenant', {
      user,
      userId,
      openServiceRequests,
      successMessage: successMessage.length > 0 ? successMessage : null, // Render success message only if it exists
      errorMessage: errorMessage.length > 0 ? errorMessage : null,
      rentPayment, formDataDoc // Render error message only if it exists
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
app.get("/vacate-request", ensureAuthenticated, (req, res) => {
  res.render("vacate_form", { user: req.user });
})


app.get('/check-vacate-eligibility', async (req, res) => {
  const { user } = req;

  if (!user || user.role !== 'tenant') {
    return res.status(403).json({ eligible: false, message: 'Only tenants can make a vacate request.' });
  }

  const createdAtDate = user.createdAt;
  const threeMonthsAgo = new Date(Date.now() - (3 * 30 * 24 * 60 * 60 * 1000));

  if (createdAtDate < threeMonthsAgo) {
    res.json({ eligible: true });
  } else {
    res.json({ eligible: false, message: 'You cannot make a vacate request before 3 months of onboarding.' });
  }
});

// sendWhatsappMessage(7084992604);
app.post('/submit-vacate-request', ensureAuthenticated, async (req, res) => {
  const { userId, roomNumber, buildingNumber } = req.body;
  const formData = await FormData.findOne({ user: userId });
  try {
    const vacateRequest = new VacateRequest({ userId, roomNumber, buildingNumber });
    await vacateRequest.save();
    const bodyValues = [formData.name,roomNumber];
    sendWhatsappMessage(ownerNumber , "vacate_request_notification_for_owner" , "Tenant {{1}} from Room {{2}} has submitted a request to vacate. Please take necessary actions.", bodyValues)
    sendWhatsappMessage(formData.mobileNumber , "vacate_request" , "Your vacate request has been received. Our team will contact you soon to discuss the next steps with clearing the dues and schedule any necessary inspections. Thank you.")

    // Set success flash message
    req.flash('success', 'Vacate request submitted successfully!');

    // Redirect to the tenant_details route with the userId as a query parameter
    res.redirect('/tenant_details/' + userId);
  } catch (error) {
    console.error('Error submitting vacate request:', error);

    // Set error flash message
    req.flash('error', 'An error occurred while submitting the vacate request.');

    // Redirect to the tenant_details route with the userId as a query parameter
    res.redirect('/tenant_details/' + userId);
  }
});


app.post(
  '/login/phone',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    const userId = req.user.id;
    if (req.user.role === 'tenant') {
      res.redirect(`/tenant_details/${userId}`);
    } else {
      res.redirect('/login'); // Redirect to login page if not a tenant
    }
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
    if (req.user.role === 'tenant') {
      res.redirect(`/tenant_details/${userId}`);
    } else {
      res.redirect('/login'); // Redirect to login page if not a tenant
    }
  }
);


// Login page route
app.get('/login', (req, res) => {
  res.render('login');
});


// logout route
app.get("/logout", (req, res) => {
  if (!req.user) {
    return res.status(400).send('No user is currently logged in');
  }

  // Retrieve the user's role
  const userRole = req.user.role;

  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Error logging out');
    }

    // Redirect based on user role
    if (userRole === 'tenant') {
      res.redirect('/home');
    } else if (userRole === 'admin' || userRole === 'manager') {
      res.redirect('/panel-login');
    } else {
      res.redirect('/home'); // Default redirection
    }
  });
})


// sendWhatsappMessage(7084992604); /owner getting leads
app.post('/send-data', (req, res) => {
  // Extract form data from the request body
  console.log(req.body);
  const formData = req.body;
  console.log(formData);

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Data</title>
    <style>
        /* CSS styles */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FDFAEF;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 50px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        .info {
            margin-bottom: 10px;
        }
        .info strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Form Data</h1>
        <div class="info">
            <strong>Name:</strong> ${formData.name}
        </div>
        <div class="info">
            <strong>Mobile Number:</strong> ${formData.numer}
        </div>
        <div class="info">
            <strong>Email:</strong> ${formData.email}
        </div>
        <div class="info">
            <strong>City:</strong> ${formData.city}
        </div>
        <div class="info">
            <strong>Location:</strong> ${formData.location}
        </div>
        <div class="info">
            <strong>Accommodation Type:</strong> ${formData.accommodation}
        </div>
    </div>
</body>
</html>
`;

  // Email address where you want to send the form data
  const email = ['irastudentliving@gmail.com', formData.email];

  // Call the mailSender function with the email address and form data
  sendEmail(email, htmlTemplate);
  sendWhatsappMessage('8744906520', 'lead_notification_to_manager', 'You have a new lead for Ira Student Living. Please check your email for the details.');
  const ackmsg = `Hi {{1}}, Thank you for showing interest in Ira Student Living. Someone will get back to you soon, and proactively you may also reply to this message for any questions or concerns.`;
  const bodyValues = [formData.name];
  sendWhatsappMessage(formData.numer, 'inquiry_acknowledge_to_tenant', ackmsg, bodyValues);


  // Set a flash message
  req.flash('success', 'Form data sent successfully!');

  // Send response back to the client
  res.redirect('/'); // Replace '/some-route' with the route you want to redirect to after setting the flash message
});

// sendWhatsappMessage(7084992604);
app.post('/send-contact-data', (req, res) => {
  // Extract form data from the request body
  console.log(req.body);
  const formData = req.body;
  console.log(formData);

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Data</title>
    <style>
        /* CSS styles */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FDFAEF;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 50px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        .info {
            margin-bottom: 10px;
        }
        .info strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Form Data</h1>
        <div class="info">
            <strong>Name:</strong> ${formData.name}
        </div>
        <div class="info">
            <strong>Mobile Number:</strong> ${formData.numer}
        </div>
        <div class="info">
            <strong>Email:</strong> ${formData.email}
        </div>
        <div class="info">
            <strong>City:</strong> ${formData.city}
        </div>
        <div class="info">
            <strong>Location:</strong> ${formData.location}
        </div>
        <div class="info">
            <strong>Accommodation Type:</strong> ${formData.accommodation}
        </div>
    </div>
</body>
</html>
`;

  // Email address where you want to send the form data
  const email = ['irastudentliving@gmail.com', formData.email];

  // Call the mailSender function with the email address and form data
  sendEmail(email, htmlTemplate);

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






// sendWhatsappMessage(7084992604); to send request info
app.post('/sendd-data', async (req, res) => {
  // Extract form data from the request body
  const formData = req.body;
  console.log(formData);

  // Get the user's email from the session
  const userEmail = req.user.email;
  const userNumber = req.user.mobileNumber;

  // Email address where you want to send the form data (owner's email)
  const ownerEmail = 'irastudentliving@gmail.com';

  // Prepare the notification data
  const notificationData = {
    requestType: formData.requestType,
    roomNumber: formData.roomNumber,
    buildingNumber: formData.buildingNumber,
    requestNumber: formData.requestNumber,
    userEmail,
  };

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>User Registration</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
          }

          req-popup{
            background-color:#FDFAEF;
            width:100%;
            display: flex;
          align-items: center;
          justify-content: center;
          }
          .popup-3{background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            max-width: 500px; /* Set a maximum width for the popup */
            width: 100%; /* Make the popup responsive */
            position: relative;
        }
        
        .popup-3 h3{
            font-weight: normal;
            padding-inline: 5vw;
            border-bottom: 2px solid #E7991C;
            line-height: 2;
            border-radius: 10px;
            text-align:center;
            
        }
        .room{
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          gap: 2.5rem;
      }
      
      
      
      .room p{
          width: 50%;
          border-bottom: 2px solid #929292;
          border-radius: 10px;
          padding-inline: 1vw;
          line-height: 2;
      }

      </style>
  </head>
  <body>
  <div class="req-pop">
  <section class="popup-3">
    
    <form >
      <h3>Request TYPE - <b id="request-type">${formData.requestType}</b></h3>
      <div class="room">
        <p>Room No. - <span id="room-number">${formData.roomNumber}</span></p>
        <p>Request No. - <span id="request-number">${formData.requestNumber}</span></p>
      </div>
      
      
    </form>
  </section>
</div>
  </body>
  </html>
`;

  // Call the mailSender function with the notification data
  sendEmail([ownerEmail, userEmail], htmlTemplate);
  // const bodyValues = [formData.requestType,formData.requestNumber,formData.roomNumber];
  sendWhatsappMessage(ownerNumber, "sr_for_owner" , "A new {{1}} service request has been submitted. Ticket number: {{2}} from Room {{3}} . Please review the details and arrange for the cleaning team to contact the tenant to confirm the schedule." , [formData.requestType,formData.requestNumber,formData.roomNumber]);

  sendWhatsappMessage(userNumber, "sr_for_tenant" , "Your **{{1}} service request has been submitted successfully. Ticket number: {{2}} . Our team will contact you shortly to confirm the schedule. Thank you for choosing our service!" , [formData.requestType,formData.requestNumber])


  try {
    // Find or create a FormData document for the current user
    let userFormData = await FormData.findOne({ user: req.user._id });
    if (!userFormData) {
      userFormData = new FormData({ user: req.user._id });
      await userFormData.save();
    }

    const roomId = req.session.roomId;
    // Create a new service request document
    const serviceRequest = new ServiceRequest({
      requestType: formData.requestType,
      roomNumber: formData.roomNumber,
      buildingNumber: formData.buildingNumber,
      requestNumber: formData.requestNumber,
      formData: userFormData._id, // Use the formData document ID
      user: req.user._id,
      // room: roomListing._id,
    });

    // Save the service request to the database
    await serviceRequest.save();

    // Find all open service requests for the current user
    const openServiceRequests = await ServiceRequest.find({
      user: req.user._id,
      isOpen: true,
    });


    // Set a flash message

    req.flash('success', 'Request submitted successfully!');

    res.redirect(`/tenant_details/${req.user._id}`);
  } catch (err) {
    console.error('Error saving service request:', err);
    req.flash('error', 'Error submitting request');
    res.redirect(`/tenant_details/${req.user._id}`);
  }
});




app.post('/close-request/:requestId', async (req, res) => {
  try {
    const requestId = req.params.requestId;
    console.log('Request ID:', requestId);

    if (!mongoose.isValidObjectId(requestId)) {
      console.error('Invalid Request ID:', requestId);
      req.flash('error', 'Invalid request ID');
      return res.redirect(`/tenant_details/${req.user._id}`);
    }

    const deletedServiceRequest = await ServiceRequest.findByIdAndDelete(requestId);

    if (!deletedServiceRequest) {
      console.error('Request not found:', requestId);
      req.flash('error', 'Request not found');
      return res.redirect(`/tenant_details/${req.user._id}`);
    }

    console.log('Deleted Service Request:', deletedServiceRequest);

    req.flash('success', 'Request closed successfully!');
    return res.redirect(`/tenant_details/${req.user._id}`);
  } catch (err) {
    console.error('Error closing service request:', err);
    req.flash('error', 'Error closing request');
    return res.redirect(`/tenant_details/${req.user._id}`);
  }
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
        .main-page{
          padding:5vw;
          margin:5vw;
          border:1px solid grey;
        }
       
        
        div {
          margin-bottom: 20px;
        }
        
        p {
          margin: 0;
          color:grey;
          font-size:.9rem;
          line-height:1.5;
        }
        
        .date {
          font-weight: bold;
        }
        
        .address {
          margin-top: 20px;
          text-align: right;
        }
        
        .signature {
          color:grey;
          margin-top: 40px;
          text-align: right;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class = "main-page">
      <h1>House Rent Receipt</h1>
    
      <div class="date">
      <p>Date Range: ${startDate} - ${endDate}</p>
</div>
     <div>
     <p>This is to acknowledge the receipt from <b>${userData.name}</b> the sum of rupees <b>${userData.rentAmount}/-</b> (Rs. ${userData.rentAmountInWords}) in lieu of rent payment for the specified date range, towards the property bearing the address: "<b>${userData.propertyAddress}</b>".</p>
     </div>
     <div>
     <p><b>Owner's Name and Address:</b></p>
     <p>${userData.ownerName}</p>
     <p>${userData.ownerAddress}</p>
     </div>
      
      <div class="address">
  <p>Signature</p>
  <p class="signature">(${userData.ownerName})</p>
</div>
      </div>
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


// sendWhatsappMessage(7084992604); rent recipt generated

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
      const recipient = user.email;
      sendPDFEmail(pdfBuffer, recipient);
      sendWhatsappMessage(user.mobileNumber, "rent_receipt_for_tenant" , "You request to generate rent receipt has been submitted. Please check your email.")

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





// admin panel code 
async function createDefaultAdminUsers() {
  try {
    // Check if any admin or manager users exist
    const existingAdmins = await User.find({ role: 'admin' });
    const existingManagers = await User.find({ role: 'manager' });

    if (existingAdmins.length > 0 || existingManagers.length > 0) {
      console.log('Admin and/or manager users already exist');
      return;
    }

    // Check if environment variables are set
    if (!process.env.MANAGER_PASS || !process.env.ADMIN_PASS || !process.env.ADMIN_EMAIL) {
      throw new Error('Environment variables MANAGER_PASS, ADMIN_PASS, and ADMIN_EMAIL must be set');
    }

    // // Hash the passwords
    // const saltRounds = 10;
    // const managerPassword = await bcrypt.hash(process.env.MANAGER_PASS, saltRounds);
    // const adminPassword = await bcrypt.hash(process.env.ADMIN_PASS, saltRounds);

    // Create the default admin users
    const managerUser = new User({
      name: 'Manager User',
      mobileNumber: '9876543210',
      email: process.env.MANAGER_EMAIL,
      password:  process.env.MANAGER_PASS, // await the hashed password
      role: 'manager'
    });

    const adminUser = new User({
      name: 'Admin User',
      mobileNumber: '9876543211',
      email: process.env.ADMIN_EMAIL,
      password:  process.env.ADMIN_PASS, // await the hashed password
      role: 'admin'
    });

    // Save the admin users to the database
    await managerUser.save();
    await adminUser.save();

    console.log('Default admin and manager users created successfully');
  } catch (err) {
    console.error('Error creating default admin and manager users:', err);
  }
}
// Call the function to create the default admin users
// createDefaultAdminUsers();



app.get("/manager-panel", async (req, res) => {
  res.redirect("/panel-login")
})


app.get("/manager/manager-panel", async (req, res) => {
  const totalRooms = await RoomListing.countDocuments({ availability: 'available' });
  const availableRooms = await RoomListing.find({ availability: 'unavailable' });

  // Fetch all service requests
  const serviceRequests = await ServiceRequest.find({});

  // Count the number of service requests
  const serviceRequestCount = serviceRequests.length;
  const rentPayments = await RentPayment.find({});
  const totalRent = rentPayments.reduce((sum, payment) => sum + payment.totalAmount, 0);
  res.render("managerPanel", {
    totalRooms,
    serviceRequestCount,
    availableRooms,
    serviceRequests,
    totalRent
  });
})


const RentPayment = require('./models/rentPayment');
// const { log } = require("console");





app.post('/manager/submit-rent-details', async (req, res) => {
  try {
    const { electricityBill, waterBill, monthOfBill, roomNumber } = req.body;
    const room = await RoomListing.findOne({ roomNumber });
    console.log("room fromo m - panel", room);

    if (!room) {
      console.log(`No room found with roomNumber ${roomNumber}`);
      return res.status(404).send('Room not found');
    }

    const formDataDoc = await FormData.findOne({ room: room._id });

    if (!formDataDoc) {
      console.log(`No FormData document found for room with ID ${room._id}`);
      return res.status(404).send('FormData document not found');
    }

    const userId = formDataDoc.user;
    const roomId = formDataDoc.room;
    const roomRent = room.price;

    let month;
    if (monthOfBill) {
      month = parseInt(monthOfBill.split('-')[1], 10);
    } else {
      month = new Date().getMonth() + 1; // Use the current month as a fallback
    }

    const parsedElectricityBill = isNaN(electricityBill) || electricityBill === '' ? 0 : Number(electricityBill);
    const parsedWaterBill = isNaN(waterBill) || waterBill === '' ? 0 : Number(waterBill);
    // const parsedRoomRent = isNaN(roomRent) || roomRent === '' ? (room.rentPerMonth || 0) : Number(roomRent);
    const totalAmount = parsedElectricityBill + parsedWaterBill + roomRent;

    const newRentPayment = new RentPayment({
      user: userId,
      room: roomId,
      electricityBill: parsedElectricityBill,
      waterBill: parsedWaterBill,
      roomRent,
      totalAmount,
      month,
      year: new Date().getFullYear(),
    });

    await newRentPayment.save();
    console.log('new payment details', newRentPayment);


    res.redirect("/manager/manager-panel");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving rent payment details');
  }
});



app.get("/admin-panel", async (req, res) => {
  res.redirect("/panel-login")
})


app.get("/admin/admin-panel", async (req, res) => {
  try {
    // Count the total number of rooms
    const totalRooms = await RoomListing.countDocuments({ availability: 'available' });
    const availableRooms = await RoomListing.find({ availability: 'available' });
    const allVacateRequests = await VacateRequest.find({}).populate('userId');
    const vacateRequestCount = allVacateRequests.length;

    // Fetch all service requests
    const serviceRequests = await ServiceRequest.find({});

    // Count the number of service requests
    const serviceRequestCount = serviceRequests.length;




    const groupedServiceRequests = serviceRequests.reduce((acc, request) => {
      const { roomNumber, requestType, buildingNumber } = request;
      if (!acc[roomNumber]) {
        acc[roomNumber] = {
          roomNumber,
          buildingNumber,
          'Home Cleaning': 0,
          'Electrical Issue': 0,
          'Air Condition': 0,
          carpentry: 0,
          totalIssues: 0,
        };
      }

      switch (requestType) {
        case 'Home Cleaning':
          acc[roomNumber]['Home Cleaning']++;
          break;
        case 'Electrical Issue':
          acc[roomNumber]['Electrical Issue']++;
          break;
        case 'Air Condition':
          acc[roomNumber]['Air Condition']++;
          break;
        case 'Carpentry':
          acc[roomNumber].carpentry++;
          break;
        // Add more cases for additional requestTypes if needed
        default:
          break;
      }

      acc[roomNumber].totalIssues++;

      return acc;
    }, {});



    const serviceRequestData = Object.values(groupedServiceRequests);

    const rentPayments = await RentPayment.find({}).populate('room');

    res.render("adminPanel", {
      totalRooms,
      serviceRequestCount,
      availableRooms,
      serviceRequests,
      serviceRequestData,
      rentPayments,
      allVacateRequests,
      vacateRequestCount
    });

  } catch (err) {
    console.error("Error fetching room count:", err);
    res.status(500).send("Error fetching room count");
  }
})

app.post('/admin/vacate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, buildingNumber } = req.body;

    // Find the room listing and update the availability
    const roomListing = await RoomListing.findOneAndUpdate(
      { roomNumber, buildingNumber },
      { availability: 'available' },
      { new: true }
    );

    console.log(roomListing);

    // Remove the vacate request
    await VacateRequest.findByIdAndDelete(id);

    res.redirect('/admin/admin-panel');
  } catch (err) {
    console.error('Error updating room availability:', err);
    res.status(500).send('Error updating room availability');
  }
});


app.get("/panel-login", (req, res) => {
  const errorMessage = req.flash('error');
  res.render('panelLogin', { errorMessage });
})



// Admin login route

app.post('/admin/login', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/panel-login');
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      if (user.role === 'admin') {
        return res.redirect('/admin/admin-panel');
      } else if (user.role === 'manager') {
        return res.redirect('/manager/manager-panel');
      } else {
        req.logout();
        req.flash('error', 'Invalid user role');
        return res.redirect('/panel-login');
      }
    });
  })(req, res, next);
});



app.all("*", (req, res) => {
  res.render("error");
});

app.listen(3100, () => {
  console.log("Listening on port 3100");
})