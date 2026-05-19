import { useEffect } from 'react';
import { t10Service } from '../services/t10Service';
import { useAuth } from '../context/AuthContext';

export default function T10RewardTrigger() {
  const { profile } = useAuth();

  useEffect(() => {
    // Attempt to distribute rewards when an admin logs in.
    // The service internally checks if rewards for the previous week have already been distributed.
    if (profile && (profile.role === 'admin' || profile.role === 'mini-admin')) {
      t10Service.distributeWeeklyRewards().then(result => {
        if (result.success) {
          console.log(`[T10] Weekly rewards distributed to ${result.winnersCount} users.`);
        }
      }).catch(err => {
        console.error('[T10] Error in automatic reward distribution:', err);
      });
    }
  }, [profile]);

  return null;
}
