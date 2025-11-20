import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

config();

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
// Cloudinary configuration (if env provided)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);

app.use(errorHandler);

export default app;


