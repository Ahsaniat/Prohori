import { API_URL } from '../constants/Config';
import authService from './authService';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Helper to log requests
  private logRequest(method: string, url: string, body?: any, headers?: any) {
    console.log(`[API Request] ${method} ${url}`);
    if (body) {
      try {
        const bodyStr = JSON.stringify(body);
        // Truncate long bodies for readability
        console.log(`[API Req Body] ${bodyStr.length > 500 ? bodyStr.substring(0, 500) + '...' : bodyStr}`);
      } catch (e) {
        console.log('[API Req Body] (Circular or non-serializable)');
      }
    }
  }

  // Helper to log responses
  private async logResponse(response: Response) {
    console.log(`[API Response] ${response.status} ${response.url}`);
    // We clone the response because reading the body consumes the stream
    const clone = response.clone();
    try {
      const text = await clone.text();
      // Truncate long responses
      console.log(`[API Res Body] ${text.length > 500 ? text.substring(0, 500) + '...' : text}`);
    } catch (e) {
      console.log('[API Res Body] (Could not read text)');
    }
  }

  // Main request method
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    // Construct full URL
    // Handle cases where endpoint might already start with / or API_URL
    let url = endpoint;
    if (!endpoint.startsWith('http')) {
       url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    // Prepare headers
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add Auth Token
    if (!skipAuth) {
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn(`[ApiClient] Warning: No token found for authenticated request to ${url}`);
      }
    }

    // Log the outgoing request
    this.logRequest(fetchOptions.method || 'GET', url, fetchOptions.body, headers);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Log the incoming response
      await this.logResponse(response);

      if (!response.ok) {
        // Try to parse error message from JSON
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, use text or default
        }
        throw new Error(errorMessage);
      }

      // Return parsed JSON or null if empty
      // Check content-length or existing text to avoid JSON parse error on empty body
      const text = await response.text();
      if (!text) return {} as T;
      
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        // If response is not JSON (but status was ok), return text? 
        // Or throw? usually API expects JSON.
        console.warn('[ApiClient] Response was not valid JSON:', text.substring(0, 50));
        return text as unknown as T;
      }

    } catch (error) {
      console.error(`[ApiClient] Request Failed: ${error}`);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export a singleton instance configured with the base API URL
export default new ApiClient(`${API_URL}/api`);
