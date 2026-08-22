const nodemailer = require("nodemailer");

// Reuse one transporter instead of creating a new connection per request.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    // Google displays app passwords in spaced groups ("abcd efgh ...")
    // but rejects them at AUTH unless the spaces are removed.
    pass: (process.env.EMAIL_PASSWORD || "").replace(/\s+/g, ""),
  },
  // Fail fast instead of hanging the request when Gmail is unreachable.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // Force IPv4 — some hosts (e.g. Render) can't route outbound IPv6 to
  // Gmail's SMTP servers, which causes ENETUNREACH/ETIMEDOUT on connect.
  family: 4,
});

// Verify credentials at boot so bad config appears in Render logs
// immediately instead of silently failing on the first signup.
transporter
  .verify()
  .then(() => {
    console.log(
      `[email] SMTP ready — sending as ${process.env.EMAIL_USER || "(EMAIL_USER not set)"}`
    );
  })
  .catch((error) => {
    console.error(
      "[email] SMTP LOGIN FAILED — OTP/password emails will not be delivered.",
      "code:", error.code,
      "response:", error.response || error.message
    );
  });

// Fire-and-forget helper: never blocks the HTTP response, logs failures.
const sendEmailAsync = ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  transporter.sendMail(mailOptions).catch((error) => {
    console.error(
      "[email] SEND FAILED",
      `to=${to}`,
      "code:", error.code,
      "response:", error.response || error.message
    );
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