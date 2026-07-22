import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, CheckCircle, AlertTriangle, MessageSquare, Bell, Volume2 } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import clsx from 'clsx';

interface Order {
  id: string;
  productName: string;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
  createdAt: string;
  deliveryDueDate: string;
  userMarkedReceived: boolean;
  reminderSent: boolean;
  adminAlerted: boolean;
  dealerUid: string;
}

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('buyerUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      // Sort in memory by createdAt descending
      ordersData.sort((a, b) => {
        const getTimestamp = (val: any) => {
          if (!val) return 0;
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          return new Date(val).getTime();
        };
        return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
      });
      setOrders(ordersData);
      setLoading(false);

      // Check for overdue orders that need a reminder
      const now = new Date();
      const needsReminder = ordersData.find(order => {
        if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'disputed' || order.userMarkedReceived) return false;
        const dueDate = new Date(order.deliveryDueDate);
        return now > dueDate && !order.reminderSent;
      });

      if (needsReminder) {
        setShowReminder(needsReminder);
        playReminderSound();
        // Notify admin about the delay
        if (!needsReminder.adminAlerted) {
          updateDoc(doc(db, 'orders', needsReminder.id), { adminAlerted: true });
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const playReminderSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.error('Audio reminder failed', e);
    }
  };

  const handleMarkReceived = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        userMarkedReceived: true,
        status: 'delivered'
      });
      toast.success('Thank you for confirming the delivery!');
      if (showReminder?.id === orderId) setShowReminder(null);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleReportIssue = async (order: Order) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'disputed',
        adminAlerted: true,
        reminderSent: true
      });
      toast.error('Issue reported. Supreme Admin has been notified for investigation.');
      if (showReminder?.id === order.id) setShowReminder(null);
    } catch (error) {
      toast.error('Failed to report issue');
    }
  };

  const handleDismissReminder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        reminderSent: true
      });
      setShowReminder(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-[var(--color-supreme-gold)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order & Delivery Tracking</h2>
          <p className="text-sm text-gray-500">Monitor your purchases and confirm receipt of goods</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No orders found. Visit the Market to start shopping!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => {
            const isOverdue = new Date() > new Date(order.deliveryDueDate) && !order.userMarkedReceived && order.status !== 'delivered';
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "p-6 rounded-2xl border transition-all",
                  isOverdue ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={clsx(
                      "p-3 rounded-xl",
                      isOverdue ? "bg-red-100 text-red-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.productName}</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Order ID: {order.id.substring(0, 8).toUpperCase()}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Due: {new Date(order.deliveryDueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-supreme-gold)]">
                          <span>${order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === 'delivered' || order.userMarkedReceived ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-4 h-4" /> Received
                      </span>
                    ) : order.status === 'disputed' ? (
                      <span className="flex items-center gap-1.5 text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        <AlertTriangle className="w-4 h-4" /> Disputed
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleMarkReceived(order.id)}
                          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                        >
                          Mark as Received
                        </button>
                        <button
                          onClick={() => handleReportIssue(order)}
                          className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm"
                        >
                          Not Received
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isOverdue && order.status === 'pending' && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-200 flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-xs text-red-700 font-bold">
                      Delivery period has exceeded! If you haven't received the product, please report it.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-amber-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <Bell className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Delivery Reminder!</h3>
                <p className="text-gray-600 mb-8 font-medium">
                  The delivery period for <span className="font-bold text-gray-900">"{showReminder.productName}"</span> has passed. 
                  Have you received this product yet?
                </p>
                
                <div className="grid grid-cols-1 gap-3 w-full">
                  <button
                    onClick={() => handleMarkReceived(showReminder.id)}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    Yes, I Received It
                  </button>
                  <button
                    onClick={() => handleReportIssue(showReminder)}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-lg"
                  >
                    No, I Haven't Received It
                  </button>
                  <button
                    onClick={() => handleDismissReminder(showReminder.id)}
                    className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Remind Me Later
                  </button>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <Volume2 className="w-3 h-3" /> Audio Reminder Active
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
