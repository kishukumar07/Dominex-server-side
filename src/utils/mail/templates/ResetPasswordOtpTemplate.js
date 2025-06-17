const ResetPasswordOtpTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Reset Your Password</h2>
      <p>Use the OTP below to reset your password:</p>
      <h3 style="color: #dc3545;">${otp}</h3>
      <p>This OTP will expire in 10 minutes. If you didn’t request this, ignore this email.</p>
      <br />
      <p>Thanks,<br />DOMINEX</p>
    </div>
  `;
};

export default ResetPasswordOtpTemplate;
