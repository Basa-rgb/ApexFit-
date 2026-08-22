const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailAsync = ({ to, subject, text, html }) => {
  resend.emails
    .send({
      from: process.env.EMAIL_USER, // must be a verified domain/sender on Resend
      to,
      subject,
      text,
      html,
    })
    .catch((error) => {
      console.error("[email] SEND FAILED", `to=${to}`, error.message);
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
  if (error) throw new Error(error.message);
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;