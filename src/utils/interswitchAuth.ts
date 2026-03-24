import crypto from 'crypto';
import axios from 'axios';

export class InterswitchAuth {
    private clientId: string;
    private clientSecret: string;
    private env: string;
    
    constructor() {
        this.clientId = process.env.INTERSWITCH_CLIENT_ID || '';
        this.clientSecret = process.env.INTERSWITCH_SECRET || '';
        this.env = process.env.INTERSWITCH_ENV || 'sandbox';
        
        if (!this.clientId || !this.clientSecret) {
            console.warn("WARNING: Interswitch credentials not found in environment.");
        }
    }

    /**
     * Generates standard Interswitch MAC/Signature headers required for API calls
     */
    public generateSignatureHeaders(httpMethod: string, resourceUrl: string, additionalHeaders: Record<string, string> = {}) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = crypto.randomBytes(16).toString('hex').replace(/[-]/g, '');
        
        // Cipher = HTTPMethod + "&" + URLEncoded(URL) + "&" + Timestamp + "&" + Nonce + "&" + ClientId + "&" + ClientSecret
        const cipher = `${httpMethod}&${encodeURIComponent(resourceUrl)}&${timestamp}&${nonce}&${this.clientId}&${this.clientSecret}`;
        const signature = crypto.createHash('sha256').update(cipher).digest('base64');
        
        const clientIdBase64 = Buffer.from(this.clientId).toString('base64');
        const authHeader = `InterswitchAuth ${clientIdBase64}`;

        return {
            'Authorization': authHeader,
            'Timestamp': timestamp,
            'Nonce': nonce,
            'Signature': signature,
            'SignatureMethod': 'SHA-256',
            ...additionalHeaders
        };
    }

    /**
     * Fetches OAuth2 Bearer Token using Client Credentials
     */
    public async getBearerToken(): Promise<string> {
        const authUrl = process.env.INTERSWITCH_AUTH_URL || 'https://passport.sandbox.interswitchng.com/passport/oauth/token';
        const base64Credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        try {
            const response = await axios.post(authUrl, 'grant_type=client_credentials', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${base64Credentials}`
                }
            });
            return response.data.access_token;
        } catch (error: any) {
            console.error('Failed to fetch Interswitch Token:', error.response?.data || error.message);
            throw new Error('Interswitch Authentication Failed');
        }
    }
}

export const interswitchAuth = new InterswitchAuth();