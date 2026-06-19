import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.9:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token Firebase em todas as requisições autenticadas
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // silencia falha ao obter token
  }
  return config;
});

export const alimentosService = {
  cadastrar: (dados)     => api.post('/alimentos', dados),
  listar:    (categoria) => api.get('/alimentos', { params: categoria ? { categoria } : {} }),
  atualizar: (id, dados) => api.put(`/alimentos/${id}`, dados),
  excluir:   (id)        => api.delete(`/alimentos/${id}`),
};

export const registrosService = {
  registrar: (dados)  => api.post('/registros', dados),
  listar:    (dias)   => api.get('/registros', { params: { dias } }),
  resumo:    (dias)   => api.get('/registros/resumo', { params: { dias } }),
};

export const listaComprasService = {
  listar:          ()     => api.get('/lista-compras'),
  adicionar:       (dados) => api.post('/lista-compras', dados),
  toggle:          (id)   => api.patch(`/lista-compras/${id}/toggle`),
  excluir:         (id)   => api.delete(`/lista-compras/${id}`),
  limparComprados: ()     => api.delete('/lista-compras/comprados'),
};

export default api;
