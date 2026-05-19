import { loadStripe } from '@stripe/stripe-js';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export const stripeService = {
  async createCheckoutSession(priceId: string, customSuccessUrl?: string) {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: customSuccessUrl || `${window.location.origin}/wallet?stripe=success`,
          cancelUrl: `${window.location.origin}/wallet?stripe=cancel`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  },

  async linkStripeAccount(email: string) {
    try {
      const response = await fetch('/api/stripe/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to link Stripe account');
      }

      return data;
    } catch (error) {
      console.error('Link account error:', error);
      throw error;
    }
  },

  async createTopupSession(amount: number, email: string) {
    try {
      const response = await fetch('/api/stripe/create-topup-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email,
          successUrl: `${window.location.origin}/wallet?deposit=success&amount=${amount}`,
          cancelUrl: `${window.location.origin}/wallet?deposit=cancel`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create deposit session');
      }

      return data;
    } catch (error) {
      console.error('Topup error:', error);
      throw error;
    }
  },

  async requestPayout(accountId: string, amount: number) {
    try {
      const response = await fetch('/api/stripe/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request payout');
      }

      return data.success;
    } catch (error) {
      console.error('Payout error:', error);
      throw error;
    }
  },

  async createRigSubscriptionSession(rigId: string, price: number, duration: { months?: number, days?: number }) {
    try {
      const response = await fetch('/api/stripe/create-rig-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rigId,
          price,
          durationMonths: duration.months,
          durationDays: duration.days,
          successUrl: `${window.location.origin}/mining?subscribe=success&rigId=${rigId}`,
          cancelUrl: `${window.location.origin}/mining?subscribe=cancel`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription session');
      }

      return data;
    } catch (error) {
      console.error('Rig subscription error:', error);
      throw error;
    }
  },

  async getAccountStatus(accountId: string) {
    try {
      const response = await fetch(`/api/stripe/account-status/${accountId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve account status');
      }
      return data;
    } catch (error) {
      console.error('Status error:', error);
      throw error;
    }
  },

  async createLoginLink(accountId: string) {
    try {
      const response = await fetch('/api/stripe/create-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create login link');
      }
      return data.url;
    } catch (error) {
      console.error('Login link error:', error);
      throw error;
    }
  }
};
