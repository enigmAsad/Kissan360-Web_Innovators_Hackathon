import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoute from './routes/authRoute.js';
import validateTokenRoutes from './routes/validateTokenRoutes.js';
import postRoutes from './routes/postRoutes.js';
import farmingNewsRoute from './routes/farmingNewsRoute.js';
import commentRoutes from './routes/commentRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import weatherRoute from './routes/weatherRoute.js';
import shortAdviceRoute from './routes/shortAdviceRoute.js';

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
app.use('/api/posts', postRoutes);
app.use('/api/news', farmingNewsRoute);
app.use('/api/comments', commentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoute);
app.use('/api/short-advice', shortAdviceRoute);

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
