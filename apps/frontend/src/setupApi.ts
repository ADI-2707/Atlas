import { api } from '@atlas/api';
import { TokenStorage } from '@atlas/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

api.setBaseUrl(apiUrl);

api.addRequestInterceptor((config) => {
  const token = TokenStorage.getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

api.addResponseInterceptor(async (response, retry, config) => {
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: localStorage.getItem('atlas_refresh_token') })
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          TokenStorage.setToken(data.accessToken);
          localStorage.setItem('atlas_refresh_token', data.refreshToken);
          isRefreshing = false;
          onRefreshed(data.accessToken);
          
          return retry({
            ...config,
            headers: {
              ...(config?.headers || {}),
              'Authorization': `Bearer ${data.accessToken}`
            }
          });
        } else {
          TokenStorage.removeToken();
          localStorage.removeItem('atlas_refresh_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } catch (err) {
        TokenStorage.removeToken();
        localStorage.removeItem('atlas_refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      isRefreshing = false;
    } else {
      return new Promise(resolve => {
        subscribeTokenRefresh((token) => {
          resolve(retry({
            ...config,
            headers: {
              ...(config?.headers || {}),
              'Authorization': `Bearer ${token}`
            }
          }));
        });
      });
    }
  }
  return response;
});
