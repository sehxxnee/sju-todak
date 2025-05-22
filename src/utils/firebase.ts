import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBj-ZS1T9Tm46EgOaCPiixDYS8W2RFwYBU',
  authDomain: 'capstone-415ab.firebaseapp.com',
  projectId: 'capstone-415ab',
  storageBucket: 'capstone-415ab.firebasestorage.app',
  messagingSenderId: '729746385693',
  appId: '1:729746385693:web:7b643178674d1b4895cff4',
  measurementId: 'G-5W92P03JQ5',
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// FCM 토큰 요청 및 저장
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BOJx5pMvfTUwUgivyKbQ_9PiiqX0aijew4rP9OX34tXCfG-YjYOxTkzllfXBNfweBpH4PCqXCgCkapjoSJASX7k', // Firebase Console에서 생성한 VAPID 키
      });

      if (token) {
        // 서버에 토큰 저장
        await saveTokenToServer(token);
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// 포그라운드 메시지 핸들러
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('[FCM] onMessage 수신:', payload); // 메시지 수신 로그

      // 포그라운드에서도 알림을 직접 띄움
      if (payload?.notification && Notification.permission === 'granted') {
        console.log('[FCM] Notification API 실행'); // 알림 띄우기 직전 로그
        new Notification(payload.notification.title || '', {
          body: payload.notification.body || '',
          icon: '/assets/notification-icon.png',
          badge: '/assets/notification-badge.png',
        });
      } else {
        console.log('[FCM] Notification 조건 불충족:', {
          hasNotification: !!payload?.notification,
          permission: Notification.permission,
        });
      }
      resolve(payload);
    });
  });
};

// 서버에 토큰 저장
const saveTokenToServer = async (token: string) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('https://test-sso.online/users/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Failed to save token');
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
};
