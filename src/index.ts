// this is src/index.ts file

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: ['https://axios-pay-ss47w.ondigitalocean.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(helmet());

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Register Routes
app.use('/api/auth', authRoutes); // NEW: Auth routes
app.use('/api', apiRoutes);       // Protected API routes

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', service: 'Axios Pay Production Engine' });
});

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Axios Pay API is running' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Exception:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PORT=${PORT}`);
    console.log(`🚀 Axios Pay Production Engine started on port ${PORT}`);
});
