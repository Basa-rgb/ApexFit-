// Template for the Reset link via Email

const forgotPasswordTemplate = (resetUrl) => {
  return `
    <div style="max-width:400px;margin:40px auto;padding:25px;border:1px solid #e5e7eb;border-radius:10px;font-family:Arial,sans-serif;text-align:center;">
      <h2 style="color:#2563eb;margin-bottom:10px;">ApexFit</h2>

      <p style="color:#555;font-size:15px;">
        We received a request to reset your password.
      </p>

      <a href="${resetUrl}"
         style="display:inline-block;margin:20px 0;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
        Reset Password
      </a>

      <p style="font-size:14px;color:#777;">
        This link is valid for <strong>10 minutes</strong>.
      </p>

      <p style="font-size:12px;color:#999;margin-top:20px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;
};

// template of OTP

const otpTemplate = (otp) => {
  return`
    <div style="max-width:400px;margin:40px auto;padding:25px;border:1px solid #e5e7eb;border-radius:10px;font-family:Arial,sans-serif;text-align:center;">
      <h2 style="color:#2563eb;margin-bottom:10px;">ApexFit</h2>

      <p style="color:#555;font-size:15px;">
        Use the OTP below to verify your account.
      </p>

      <div style="font-size:32px;font-weight:bold;letter-spacing:6px;background:#f3f4f6;padding:12px 0;border-radius:8px;margin:20px 0;color:#2563eb;">
        ${otp}
      </div>

      <p style="font-size:14px;color:#777;">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <p style="font-size:12px;color:#999;margin-top:20px;">
        If you didn't request this OTP, you can safely ignore this email.
      </p>
    </div>
  `;
};

module.exports = {
  forgotPasswordTemplate,
  otpTemplate,
};
