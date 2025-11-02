import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// connect Cloudinary
await connectCloudinary();

// Trust proxy for HTTPS detection (important on Render)
app.enable('trust proxy');

app.use(cors({
  origin: ['http://localhost:5173', 'https://quickaimyapp-2.onrender.com','https://quickaimyapp-riv8.vercel.app'], // add deployed frontend domain too
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Clerk middleware (adds auth info to req)
app.use(clerkMiddleware());

// --- ROUTES ---

// public route
app.get('/', (req, res) => res.send('✅ Server is running!'));

// protected routes only
app.use('/api/ai', requireAuth(), aiRouter);
app.use('/api/user', requireAuth(), userRouter);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;
