import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const setToken = (id, res) => {
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return token; 
}
