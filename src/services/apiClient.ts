import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de Pedido: Anexa o JWT
apiClient.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Gestão Global de Erros
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Se o token for inválido/expirado, força o logout
      await signOut(getAuth());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;