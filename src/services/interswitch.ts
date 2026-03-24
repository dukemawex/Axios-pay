import axios from 'axios';
import crypto from 'crypto';
import { interswitchAuth } from '../utils/interswitchAuth';

export class InterswitchService {
    private static baseUrl = process.env.INTERSWITCH_API_BASE || 'https://sandbox.interswitchng.com/api/v1';

    /**
     * Generates a payment link/reference for the user to pay in NGN
     */
    static async initiatePayIn(amount: number, currency: string = 'NGN'): Promise<{ reference: string, checkoutUrl: string }> {
        // In a real implementation, this calls Interswitch Webpay URL generation
        // For the MVP, we generate a secure reference and a mock checkout URL
        const reference = `ISW-PAYIN-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        
        // Mocking the payment gateway response for Demo Day continuity
        const mockCheckoutUrl = `https://qa.interswitchng.com/collections/w/pay/${reference}`;
        
        return { reference, checkoutUrl: mockCheckoutUrl };
    }

    /**
     * Calls Interswitch Payouts API to send funds to a local bank (e.g., in UGX or NGN)
     */
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
            mac: '' // MAC is sometimes required in payload based on ISW API version, usually headers suffice
        };

        try {
            // Get MAC Headers
            const signatureHeaders = interswitchAuth.generateSignatureHeaders('POST', endpoint, {
                'Content-Type': 'application/json',
                'Idempotency-Key': reference // Prevent double processing
            });

            // Get Bearer Token
            const token = await interswitchAuth.getBearerToken();
            signatureHeaders['Authorization'] = `Bearer ${token}`; // Override with Bearer if API requires it, or keep InterswitchAuth

            // Execute HTTP Request
            const response = await axios.post(endpoint, payload, { headers: signatureHeaders });
            
            return {
                success: true,
                providerReference: response.data.transactionId || reference,
                status: response.data.status || 'SUCCESS'
            };
        } catch (error: any) {
            console.error('Interswitch Payout Error:', error.response?.data || error.message);
            // We throw so the caller can mark the Ledger transaction as FAILED
            throw new Error(`Payout failed: ${error.response?.data?.error?.message || 'Unknown error'}`);
        }
    }
}