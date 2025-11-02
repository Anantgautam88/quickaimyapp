import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app= express();


await connectCloudinary();
app.use(cors({
    origin: 'http://localhost:5173', // allow frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(express.json())

app.use(clerkMiddleware())
app.use(requireAuth()) //all routes protected only user loged in  only see


app.use('/api/ai',aiRouter)

app.use('/api/user',userRouter)


app.get('/' , (req,res)=>res.send('server is running !'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


export default app;
