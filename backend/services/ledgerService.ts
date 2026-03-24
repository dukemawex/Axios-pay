import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class LedgerService {
    static async fundWallet(userId: string, amount: number, currency: string, reference: string) {
        return prisma.$transaction(async (tx) => {
            let wallet = await tx.wallet.findUnique({
                where: { userId_currency: { userId, currency } }
            });

            if (!wallet) {
                wallet = await tx.wallet.create({
                    data: { userId, currency, balance: 0 }
                });
            }

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.DEPOSIT,
                    amount,
                    currency,
                    status: TransactionStatus.COMPLETED,
                    reference
                }
            });

            return updatedWallet;
        });
    }

    static async executeFxSwap(userId: string, amount: number, fromCurrency: string, toCurrency: string, rate: number) {
        return prisma.$transaction(async (tx) => {
            const sourceWallet = await tx.wallet.findUnique({
                where: { userId_currency: { userId, currency: fromCurrency } }
            });

            if (!sourceWallet || Number(sourceWallet.balance) < amount) {
                throw new Error(`Insufficient ${fromCurrency} balance`);
            }

            let destWallet = await tx.wallet.findUnique({
                where: { userId_currency: { userId, currency: toCurrency } }
            });

            if (!destWallet) {
                destWallet = await tx.wallet.create({
                    data: { userId, currency: toCurrency, balance: 0 }
                });
            }

            const destinationAmount = amount * rate;
            const refPrefix = crypto.randomBytes(6).toString('hex');

            await tx.wallet.update({
                where: { id: sourceWallet.id },
                data: { balance: { decrement: amount } }
            });

            await tx.wallet.update({
                where: { id: destWallet.id },
                data: { balance: { increment: destinationAmount } }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.SWAP_OUT,
                    amount: amount,
                    currency: fromCurrency,
                    status: TransactionStatus.COMPLETED,
                    reference: `SWAP-OUT-${refPrefix}`,
                    metadata: { rate, toCurrency, destinationAmount }
                }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.SWAP_IN,
                    amount: destinationAmount,
                    currency: toCurrency,
                    status: TransactionStatus.COMPLETED,
                    reference: `SWAP-IN-${refPrefix}`,
                    metadata: { rate, fromCurrency, sourceAmount: amount }
                }
            });

            return { sourceRemaining: Number(sourceWallet.balance) - amount, destinationNew: Number(destWallet.balance) + destinationAmount };
        });
    }

    static async initiateWithdrawal(userId: string, amount: number, currency: string, reference: string) {
        return prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId_currency: { userId, currency } }
            });

            if (!wallet || Number(wallet.balance) < amount) {
                throw new Error(`Insufficient ${currency} balance for withdrawal`);
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.WITHDRAWAL,
                    amount,
                    currency,
                    status: TransactionStatus.PENDING,
                    reference
                }
            });

            return transaction;
        });
    }
}
