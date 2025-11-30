import httpClient from './httpClient';

// 카카오 액세스 토큰으로 로그인
export const kakaoLoginWithToken = async (kakaoAccessToken) => {
  console.log('kakaoLoginWithToken 호출, 받은 토큰:', kakaoAccessToken);
  console.log('요청 Body에 보낼 데이터:', { kakaoAccessToken });
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
