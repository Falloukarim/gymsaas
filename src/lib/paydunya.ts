import axios, { AxiosError } from 'axios';
import crypto from 'crypto';

interface PaydunyaConfig {
  masterKey: string;
  privateKey: string;
  token: string;
  store: {
    name: string;
    website_url: string;
    logo_url?: string;
    tagline?: string;
    postal_address?: string;
    phone?: string;
  };
  mode: 'test' | 'live';
}

interface CustomerData {
  email: string;
  name: string;
  phone?: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  description: string;
}

const PAYDUNYA_CONFIG: PaydunyaConfig = {
  masterKey: process.env.PAYDUNYA_MASTER_KEY!,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY!,
  token: process.env.PAYDUNYA_TOKEN!,
  store: {
    name: "GymManager",
    website_url: process.env.NEXT_PUBLIC_SITE_URL!,
    logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    tagline: "Gestion de salle de sport",
    postal_address: "Sénégal",
    phone: "0000000000"
  },
  mode: (process.env.PAYDUNYA_MODE as 'test' | 'live') || 'test',
};

const paydunya = {
  baseUrl: PAYDUNYA_CONFIG.mode === 'live' 
    ? 'https://app.paydunya.com/api/v1' 
    : 'https://app.paydunya.com/sandbox-api/v1',

  headers: {
    'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.masterKey,
    'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.privateKey,
    'PAYDUNYA-TOKEN': PAYDUNYA_CONFIG.token,
    'Content-Type': 'application/json',
  },

  async createInvoice(
  amount: number,
  customer: CustomerData,
  metadata: Record<string, any>
): Promise<{
  url: string;
  token: string;
  checkout_url?: string; // Ajout pour compatibilité
  invoice_token?: string; // Ajout pour compatibilité
}>{
    try {
      const payload = {
        invoice: {
          items: [{
            name: `Abonnement ${metadata.billing_cycle || 'mensuel'}`,
            quantity: 1,
            unit_price: amount,
            total_price: amount,
            description: `Abonnement ${metadata.name || 'GymManager'}`
          }],
          total_amount: amount,
          currency: 'XOF'
        },
        store: PAYDUNYA_CONFIG.store,
        actions: {
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/error`,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/confirmation`,
          callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/paydunya/webhook`
        },
        custom_data: {
          ...metadata,
          timestamp: new Date().toISOString()
        },
        channels: ["wave-senegal", "orange-money-senegal"],
        preferences: {
          display_mode: "direct",
          payment_methods: {
            mobile: true,
            card: false
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/checkout-invoice/create`,
        payload,
        { headers: this.headers, timeout: 15000 }
      );

      if (!response.data?.response_text) {
        throw new Error('Réponse Paydunya invalide');
      }

      return {
        url: response.data.response_text,
        token: response.data.token
      };
    } catch (error) {
      console.error('Erreur création facture:', error);
      throw new Error('Échec de la création du paiement');
    }
  },

 async verifyPayment(token: string): Promise<{
  success: boolean;
  data?: {
    invoice?: {
      receipt_number?: string;
      total_amount?: number;
      status?: string;
    };
  };
  url?: string;
  token?: string;
}> {
  try {
    const response = await axios.get(
      `${this.baseUrl}/checkout-invoice/confirm/${token}`,
      { headers: this.headers }
    );
    
    return {
      success: response.data.status === 'completed',
      data: response.data,
      url: response.data.response_text,
      token: response.data.token
    };
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    return { success: false };
  }
},
  verifyWebhook(signature: string | null, payload: any): boolean {
    if (!signature || !process.env.PAYDUNYA_PRIVATE_KEY) return false;
    
    const computed = crypto
      .createHmac('sha256', process.env.PAYDUNYA_PRIVATE_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === computed;
  }
};
export const createInvoice = paydunya.createInvoice.bind(paydunya);
export const verifyPayment = paydunya.verifyPayment.bind(paydunya);
export const verifyWebhook = paydunya.verifyWebhook.bind(paydunya);

export default paydunya;