export function generateOtpEmailTemplate(val) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GiftGinnie - Verification Code</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #ff6b88;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 180px;
        }
        .content {
            padding: 30px;
        }
        h1 {
            color: #ff6b88;
            margin-top: 0;
            font-size: 24px;
        }
        .code {
            background-color: #f8f9fa;
            border: 1px dashed #ddd;
            padding: 15px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 3px;
            color: #ff6b88;
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
        .button {
            display: inline-block;
            background-color: #ff6b88;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
            font-weight: bold;
        }
        .note {
            font-size: 14px;
            color: #777;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://www.giftginnie.com/logo.png" alt="GiftGinnie Logo">
        </div>
        
        <div class="content">
            <h1>Verify Your Email Address</h1>
            <p>Hello ${val.name},</p>
            <p>Thank you for choosing GiftGinnie! To complete your account setup, please enter the following verification code:</p>
            
            <div class="code">${val.otp}</div>
            
            <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email or contact our support team.</p>
            
            <p class="note">For security reasons, please don't share this code with anyone. Our team will never ask you for your verification code.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2023 GiftGinnie. All rights reserved.</p>
            <p>123 Gift Street, Suite 100, San Francisco, CA 94107</p>
            <p>
                <a href="https://www.giftginnie.com" style="color: #ff6b88;">Our Website</a> | 
                <a href="https://www.giftginnie.com/contact" style="color: #ff6b88;">Contact Us</a> | 
                <a href="https://www.giftginnie.com/privacy" style="color: #ff6b88;">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>`;
}