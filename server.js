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

        // 1. Save to MongoDB (This usually works fast)
        const newForm = new Form({ fullName, mobile, email, subject, message });
        await newForm.save();

        // 2. Send Email WITHOUT 'await'
        // This lets the server continue even if Gmail is slow or fails
        transporter.sendMail({
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
        }).then(() => console.log("Email sent successfully"))
          .catch(err => console.error("Email failed but data was saved:", err));

        // 3. Tell the frontend it worked!
        return res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ message: "Error" });
    }
});

// Start server
const PORT = process.env.PORT || 3000; // 3000 for local testing
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
