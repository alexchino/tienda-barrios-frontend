import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000,
  // 💡 Quitamos el Content-Type fijo para que Axios lo maneje dinámicamente
});

// 2. Interceptor de Peticiones (Seguridad)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor de Respuestas (Manejo de sesión expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada. Limpiando datos...");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Descomenta la siguiente línea cuando quieras que te saque al login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;