import httpClient from './httpClient';

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
