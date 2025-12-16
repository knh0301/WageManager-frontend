import { refreshAccessToken } from './authApi';
import { store } from '../app/store';
import { setAuthToken, clearAuth } from '../features/auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_WAGEMANAGER || 'http://localhost:8080';

// Refresh token 요청 중인지 추적 (동시 요청 방지)
let isRefreshing = false;
let refreshPromise = null;

// 토큰을 가져오는 헬퍼 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // JSON 응답을 명시적으로 요청
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// 새로운 access token을 저장하는 헬퍼 함수
const saveNewAccessToken = (newAccessToken) => {
  localStorage.setItem('token', newAccessToken);
  
  // Redux에 저장 (기존 userId, name, userType 유지)
  const currentState = store.getState().auth;
  store.dispatch(setAuthToken({
    accessToken: newAccessToken,
    userId: currentState.userId,
    name: currentState.name,
    userType: currentState.userType,
  }));
  
  if (import.meta.env.DEV) {
    console.log('[httpClient] 새로운 access token 저장 완료');
  }
};

// Refresh token 실패 시 로그아웃 처리
const handleRefreshTokenFailure = () => {
  if (import.meta.env.DEV) {
    console.log('[httpClient] Refresh token 실패 - 로그아웃 처리');
  }
  
  // localStorage 초기화
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('name');
  localStorage.removeItem('userType');
  
  // Redux 초기화
  store.dispatch(clearAuth());
  
  // 로그인 페이지로 리다이렉트
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// 네트워크 에러 처리 공통 함수
const handleNetworkError = (error) => {
  console.error('네트워크 에러:', error);
  throw {
    message: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
    status: 0,
    response: {
      status: 0,
      data: { message: '서버에 연결할 수 없습니다.' },
    },
  };
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
      try {
        return await this.handleResponse(response);
      } catch (error) {
        // 401 에러로 토큰 갱신 후 재시도
        if (error.shouldRetry) {
          if (import.meta.env.DEV) {
            console.log('[httpClient] GET 요청 재시도');
          }
          const retryResponse = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
            ...options,
          });
          return await this.handleResponse(retryResponse, { url, method: 'GET', options });
        }
        throw error;
      }
    } catch (error) {
      if (error.shouldRetry) {
        throw error;
      }
      handleNetworkError(error);
    }
  },
  
  async post(url, data, options = {}) {
    try {
      const authHeaders = getAuthHeaders();
      // options.headers에 Authorization이 명시적으로 undefined로 설정되어 있으면 제거
      const headers = { ...authHeaders, ...options.headers };
      if (options.headers?.Authorization === undefined) {
        delete headers.Authorization;
      }
      
      // Content-Type이 명시적으로 설정되지 않았으면 application/json으로 설정
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      
      // options에서 headers를 제외한 나머지만 사용
      const { headers: _, ...restOptions } = options;
      
      const fullUrl = `${API_BASE_URL}${url}`;
      const requestBody = JSON.stringify(data);
      
      if (import.meta.env.DEV) {
        console.log('[httpClient] POST 요청 시작');
        console.log('[httpClient] 요청 URL:', fullUrl);
        console.log('[httpClient] 요청 헤더:', headers);
        console.log('[httpClient] Accept 헤더 확인:', headers['Accept'] || headers['accept']);
        console.log('[httpClient] 요청 본문:', data);
        console.log('[httpClient] API_BASE_URL:', API_BASE_URL);
      }
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: requestBody,
        ...restOptions,
      });
      
      if (import.meta.env.DEV) {
        console.log('[httpClient] 응답 받음');
        console.log('[httpClient] 응답 상태:', response.status, response.statusText);
        console.log('[httpClient] 응답 OK:', response.ok);
        console.log('[httpClient] 응답 Content-Type:', response.headers.get('Content-Type'));
        console.log('[httpClient] 응답 Accept 헤더:', response.headers.get('Accept'));
      }
      
      try {
        return await this.handleResponse(response);
      } catch (error) {
        // 401 에러로 토큰 갱신 후 재시도 (refresh API 자체는 재시도하지 않음)
        if (error.shouldRetry && url !== '/api/auth/refresh') {
          if (import.meta.env.DEV) {
            console.log('[httpClient] POST 요청 재시도');
          }
          const retryResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
            body: requestBody,
            ...restOptions,
          });
          return await this.handleResponse(retryResponse, { url, method: 'POST', data, options });
        }
        throw error;
      }
    } catch (error) {
      if (error.shouldRetry) {
        throw error;
      }
      if (import.meta.env.DEV) {
        console.error('[httpClient] POST 요청 중 네트워크 에러:', error);
      }
      handleNetworkError(error);
    }
  },

  async put(url, data, options = {}) {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      try {
        return await this.handleResponse(response);
      } catch (error) {
        // 401 에러로 토큰 갱신 후 재시도
        if (error.shouldRetry) {
          if (import.meta.env.DEV) {
            console.log('[httpClient] PUT 요청 재시도');
          }
          const retryResponse = await fetch(fullUrl, {
            method: 'PUT',
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
          });
          return await this.handleResponse(retryResponse, { url, method: 'PUT', data, options });
        }
        throw error;
      }
    } catch (error) {
      if (error.shouldRetry) {
        throw error;
      }
      handleNetworkError(error);
    }
  },

  async delete(url, options = {}) {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      try {
        return await this.handleResponse(response);
      } catch (error) {
        // 401 에러로 토큰 갱신 후 재시도
        if (error.shouldRetry) {
          if (import.meta.env.DEV) {
            console.log('[httpClient] DELETE 요청 재시도');
          }
          const retryResponse = await fetch(fullUrl, {
            method: 'DELETE',
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
            ...options,
          });
          return await this.handleResponse(retryResponse, { url, method: 'DELETE', options });
        }
        throw error;
      }
    } catch (error) {
      if (error.shouldRetry) {
        throw error;
      }
      handleNetworkError(error);
    }
  },

  async handleResponse(response, originalRequest = null) {
    if (import.meta.env.DEV) {
      console.log('[httpClient] handleResponse 시작');
      console.log('[httpClient] 응답 상태 코드:', response.status);
      console.log('[httpClient] 응답 Content-Type:', response.headers.get('Content-Type'));
    }
    
    const text = await response.text();
    
    if (import.meta.env.DEV) {
      console.log('[httpClient] 응답 원본 텍스트:', text);
    }
    
    // 응답 데이터 파싱
    let data;
    if (!text) {
      data = { message: response.statusText };
    } else {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        if (import.meta.env.DEV) {
          console.error('[httpClient] JSON 파싱 에러:', parseError);
        }
        data = { message: response.statusText };
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('[httpClient] 파싱된 응답 데이터:', data);
      console.log('[httpClient] response.ok:', response.ok);
      console.log('[httpClient] data.success:', data.success);
    }
    
    // 401 에러 처리: Refresh token으로 토큰 갱신 후 재시도
    if (response.status === 401 && !originalRequest) {
      if (import.meta.env.DEV) {
        console.log('[httpClient] 401 에러 감지 - 토큰 갱신 시도');
      }
      
      // 이미 refresh token 요청 중이면 대기
      if (isRefreshing && refreshPromise) {
        if (import.meta.env.DEV) {
          console.log('[httpClient] 이미 토큰 갱신 중 - 대기');
        }
        try {
          await refreshPromise;
          // 토큰 갱신 완료 후 원래 요청 재시도는 호출한 곳에서 처리
          throw {
            ...data,
            status: response.status,
            response: {
              status: response.status,
              data: data,
            },
            message: data.error?.message || data.message || '인증이 만료되었습니다. 다시 시도해주세요.',
            errorCode: data.error?.code,
            errorMessage: data.error?.message,
            fullErrorData: data,
            shouldRetry: true, // 재시도 플래그
          };
        } catch (refreshError) {
          // refresh token 실패
          handleRefreshTokenFailure();
          throw refreshError;
        }
      }
      
      // Refresh token 요청 시작
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .then((newAccessToken) => {
          saveNewAccessToken(newAccessToken);
          isRefreshing = false;
          refreshPromise = null;
          return newAccessToken;
        })
        .catch((refreshError) => {
          isRefreshing = false;
          refreshPromise = null;
          handleRefreshTokenFailure();
          throw refreshError;
        });
      
      await refreshPromise;
      // 토큰 갱신 성공 - 원래 요청 재시도는 호출한 곳에서 처리
      throw {
        ...data,
        status: response.status,
        response: {
          status: response.status,
          data: data,
        },
        message: data.error?.message || data.message || '인증이 만료되었습니다. 다시 시도해주세요.',
        errorCode: data.error?.code,
        errorMessage: data.error?.message,
        fullErrorData: data,
        shouldRetry: true, // 재시도 플래그
      };
    }
    
    // response.ok가 false이고, 응답 데이터에 success가 false이거나 없으면 에러로 처리
    if (!response.ok) {
      // 백엔드가 success: true로 응답하는 경우 (404도 정상 응답으로 처리)
      if (data.success === true) {
        if (import.meta.env.DEV) {
          console.log('[httpClient] success: true이므로 정상 응답으로 처리');
        }
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
        message: data.error?.message || data.message || '서버 오류가 발생했습니다.',
        // 500 에러 디버깅을 위한 추가 정보
        errorCode: data.error?.code,
        errorMessage: data.error?.message,
        fullErrorData: data,
      };
      
      if (import.meta.env.DEV) {
        console.error('[httpClient] 에러로 처리됨:', error);
        if (response.status === 500) {
          console.error('[httpClient] ⚠️ 500 서버 에러 상세 정보:');
          console.error('[httpClient] - 에러 코드:', data.error?.code);
          console.error('[httpClient] - 에러 메시지:', data.error?.message);
          console.error('[httpClient] - 전체 응답 데이터:', data);
          console.error('[httpClient] - 원본 응답 텍스트:', text);
          console.error('[httpClient] 💡 백엔드 로그를 확인하세요!');
        }
      }
      
      throw error;
    }
    
    // 200 응답인 경우
    if (import.meta.env.DEV) {
      console.log('[httpClient] 정상 응답 반환');
    }
    return data;
  },
};

export default httpClient;

