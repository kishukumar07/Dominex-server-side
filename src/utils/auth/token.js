import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {RefTokenModel} from "../../models/tokens/refreshToken.js"; 


dotenv.config();


//generates refreshToken (7d)   → httpOnly cookie + DB
export const setRefreshToken = async(id, res) => {
  const token = jwt.sign({ userId: id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,               
    sameSite: isProduction ? 'None' : 'Lax',
    domain: isProduction ? '.giftginnie.in' : undefined

  };
    await RefTokenModel.create({
       token: token,
       authorID: id
    });
 
    res.cookie("token", token, options); 
 
 

};

// generates accessToken  (24h)  → response body
export const getAcessToken = (id) => {
  const token = jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '24h',
  });

 
  
  return token;
};


