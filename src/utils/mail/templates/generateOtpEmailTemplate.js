const generateOtpEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Verify Your Account</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h3 style="color: #007bff;">${otp}</h3>
      <p>This OTP is valid for the next 10 minutes.</p>
      <br />
      <p>Thanks,<br />DOMINEX</p>
    </div>
  `;
};

export default generateOtpEmailTemplate;
