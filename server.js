require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');  // <-- Add this line
const Form = require('./models/Form');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());                 // <-- now works
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Email Transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route
app.post('/submit', async (req, res) => {
    try {
        const { fullName, mobile, email, subject, message } = req.body;

        // Save to MongoDB
        const newForm = new Form({ fullName, mobile, email, subject, message });
        await newForm.save();

        // Send Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Form Submission - ${subject}`,
            html: `
                <h2>New Contact Form</h2>
                <p><b>Name:</b> ${fullName}</p>
                <p><b>Mobile:</b> ${mobile}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Subject:</b> ${subject}</p>
                <p><b>Message:</b> ${message}</p>
            `
        });

        res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error" });
    }
});

// Start server
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
