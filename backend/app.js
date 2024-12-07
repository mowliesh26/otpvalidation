
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const crypto = require("crypto");


const app = express();
const PORT = 5000;
const cors = require('cors');
app.use(cors())

app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/otpDemo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpiry: { type: Date },
});

const User = mongoose.model("User", userSchema);


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "mowli1947@gmail.com", 
    pass: "crcn foaq coxp dyvd", 
  },
});


const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


app.post("/generate-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );


    const mailOptions = {
      from: "your-email@gmail.com", 
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating OTP" });
  }
});


app.post("/validate-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

   
    res.status(200).json({ message: "OTP validated. Navigating to dashboard." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error validating OTP" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

