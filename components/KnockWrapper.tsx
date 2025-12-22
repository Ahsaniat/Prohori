import React, { useEffect, useState } from 'react';
import { KnockProvider, KnockFeedProvider, KnockExpoPushNotificationProvider } from '@knocklabs/expo';
import notificationService from '../services/notificationService';
import { useNotifications } from '../hooks/useNotifications';

// Ensure these are defined in your .env
const KNOCK_PUBLIC_API_KEY = process.env.EXPO_PUBLIC_KNOCK_PUBLIC_API_KEY;
const KNOCK_FEED_CHANNEL_ID = process.env.EXPO_PUBLIC_KNOCK_FEED_CHANNEL_ID;
const KNOCK_PUSH_CHANNEL_ID = process.env.EXPO_PUBLIC_KNOCK_PUSH_CHANNEL_ID;

interface KnockWrapperProps {
  children: React.ReactNode;
}

export default function KnockWrapper({ children }: KnockWrapperProps) {
  const [userId, setUserId] = useState<string | null>(notificationService.getUserId());
  const [isReady, setIsReady] = useState(false);
  
  // Only initialize notifications when we have a userId (user is logged in)
  const { expoPushToken } = useNotifications();

  useEffect(() => {
    // Initial check
    setUserId(notificationService.getUserId());
    setIsReady(true);

    // Subscribe to changes
    const unsubscribe = notificationService.addListener((newId) => {
      console.log("KnockWrapper: User ID changed to:", newId);
      setUserId(newId);
    });

    return () => unsubscribe();
  }, []);

  // Save Push Token to Backend (Global Sync) - only when authenticated
  useEffect(() => {
    const syncToken = async () => {
      const token = notificationService.getToken();
      if (userId && expoPushToken && token) {
        console.log('KnockWrapper: Syncing push token to backend...');
        try {
          await notificationService.savePushToken(expoPushToken);
          console.log('KnockWrapper: Push token synced successfully.');
        } catch (err) {
          // Graceful handling - don't spam console with errors
          console.log('KnockWrapper: Push token sync deferred (will retry later)');
        }
      }
    };

    syncToken();
  }, [userId, expoPushToken]);

  // Wait for initial check to complete
  if (!isReady) {
    return <>{children}</>;
  }

  // Skip Knock initialization if user is not logged in
  if (!userId) {
    return <>{children}</>;
  }

  // Skip if Knock API keys are missing
  if (!KNOCK_PUBLIC_API_KEY || !KNOCK_FEED_CHANNEL_ID) {
    console.warn("KnockWrapper: Missing API Keys. Skipping Knock initialization.");
    return <>{children}</>;
  }

  return (
    <KnockProvider apiKey={KNOCK_PUBLIC_API_KEY} userId={userId}>
      <KnockFeedProvider feedId={KNOCK_FEED_CHANNEL_ID}>
        {KNOCK_PUSH_CHANNEL_ID ? (
          <KnockExpoPushNotificationProvider knockExpoChannelId={KNOCK_PUSH_CHANNEL_ID}>
            {children}
          </KnockExpoPushNotificationProvider>
        ) : (
          <>{children}</>
        )}
      </KnockFeedProvider>
    </KnockProvider>
  );
}
