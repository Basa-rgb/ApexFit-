const nodemailer = require("nodemailer");

// Reuse a single connection pool instead of creating a new transporter
// for every request (each new connection costs several seconds).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Fail fast instead of hanging the request when Gmail is unreachable.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Fire-and-forget helper: responds immediately, logs failures.
const sendEmailAsync = ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  transporter.sendMail(mailOptions).catch((error) => {
    console.error("Email Error:", error);
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;
