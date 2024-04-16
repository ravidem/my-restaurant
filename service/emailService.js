const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});
  
  
  module.exports = { mailTransporter };