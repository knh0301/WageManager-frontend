import httpClient from './httpClient';

// 카카오 액세스 토큰으로 로그인
export const kakaoLoginWithToken = async (kakaoAccessToken) => {
  // 카카오 로그인 API는 인증이 필요 없으므로 Authorization 헤더 제거
  return httpClient.post('/api/auth/kakao/login', { kakaoAccessToken }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: undefined, // Authorization 헤더 제거
    },
  });
};

// 카카오 액세스 토큰으로 회원가입
export const kakaoRegister = async (kakaoAccessToken, userType) => {
  // 카카오 회원가입 API는 인증이 필요 없으므로 Authorization 헤더 제거
  return httpClient.post('/api/auth/kakao/register', { kakaoAccessToken, userType }, {
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
