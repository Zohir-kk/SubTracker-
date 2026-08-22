import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { daysUntil } from './useSubscriptions';
import { useLanguage } from '../providers/LanguageProvider';

export function usePushNotifications() {
  const { subscriptions } = useStore();
  const { t } = useLanguage();
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const checkNotifications = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted' && subscriptions?.length > 0) {
        subscriptions.forEach(sub => {
          if (sub.status !== 'active' && sub.status !== 'trial') return;
          
          const days = daysUntil(sub);
          if (days <= 1) {
            const notifId = `${sub.id}-${days}`;
            if (!notifiedRef.current.has(notifId)) {
              notifiedRef.current.add(notifId);
              
              const title = t('notifications.title') || "Upcoming Renewal";
              const body = `${sub.name} renews in ${days === 0 ? "less than a day" : "24 hours"}.`;
              
              new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: 'renewal-' + sub.id
              });
            }
          }
        });
      }
    };

    checkNotifications();
  }, [subscriptions, t]);
}
