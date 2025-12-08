const BASE_URL = 'http://192.168.0.110:5000/api';

class NotificationService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
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
    try {
      const response = await fetch(`${BASE_URL}/notifications/token`, {
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

  async sendNotification(pushToken: string, title: string, body: string, data?: any) {
    try {
      const response = await fetch(`${BASE_URL}/notifications/send`, {
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
    try {
      const response = await fetch(`${BASE_URL}/notifications/send-bulk`, {
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
}

export default new NotificationService();
