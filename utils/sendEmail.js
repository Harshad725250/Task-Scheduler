const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    console.log("📬 Attempting to send email to:", to); // ADD THIS
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email successfully sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
};


module.exports = sendReminderEmail;
