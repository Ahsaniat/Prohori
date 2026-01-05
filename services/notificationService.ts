import { API_URL } from '../constants/Config';

const SERVICE_BASE_URL = `${API_URL}/api`;

type UserIdListener = (userId: string | null) => void;

class NotificationService {
  private token: string | null = null;
  private userId: string | null = null;
  private listeners: UserIdListener[] = [];

  setToken(token: string) {
    this.token = token;
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    this.notifyListeners();
  }

  getUserId() {
    return this.userId;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token && !!this.userId;
  }

  // Listener pattern to allow React components to react to auth changes
  addListener(listener: UserIdListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.userId));
  }

  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async savePushToken(pushToken: string) {
    // Gracefully skip if not authenticated
    if (!this.token) {
      console.log('Push token save skipped: User not authenticated');
      return null;
    }

    try {
      const response = await fetch(`${SERVICE_BASE_URL}/notifications/token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ pushToken }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving push token:', error);
      throw error;
    }
  }

  // ... (rest of methods can stay mostly same, though direct send might change if using client-side trigger which is rare for apps)
  // For now we keep them pointing to backend.

  async sendNotification(pushToken: string, title: string, body: string, data?: any) {
    if (!this.token) {
      console.log('Send notification skipped: User not authenticated');
      return null;
    }

    try {
      const response = await fetch(`${SERVICE_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ pushToken, title, body, data }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendBulkNotifications(notifications: Array<{
    pushToken: string;
    title: string;
    body: string;
    data?: any;
  }>) {
    if (!this.token) {
      console.log('Send bulk notifications skipped: User not authenticated');
      return null;
    }

    try {
      const response = await fetch(`${SERVICE_BASE_URL}/notifications/send-bulk`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ notifications }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  async getPreferences() {
    if (!this.token) {
      console.log('Get preferences skipped: User not authenticated');
      return null;
    }

    try {
      const response = await fetch(`${SERVICE_BASE_URL}/notifications/preferences`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: {
    marketing?: boolean;
    security?: boolean;
    updates?: boolean;
  }) {
    if (!this.token) {
      console.log('Update preferences skipped: User not authenticated');
      return null;
    }

    try {
      const response = await fetch(`${SERVICE_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(preferences),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

export default new NotificationService();