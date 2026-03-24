
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 8080;

// Security & Middlewares
app.use(helmet());
app.use(cors({ origin: '*' })); // Allow all origins for the MVP/Demo
app.use(express.json());

// Request logging for Demo debugging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Healthcheck (Used by DigitalOcean App Platform)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', service: 'Axios Pay Engine' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Exception:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Axios Pay MVP Engine started on port ${PORT}`);
    console.log(`🏦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Interswitch Env: ${process.env.INTERSWITCH_ENV || 'sandbox'}`);
});