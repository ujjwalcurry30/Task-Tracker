import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : [
      'http://localhost:5173',
      'https://tiny-faun-afff4d.netlify.app',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Task Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});


