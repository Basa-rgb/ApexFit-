const nodemailer = require("nodemailer");
const { Resend } = require("resend");

// Gmail SMTP is the primary transport because Resend blocks sending from
// gmail.com addresses until a custom domain is verified on their dashboard.
const gmailUser = process.env.EMAIL_USER;
const gmailPass = process.env.EMAIL_PASSWORD
  ? process.env.EMAIL_PASSWORD.replace(/\s+/g, "")
  : undefined;

let transporter = null;
if (gmailUser && gmailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const sendViaGmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"ApexFit" <${gmailUser}>`,
    to,
    subject,
    text,
    html,
  });
};

const sendViaResend = async ({ to, subject, text, html }) => {
  // Unverified Resend accounts may only use their sandbox sender.
  const from = process.env.RESEND_FROM || "ApexFit <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });
  if (error) throw new Error(error.message);
};

const deliver = transporter ? sendViaGmail : sendViaResend;

const sendEmailAsync = ({ to, subject, text, html }) => {
  if (!deliver) {
    console.error(
      "[email] No mail transport configured — set EMAIL_USER/EMAIL_PASSWORD or RESEND_API_KEY."
    );
    return;
  }
  deliver({ to, subject, text, html }).catch((error) => {
    console.error("[email] SEND FAILED", `to=${to}`, error.message);
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!deliver) {
    throw new Error("No mail transport configured");
  }
  return deliver({ to, subject, text, html });
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;
