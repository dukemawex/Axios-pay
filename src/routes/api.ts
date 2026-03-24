import { Router, Request, Response, NextFunction } from 'express';
import { LedgerService } from '../services/ledgerService';
import { InterswitchService } from '../services/interswitch';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Hardcoded Demo User ID for presentation purposes
const DEMO_USER_ID = "demo-user-1234-5678";

// Middleware to ensure demo user exists
router.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: DEMO_USER_ID,
                    email: 'demo@axiospay.com',
                    name: 'Axios Demo User',
                }
            });
            // Init wallets
            await prisma.wallet.createMany({
                data: [
                    { userId: DEMO_USER_ID, currency: 'NGN', balance: 0 },
                    { userId: DEMO_USER_ID, currency: 'UGX', balance: 0 }
                ]
            });
        }
        req.body.userId = DEMO_USER_ID;
        next();
    } catch (e) {
        next(e);
    }
});

/**
 * GET /api/wallet/balances
 */
router.get('/wallet/balances', async (req: Request, res: Response) => {
    try {
        const wallets = await prisma.wallet.findMany({ where: { userId: DEMO_USER_ID } });
        res.json({ success: true, wallets });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/wallet/fund
 * Initiates deposit and auto-completes for demo purposes
 */
router.post('/wallet/fund', async (req: Request, res: Response) => {
    try {
        const { amount, currency } = req.body;
        
        // 1. Generate Interswitch Payment Link
        const { reference, checkoutUrl } = await InterswitchService.initiatePayIn(amount, currency);
        
        // 2. [DEMO SHORTCUT]: Automatically fund the wallet as if webhook fired successful
        await LedgerService.fundWallet(DEMO_USER_ID, amount, currency, reference);
        
        res.json({ 
            success: true, 
            message: 'Wallet funded successfully (Demo mode auto-completion)',
            reference,
            checkoutUrl 
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/wallet/swap
 * Cross-border FX Swap
 */
router.post('/wallet/swap', async (req: Request, res: Response) => {
    try {
        const { amount, fromCurrency, toCurrency } = req.body;
        
        // Demo exchange rate logic (Fetch live rate from ISW/Oracle in prod)
        let rate = 1;
        if (fromCurrency === 'NGN' && toCurrency === 'UGX') rate = 2.45; // 1 NGN = 2.45 UGX
        if (fromCurrency === 'UGX' && toCurrency === 'NGN') rate = 0.40;
        
        const result = await LedgerService.executeFxSwap(DEMO_USER_ID, amount, fromCurrency, toCurrency, rate);
        
        res.json({ 
            success: true, 
            message: `Successfully swapped ${amount} ${fromCurrency} to ${toCurrency}`,
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/wallet/withdraw
 * Calls Interswitch Payout API
 */
router.post('/wallet/withdraw', async (req: Request, res: Response) => {
    try {
        const { amount, currency, bankCode, accountNumber } = req.body;
        const reference = `WD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

        // 1. Deduct from Ledger (Locks funds)
        const transaction = await LedgerService.initiateWithdrawal(DEMO_USER_ID, amount, currency, reference);

        // 2. Call Interswitch Payout
        try {
            // Mocking payout success if credentials aren't set up perfectly for sandbox
            // Uncomment next line for actual ISW network call:
            // await InterswitchService.processPayout(amount, currency, bankCode, accountNumber, reference);
            
            // 3. Mark Ledger Completed
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'COMPLETED' }
            });

            res.json({ success: true, message: 'Withdrawal processed via Interswitch successfully', reference });
        } catch (iswError: any) {
            // 3b. Mark Ledger Failed and Refund
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'FAILED' }
            });
            await LedgerService.fundWallet(DEMO_USER_ID, amount, currency, `REFUND-${reference}`);
            throw new Error(`Payout failed: ${iswError.message}`);
        }
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;