import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '../utils/analytics';
import { logConnectivity } from '../services/connectivityService';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    if (user) {
      logConnectivity();
    }
  }, [user]);

  return null;
}
