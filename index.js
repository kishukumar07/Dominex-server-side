import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Database
import connectDB from './src/config/db.js';

dotenv.config({
  path: './.env',
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));


// Routes
app.use('/',(_,res)=>res.send("server is running"));




//server
const server=http.createServer(app);

const PORT=process.env.PORT || 5500;
server.listen(PORT,()=>{
  connectDB();
  console.log(`Server running on port ${PORT}`);
});