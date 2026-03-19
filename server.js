require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend'); // Changed from nodemailer
const Form = require('./models/Form');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY); // Initializing Resend

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

// Route
app.post('/submit', async (req, res) => {
    try {
        const { fullName, mobile, email, subject, message } = req.body;

        // 1. Save to MongoDB
        const newForm = new Form({ fullName, mobile, email, subject, message });
        await newForm.save();
        console.log("Data saved to MongoDB");

        // 2. Send Email via Resend API (Background Task)
        resend.emails.send({
            from: 'onboarding@resend.dev', // Default for Resend free tier
            to: process.env.EMAIL_USER,    // Your Gmail address
            subject: `New Form Submission - ${subject}`,
            html: `
                <h2>New Contact Form</h2>
                <p><b>Name:</b> ${fullName}</p>
                <p><b>Mobile:</b> ${mobile}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Subject:</b> ${subject}</p>
                <p><b>Message:</b> ${message}</p>
            `
        })
        .then(() => console.log("Email sent successfully via Resend"))
        .catch(err => console.error("Resend Error:", err));

        // 3. Send Success Response to Frontend
        return res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ message: "Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
