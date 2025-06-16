
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

function generateOtp(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    const expiryTime = Date.now() + OTP_EXPIRY_MS; 

    return {
        otp,
        expire: expiryTime,
    };
}
export default generateOtp;