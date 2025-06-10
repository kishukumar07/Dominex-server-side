import express from 'express';
import cors from 'cors'; 
import env from 'dotenv'; 
import { connect } from 'mongoose';
env.config(); 
import connectDB  from './src/config/db.config.js';



//instance of express 
const app = express();

app.get("/", (req, res) => {
    res.status(200).send("talking with Server...");
});

const PORT = process.env.PORT  ; 




const allowedOrigins = [
    "http://localhost:4500",
    "http://localhost:4600",
];







//middlewares 
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    Credential:true  
}))

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ encoded: true, limit: "5mb" }));







//Routes





//server


app.listen(PORT,()=>{
console.log(`Server is running at PORT : ${PORT}` ); 

connectDB(); 


})


