import mongoose from 'mongoose';
import env from 'dotenv' ; 
env.config(); 
import { DB_NAME } from '../utils/constants/dbName.js';

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

export default connectDB;


// mongodb://127.0.0.1:27017/mydatabase