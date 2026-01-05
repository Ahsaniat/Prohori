import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const useNotificationObserver = () => {
  const router = useRouter();

  useEffect(() => {
    // Listener: When user TAPS the notification (Foreground, Background, or Killed)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const payload = response.notification.request.content.data;
      handleDeepLink(payload);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (data: any) => {
    console.log('Handling deep link with data:', data);
    // THE ROUTING LOGIC
    switch (data.type) {
      case 'functional':
        // e.g. "Your AI analysis is done" -> Go to result
        // Assuming there is a result screen, for now we log.
        if (data.screen) {
             router.push({ pathname: data.screen, params: data.params });
        } else {
             console.log("Functional notification received but no screen specified");
        }
        break;
        
      case 'offer':
        // e.g. "50% Off" -> Go to promo page
        // router.push({ pathname: '/promo', params: { coupon: data.coupon } });
         console.log("Offer notification received:", data);
         // Example routing if promo screen existed:
         // router.push('/screens/promo');
        break;
        
      case 'chat':
        // e.g. "New Message" -> Go to chat room
        if (data.roomId) {
             router.push({ pathname: '/(tabs)/chat', params: { roomId: data.roomId } });
        }
        break;
        
      default:
        // Default: Log unhandled type, do not force navigation
        console.log("Unhandled notification type:", data?.type);
    }
  };
};

export const useLastNotificationResponse = () => {
    const router = useRouter();
    const response = Notifications.useLastNotificationResponse();
  
    useEffect(() => {
      if (response) {
        const data = response.notification.request.content.data;
        // Wait for navigation to be ready, then route
        // We can reuse the handleDeepLink logic here if we export it or duplicate it.
        // For simplicity, let's just log for now as the observer handles the tap usually.
        // But for "Killed" state, this hook is crucial if the app is launched via notification.
        console.log("App launched via notification:", data);
        
         switch (data.type) {
            case 'functional':
                if (data.screen) router.push({ pathname: data.screen, params: data.params });
                break;
            case 'chat':
                if (data.roomId) router.push({ pathname: '/(tabs)/chat', params: { roomId: data.roomId } });
                break;
             default:
                console.log("Unhandled notification type (initial):", data?.type);
         }
      }
    }, [response]);
};
