export interface BoostPlan {
  id: string;
  name: string;
  multiplier: number;
  durationDays: number;
  price: number;
  color: string;
  description: string;
}

export const BOOST_PLANS: BoostPlan[] = [
  {
    id: 'bronze-boost',
    name: 'Bronze Boost',
    multiplier: 1.05, // 5% extra
    durationDays: 1,
    price: 5,
    color: 'from-orange-400 to-orange-600',
    description: 'Perfect for a quick earning sprint. Get 5% extra for 24 hours.'
  },
  {
    id: 'silver-boost',
    name: 'Silver Boost',
    multiplier: 1.10, // 10% extra
    durationDays: 7,
    price: 25,
    color: 'from-gray-300 to-gray-500',
    description: 'A solid weekly advantage. Boost your earnings by 10% for 7 days.'
  },
  {
    id: 'gold-boost',
    name: 'Gold Boost',
    multiplier: 1.15, // 15% extra
    durationDays: 30,
    price: 75,
    color: 'from-yellow-400 to-yellow-600',
    description: 'The professional choice. Enjoy a 15% bonus on all activities for a full month.'
  },
  {
    id: 'supreme-boost',
    name: 'Supreme Boost',
    multiplier: 1.25, // 25% extra
    durationDays: 365,
    price: 500,
    color: 'from-purple-500 to-indigo-600',
    description: 'The ultimate elite advantage. A massive 25% extra earnings for an entire year.'
  }
];
