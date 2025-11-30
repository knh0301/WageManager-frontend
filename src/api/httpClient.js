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
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      return this.handleResponse(response);
    } catch (error) {
      // 네트워크 에러 처리 (서버가 실행되지 않았거나 연결 불가)
      console.error('네트워크 에러:', error);
      throw {
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
        status: 0,
        response: {
          status: 0,
          data: { message: '서버에 연결할 수 없습니다.' },
        },
      };
    }
  },
  
  async post(url, data, options = {}) {
    try {
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
    } catch (error) {
      // 네트워크 에러 처리
      console.error('네트워크 에러:', error);
      throw {
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
        status: 0,
        response: {
          status: 0,
          data: { message: '서버에 연결할 수 없습니다.' },
        },
      };
    }
  },

  async put(url, data, options = {}) {
    try {
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
    } catch (error) {
      // 네트워크 에러 처리
      console.error('네트워크 에러:', error);
      throw {
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
        status: 0,
        response: {
          status: 0,
          data: { message: '서버에 연결할 수 없습니다.' },
        },
      };
    }
  },

  async delete(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      return this.handleResponse(response);
    } catch (error) {
      // 네트워크 에러 처리
      console.error('네트워크 에러:', error);
      throw {
        message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
        status: 0,
        response: {
          status: 0,
          data: { message: '서버에 연결할 수 없습니다.' },
        },
      };
    }
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

