import api, { setAuthToken } from './api';
import { notify } from '../components/Toast';

const MAX_RETRY = 3;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // 401 -> redirect to login
    if (response?.status === 401) {
      notify('Session expirée, veuillez vous reconnecter', 'error');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry for 5xx up to MAX_RETRY
    const status = response?.status;
    if (status && status >= 500 && status < 600) {
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= MAX_RETRY) {
        return api(config);
      }
    }

    // Show server message if any
    const msg = response?.data?.message || 'Erreur serveur';
    if (status === 500 || (status && status >= 400)) {
      notify(msg, 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
export { setAuthToken };
