import axios from 'axios';
import crypto from 'crypto';
import { interswitchAuth } from '../utils/interswitchAuth';

export class InterswitchService {
    private static baseUrl = process.env.INTERSWITCH_API_BASE || 'https://sandbox.interswitchng.com/api/v1';

    static async initiatePayIn(amount: number, currency: string = 'NGN'): Promise<{ reference: string, checkoutUrl: string }> {
        const reference = `ISW-PAYIN-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        const mockCheckoutUrl = `https://qa.interswitchng.com/collections/w/pay/${reference}`;
        return { reference, checkoutUrl: mockCheckoutUrl };
    }

    static async processPayout(amount: number, currency: string, bankCode: string, accountNumber: string, reference: string) {
        const endpoint = `${this.baseUrl}/payouts`;

        const payload = {
            amount: amount.toString(),
            currencyCode: currency,
            destination: {
                type: 'BANK_ACCOUNT',
                bankCode: bankCode,
                accountNumber: accountNumber
            },
            mac: ''
        };

        try {
            const signatureHeaders = interswitchAuth.generateSignatureHeaders('POST', endpoint, {
                'Content-Type': 'application/json',
                'Idempotency-Key': reference
            });

            const token = await interswitchAuth.getBearerToken();
            signatureHeaders['Authorization'] = `Bearer ${token}`;

            const response = await axios.post(endpoint, payload, { headers: signatureHeaders });

            return {
                success: true,
                providerReference: response.data.transactionId || reference,
                status: response.data.status || 'SUCCESS'
            };
        } catch (error: any) {
            console.error('Interswitch Payout Error:', error.response?.data || error.message);
            throw new Error(`Payout failed: ${error.response?.data?.error?.message || 'Unknown error'}`);
        }
    }
}
