import httpClient from './httpClient';

// 카카오 인가코드로 accessToken 받아오기 
export const kakaoLogin = async (code) => {
  return httpClient.post('/api/auth/kakao', { code });
};

export const kakaoSignup = async (code, userInfo) => {
  return httpClient.post('/api/auth/kakao/signup', { code, ...userInfo });
};

// 카카오 ID로 기존 회원 여부 확인
export const checkKakaoUser = async (kakaoId) => {
  return httpClient.get(`/api/users/kakao/${kakaoId}`);
};

// 회원가입
export const registerUser = async (userData) => {
  return httpClient.post('/api/users/register', userData);
};

// 개발용 로그인 (기존 회원)
export const devLogin = async (userData) => {
  return httpClient.post('/api/auth/dev/login', userData);
};
