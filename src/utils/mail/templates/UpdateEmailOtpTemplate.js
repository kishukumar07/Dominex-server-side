const UpdateEmailOtpTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Update Your Email</h2>
      <p>Use the OTP below to confirm your email address change:</p>
      <h3 style="color: #28a745;">${otp}</h3>
      <p>This OTP will expire in 10 minutes. If you didn’t request this change, please contact support.</p>
      <br />
      <p>Thanks,<br />DOMINEX</p>
    </div>
  `;
};

export default UpdateEmailOtpTemplate;
