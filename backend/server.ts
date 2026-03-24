import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 8080;

const corsOrigins: string[] = process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [];
if (process.env.NODE_ENV !== 'production') {
    corsOrigins.push('http://localhost:3000');
}

app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
        },
    },
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

// Register API Routes
app.use('/api/auth', authLimiter, authRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', service: 'Axios Pay Production Engine' });
});

app.use('/api', apiLimiter, apiRoutes);

const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Catch-all: serve index.html for all non-API paths (SPA client-side routing)
app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Exception:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PORT=${PORT}`);
    console.log(`🚀 Axios Pay Production Engine started on port ${PORT}`);
});
