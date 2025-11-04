import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoute from './routes/authRoute.js';
import validateTokenRoutes from './routes/validateTokenRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/auth', validateTokenRoutes);

// DB connect
const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to database');
    } catch (err) {
        console.log('Database connection error:', err);
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connection();
});

