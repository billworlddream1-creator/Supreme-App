export interface RankBenefit {
  rank: string;
  label: string;
  color: string;
  benefits: string[];
  feeReduction: string;
  earningMultiplier: string;
  exclusiveAccess: string[];
  requirements: {
    minBalance: number;
    minTransactions: number;
    minFollowers: number;
  };
}

export const RANK_BENEFITS: Record<string, RankBenefit> = {
  'Bronze': {
    rank: 'Bronze',
    label: 'Bronze',
    color: '#CD7F32',
    benefits: ['Standard transaction fees', 'Basic earning rate', 'Standard support'],
    feeReduction: '3%',
    earningMultiplier: '1.0x',
    exclusiveAccess: ['Public Communities'],
    requirements: {
      minBalance: 0,
      minTransactions: 0,
      minFollowers: 0
    }
  },
  'Silver': {
    rank: 'Silver',
    label: 'Silver',
    color: '#C0C0C0',
    benefits: ['Reduced transaction fees', 'Enhanced earning rate', 'Priority support'],
    feeReduction: '2.5%',
    earningMultiplier: '1.1x',
    exclusiveAccess: ['Public Communities', 'Silver Lounge'],
    requirements: {
      minBalance: 500,
      minTransactions: 10,
      minFollowers: 50
    }
  },
  'Gold': {
    rank: 'Gold',
    label: 'Gold',
    color: '#FFD700',
    benefits: ['Lower transaction fees', 'High earning rate', 'VIP support', 'Exclusive badges'],
    feeReduction: '2.0%',
    earningMultiplier: '1.25x',
    exclusiveAccess: ['Public Communities', 'Silver Lounge', 'Gold Executive Club'],
    requirements: {
      minBalance: 2500,
      minTransactions: 50,
      minFollowers: 250
    }
  },
  'Diamond': {
    rank: 'Diamond',
    label: 'Diamond',
    color: '#B9F2FF',
    benefits: ['Minimal transaction fees', 'Premium earning rate', 'Dedicated manager', 'Early access'],
    feeReduction: '1.5%',
    earningMultiplier: '1.5x',
    exclusiveAccess: ['All Communities', 'Diamond Elite Circle', 'Beta Features'],
    requirements: {
      minBalance: 10000,
      minTransactions: 200,
      minFollowers: 1000
    }
  },
  'Crowned': {
    rank: 'Crowned',
    label: 'Crowned',
    color: '#FF4500',
    benefits: ['Zero transaction fees', 'Maximum earning rate', 'Concierge support', 'Profile spotlight'],
    feeReduction: '0%',
    earningMultiplier: '2.0x',
    exclusiveAccess: ['All Communities', 'Royal Court', 'Global Spotlight', 'Private Events'],
    requirements: {
      minBalance: 50000,
      minTransactions: 1000,
      minFollowers: 5000
    }
  },
  'Official': {
    rank: 'Official',
    label: 'Official',
    color: '#1DA1F2',
    benefits: ['Verified status', 'Platform recognition', 'Administrative tools'],
    feeReduction: '0%',
    earningMultiplier: '1.0x',
    exclusiveAccess: ['Platform Management', 'Official Channels'],
    requirements: {
      minBalance: 0,
      minTransactions: 0,
      minFollowers: 0
    }
  }
};

// Map lowercase ranks to standard ones if needed
export const getRankData = (rank: string) => {
  const normalizedRank = rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
  return RANK_BENEFITS[normalizedRank] || RANK_BENEFITS['Bronze'];
};
