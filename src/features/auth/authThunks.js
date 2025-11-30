import { devLogin } from '../../api/authApi';
import { setUserInfo, setAuthToken } from './authSlice';

// checkKakaoUser 응답 데이터를 받아서 Redux에 저장하고 dev/login을 호출
export const completeKakaoLogin = (userData) => async (dispatch) => {
  try {
    // userId, workerCode, kakaoPayLink를 Redux에 저장
    dispatch(setUserInfo({
      userId: userData.userId,
      workerCode: userData.workerCode,
      kakaoPayLink: userData.kakaoPayLink,
    }));

    // dev/login API 호출
    const loginResponse = await devLogin({ userId: userData.userId });
    
    if (loginResponse.success && loginResponse.data.accessToken) {
      // accessToken을 localStorage에 저장
      localStorage.setItem('token', loginResponse.data.accessToken);
      
      // accessToken, name을 Redux에 저장
      dispatch(setAuthToken({
        accessToken: loginResponse.data.accessToken,
        name: loginResponse.data.name,
        userType: loginResponse.data.userType,
      }));

      return {
        success: true,
        userType: loginResponse.data.userType,
      };
    } else {
      throw new Error(loginResponse.error?.message || '로그인 실패');
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
};

