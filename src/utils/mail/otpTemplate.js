
export function generateOtpEmailTemplate(val) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dominex - Verification Code</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .header {
      background-color: #4A3AFF;
      padding: 20px;
      text-align: center;
    }
    .header img {
      max-width: 160px;
    }
    .content {
      padding: 30px;
    }
    h1 {
      color: #4A3AFF;
      margin-top: 0;
      font-size: 24px;
    }
    .code {
      background-color: #f4f4f4;
      border: 1px dashed #ccc;
      padding: 15px;
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #4A3AFF;
      margin: 20px 0;
      border-radius: 5px;
    }
    .footer {
      background-color: #f1f1f1;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
    .note {
      font-size: 14px;
      color: #555;
      line-height: 1.6;
    }
    a {
      color: #4A3AFF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://yourdomain.com/logo.png" alt="Dominex Logo" />
    </div>

    <div class="content">
      <h1>Email Verification</h1>
      <p>Hello ${val.name},</p>
      <p>Welcome to <strong>Dominex</strong>! Please use the following OTP to verify your email address:</p>

      <div class="code">${val.otp}</div>

      <p>This code is valid for the next <strong>10 minutes</strong>. If you did not request this, please ignore this email or contact support.</p>

      <p class="note">Do not share this code with anyone. Our team will never ask for your OTP.</p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Dominex. All rights reserved.</p>
      <p>
        <a href="https://dominex.com">Visit Website</a> |
        <a href="https://dominex.com/contact">Contact Us</a> |
        <a href="https://dominex.com/privacy">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
