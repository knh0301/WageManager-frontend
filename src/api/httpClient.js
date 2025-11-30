const API_BASE_URL = import.meta.env.VITE_WAGEMANAGER || 'http://localhost:8080';

// 디버깅: API_BASE_URL 확인
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_WAGEMANAGER:', import.meta.env.VITE_WAGEMANAGER);

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
      const fullUrl = `${API_BASE_URL}${url}`;
      console.log('Request URL:', fullUrl);
      const response = await fetch(fullUrl, {
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
    // 모든 응답을 JSON으로 파싱 (404도 포함)
    const data = await response.json().catch(() => ({ message: response.statusText }));
    
    // response.ok가 false이고, 응답 데이터에 success가 false이거나 없으면 에러로 처리
    if (!response.ok) {
      // 백엔드가 success: true로 응답하는 경우 (404도 정상 응답으로 처리)
      if (data.success === true) {
        return data;
      }
      
      // success가 false이거나 없으면 에러로 throw
      const error = {
        ...data,
        status: response.status,
        response: {
          status: response.status,
          data: data,
        },
      };
      throw error;
    }
    
    // 200 응답인 경우
    return data;
  },
};

export default httpClient;

