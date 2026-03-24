import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev';

export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

// Generate a token valid for 24 hours
export const generateToken = (userId: string, email: string) => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to protect routes
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
        }
        req.user = decoded;
        next();
    });
};
