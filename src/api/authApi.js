import httpClient from './httpClient';

// 카카오 액세스 토큰으로 로그인
export const kakaoLoginWithToken = async (kakaoAccessToken) => {
  if (import.meta.env.DEV) {
    console.log('[authApi] kakaoLoginWithToken 호출 시작');
    console.log('[authApi] kakaoAccessToken 존재 여부:', !!kakaoAccessToken);
    console.log('[authApi] kakaoAccessToken 길이:', kakaoAccessToken?.length);
  }
  
  // 카카오 로그인 API는 인증이 필요 없으므로 Authorization 헤더 제거
  try {
    const result = await httpClient.post('/api/auth/kakao/login', { kakaoAccessToken }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // JSON 응답 명시적 요청
        Authorization: undefined, // Authorization 헤더 제거
      },
    });
    
    if (import.meta.env.DEV) {
      console.log('[authApi] kakaoLoginWithToken 성공:', result);
    }
    
    return result;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[authApi] kakaoLoginWithToken 에러 발생:', error);
      console.error('[authApi] 에러 상세 정보:', {
        message: error.message,
        status: error.status,
        response: error.response,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

// 카카오 액세스 토큰으로 회원가입
export const kakaoRegister = async (kakaoAccessToken, userType, phone, kakaoPayLink, profileImageUrl) => {
  // 카카오 회원가입 API는 인증이 필요 없으므로 Authorization 헤더 제거
  return httpClient.post('/api/auth/kakao/register', { 
    kakaoAccessToken, 
    userType, 
    phone, 
    kakaoPayLink, 
    profileImageUrl 
  }, {
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

// 로그아웃
export const logout = async (accessToken) => {
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return httpClient.post('/api/auth/logout', {}, {
    headers,
  });
};
