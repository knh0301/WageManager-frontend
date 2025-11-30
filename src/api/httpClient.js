const API_BASE_URL = import.meta.env.VITE_WAGEMANAGER || 'http://localhost:8080';

// 토큰을 가져오는 헬퍼 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const httpClient = {
  async get(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    return this.handleResponse(response);
  },
  
  async post(url, data, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    return this.handleResponse(response);
  },

  async put(url, data, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    return this.handleResponse(response);
  },

  async delete(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    return this.handleResponse(response);
  },

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const error = {
        ...errorData,
        status: response.status,
        response: {
          status: response.status,
          data: errorData,
        },
      };
      throw error;
    }
    return response.json();
  },
};

export default httpClient;

