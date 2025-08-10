import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const setToken = (id, res) => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,               
    sameSite: isProduction ? 'None' : 'Lax',
    domain: isProduction ? '.giftginnie.in' : undefined

  };

  res.cookie('token', token, options);
  return token;
};
