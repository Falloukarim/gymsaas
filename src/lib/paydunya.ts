import axios, { AxiosError } from 'axios';
import crypto from 'crypto';

interface PaydunyaConfig {
  masterKey: string;
  privateKey: string;
  publicKey: string;
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
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY!,
  token: process.env.PAYDUNYA_TOKEN!,
  store: {
    name: "EasyFit",
    website_url: process.env.NEXT_PUBLIC_SITE_URL!,
    logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    tagline: "Gestion de salle de sport",
    postal_address: "Dakar, Sénégal", // Adresse complète requise
    phone: "787311616" // Numéro valide requis
  },
  mode: 'live', // Forcé en mode live
};

const paydunya = {
  baseUrl: PAYDUNYA_CONFIG.mode === 'live' 
    ? 'https://app.paydunya.com/api/v1' 
    : 'https://app.paydunya.com/sandbox-api/v1',

  headers: {
    'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.masterKey,
    'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.privateKey,
    'PAYDUNYA-PUBLIC-KEY': PAYDUNYA_CONFIG.publicKey,
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
    checkout_url?: string;
    invoice_token?: string;
  }> {
    try {
    const payload = {
  invoice: {
    items: [{
      name: `Abonnement ${metadata.billing_cycle || 'mensuel'}`,
      quantity: 1,
      unit_price: amount,
      total_price: amount,
      description: `Abonnement GymManager`
    }],
    total_amount: amount,
    description: "Paiement d'abonnement",
    currency: 'XOF'
  },
  store: {
    ...PAYDUNYA_CONFIG.store,
    phone_number: customer.phone || PAYDUNYA_CONFIG.store.phone
  },
  actions: {
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/error`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
    callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/paydunya/webhook`
  },
  custom_data: metadata,
  preferences: {
    payment_methods: {
      mobile: true,
      card: false
    },
    hide_payment_methods: false
  }
};


      const response = await axios.post(
        `${this.baseUrl}/checkout-invoice/create`,
        payload,
        { 
          headers: this.headers, 
          timeout: 15000 
        }
      );

      if (!response.data?.response_text) {
        throw new Error('Réponse Paydunya invalide');
      }

      return {
        url: response.data.response_text,
        token: response.data.token,
        checkout_url: response.data.response_text,
        invoice_token: response.data.token
      };
    } catch (error) {
      console.error('Erreur création facture:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Détails erreur PayDunya:', error.response.data);
      }
      throw new Error(
        error instanceof AxiosError 
          ? error.response?.data?.message || 'Échec de la création du paiement'
          : 'Échec de la création du paiement'
      );
    }
  },

  async verifyPayment(token: string): Promise<{
    success: boolean;
    data?: any;
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
      return { 
        success: false,
        ...(error instanceof AxiosError && error.response ? {
          data: error.response.data
        } : {})
      };
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