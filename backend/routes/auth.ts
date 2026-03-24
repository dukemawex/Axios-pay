import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/auth';

const router = Router();
const prisma = new PrismaClient();

// Register a new user and initialize their wallets
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user and wallets in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                }
            });

            // Initialize wallets for supported currencies
            await tx.wallet.createMany({
                data: [
                    { userId: user.id, currency: 'NGN', balance: 0 },
                    { userId: user.id, currency: 'UGX', balance: 0 },
                    { userId: user.id, currency: 'GHS', balance: 0 },
                    { userId: user.id, currency: 'KES', balance: 0 },
                    { userId: user.id, currency: 'ZAR', balance: 0 },
                ]
            });

            return user;
        });

        const token = generateToken(newUser.id, newUser.email);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login existing user
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.email);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
