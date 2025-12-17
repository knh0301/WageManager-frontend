import httpClient from './httpClient';

// 카카오 액세스 토큰으로 로그인
export const kakaoLoginWithToken = async (kakaoAccessToken) => {
  console.log('[authApi] kakaoLoginWithToken 호출 시작');
  console.log('[authApi] kakaoAccessToken 존재 여부:', !!kakaoAccessToken);
  console.log('[authApi] kakaoAccessToken 길이:', kakaoAccessToken?.length);
  
  // 카카오 로그인 API는 인증이 필요 없으므로 Authorization 헤더 제거
  try {
    const result = await httpClient.post('/api/auth/kakao/login', { kakaoAccessToken }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // JSON 응답 명시적 요청
        Authorization: undefined, // Authorization 헤더 제거
      },
    });
    
    console.log('[authApi] kakaoLoginWithToken 성공:', result);
    
    return result;
  } catch (error) {
    console.error('[authApi] kakaoLoginWithToken 에러 발생:', error);
    console.error('[authApi] 에러 상세 정보:', {
      message: error.message,
      status: error.status,
      response: error.response,
      data: error.response?.data,
    });
    throw error;
  }
};

// 카카오 액세스 토큰으로 회원가입
export const kakaoRegister = async (kakaoAccessToken, userType, phone, kakaoPayLink, profileImageUrl) => {
  // 카카오 회원가입 API는 인증이 필요 없으므로 Authorization 헤더 제거
  // 백엔드 요구사항에 맞춰 필드 순서를 명시적으로 지정
  const requestBody = {
    kakaoAccessToken: kakaoAccessToken,
    userType: userType,
    phone: phone,
    kakaoPayLink: kakaoPayLink,
    profileImageUrl: profileImageUrl || '',
  };
  
  console.log('[authApi] kakaoRegister 요청 본문:', requestBody);
  console.log('[authApi] 필드 순서 확인:', Object.keys(requestBody));
  
  return httpClient.post('/api/auth/kakao/register', requestBody, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: undefined, // Authorization 헤더 제거
    },
  });
};

// 추가 회원 정보 등록
export const registerUser = async (userData) => {
  return httpClient.post('/api/users/register', userData);
};

// 개발자용 임시 로그인
export const devLogin = async (userId, name, userType) => {
  return httpClient.post('/api/auth/dev/login', { 
    userId, 
    name, 
    userType 
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: undefined, // Authorization 헤더 제거
    },
  });
};

// Refresh Token을 사용하여 새로운 Access Token 발급
export const refreshAccessToken = async () => {
  const API_BASE_URL = import.meta.env.VITE_WAGEMANAGER || 'http://localhost:8080';
  
  console.log('[authApi] refreshAccessToken 호출 시작');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // ⚠️ 중요! 쿠키 자동 포함
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('[authApi] refreshAccessToken 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: response.statusText };
      }
      
      console.error('[authApi] refreshAccessToken 실패:', errorData);
      
      throw {
        status: response.status,
        message: errorData.error?.message || errorData.message || '토큰 갱신 실패',
        error: errorData.error,
        response: {
          status: response.status,
          data: errorData,
        },
      };
    }
    
    const data = await response.json();
    
    console.log('[authApi] refreshAccessToken 성공:', {
      success: data.success,
      hasAccessToken: !!data.data?.accessToken,
    });
    
    if (data.success && data.data?.accessToken) {
      return data.data.accessToken;
    }
    
    throw new Error(data.error?.message || '토큰 갱신 실패');
  } catch (error) {
    console.error('[authApi] refreshAccessToken 에러:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async (accessToken) => {
  // 액세스 토큰을 헤더에 포함
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return httpClient.post('/api/auth/logout', {}, {
    headers,
  });
};
