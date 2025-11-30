import httpClient from './httpClient';

export const kakaoLogin = async (code) => {
  return httpClient.post('/api/auth/kakao', { code });
};

export const kakaoSignup = async (code, userInfo) => {
  return httpClient.post('/api/auth/kakao/signup', { code, ...userInfo });
};

