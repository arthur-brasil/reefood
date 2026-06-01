import axios from 'axios';

const BASE_URL = 'http://172.20.10.9:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const alimentosService = {
  cadastrar: (dados)     => api.post('/alimentos', dados),
  listar:    (categoria) => api.get('/alimentos', { params: categoria ? { categoria } : {} }),
};

export default api;