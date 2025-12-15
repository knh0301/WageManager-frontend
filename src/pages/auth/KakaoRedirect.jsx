import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { kakaoLoginWithToken } from '../../api/authApi';
import { setAuthToken } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function KakaoRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('처리 중...');

  const handleKakaoAuth = useCallback(async (code) => {
    try {
      setStatus('카카오 인증 토큰 요청 중...');
      
      // 1. 인가 코드로 액세스 토큰 요청
      const tokenResponse = await axios.post(
        'https://kauth.kakao.com/oauth/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: REST_API_KEY,
          redirect_uri: REDIRECT_URI,
          code: code
        }),
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          }
        }
      );

      const { access_token } = tokenResponse.data;
      if (import.meta.env.DEV) {
        console.log('카카오 액세스 토큰 획득 성공');
        console.log('access_token 길이:', access_token?.length);
      }

      // 2. 백엔드 서버에 카카오 로그인 요청
      setStatus('서버에 로그인 요청 중...');
      try {
        if (import.meta.env.DEV) {
          console.log('kakaoLoginWithToken 호출 중...');
        }
        const loginResponse = await kakaoLoginWithToken(access_token);
        if (import.meta.env.DEV) {
          console.log('카카오 로그인 API 응답:', {
            success: loginResponse.success,
            hasAccessToken: !!loginResponse.data?.accessToken,
            userType: loginResponse.data?.userType,
          });
        }
        
        // 3-1. 기존 회원인 경우 (200 응답)
        if (loginResponse.success && loginResponse.data.accessToken) {
          if (import.meta.env.DEV) {
            console.log('기존 회원 로그인 성공');
          }
          
          // 액세스 토큰, userId, workerCode 출력
          console.log('액세스 토큰:', loginResponse.data.accessToken);
          console.log('userId:', loginResponse.data.userId);
          console.log('workerCode:', loginResponse.data.workerCode);
          
          // accessToken을 localStorage에 저장
          localStorage.setItem('token', loginResponse.data.accessToken);
          
          // Redux에 저장
          dispatch(setAuthToken({
            accessToken: loginResponse.data.accessToken,
            userId: loginResponse.data.userId,
            name: loginResponse.data.name,
            userType: loginResponse.data.userType,
          }));
          
          // userType에 따라 리다이렉트
          if (loginResponse.data.userType === 'EMPLOYER') {
            navigate('/employer');
          } else {
            navigate('/worker');
          }
        } else {
          // success가 false이거나 accessToken이 없는 경우
          throw new Error(loginResponse.error?.message || '로그인에 실패했습니다.');
        }
      } catch (error) {
        // 3-2. 404 또는 401 에러인 경우 -> 신규 회원으로 판단하여 회원가입 진행
        // 상태 코드를 숫자로 명시적으로 변환하여 비교
        const statusCode = 
          Number(error.response?.status) || 
          Number(error.status) || 
          (error.response?.data?.status ? Number(error.response.data.status) : null);
        
        const isUserNotFound = statusCode === 404 || statusCode === 401;
        
        if (isUserNotFound) {
          if (import.meta.env.DEV) {
            console.log('신규 회원으로 판단됨 (404/401)');
          }
          
          // 회원가입 페이지로 이동하면서 카카오 액세스 토큰 전달
          navigate('/signup', { 
            state: { 
              kakaoAccessToken: access_token
            } 
          });
        } else {
          // 400, 500 등 다른 에러
          console.error('[KakaoRedirect] 로그인 API 에러 발생');
          console.error('[KakaoRedirect] 에러 객체:', error);
          console.error('[KakaoRedirect] 에러 타입:', typeof error);
          console.error('[KakaoRedirect] 에러 메시지:', error.message);
          console.error('[KakaoRedirect] 에러 상태 코드:', error.status);
          console.error('[KakaoRedirect] 에러 response:', error.response);
          console.error('[KakaoRedirect] 에러 response.data:', error.response?.data);
          console.error('[KakaoRedirect] 에러 error.error:', error.error);
          console.error('[KakaoRedirect] 에러 스택:', error.stack);
          console.error('[KakaoRedirect] 전체 에러 정보 (JSON):', JSON.stringify(error, null, 2));
          
          Swal.fire({
            icon: 'error',
            title: '로그인 실패',
            text: error.error?.message || error.message || error.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.',
            confirmButtonColor: '#769fcd',
          }).then(() => {
            navigate('/');
          });
        }
      }

    } catch (error) {
      console.error('[KakaoRedirect] 카카오 인증 처리 과정 실패');
      console.error('[KakaoRedirect] 외부 catch 에러 객체:', error);
      console.error('[KakaoRedirect] 외부 catch 에러 타입:', typeof error);
      console.error('[KakaoRedirect] 외부 catch 에러 메시지:', error.message);
      console.error('[KakaoRedirect] 외부 catch 에러 스택:', error.stack);
      console.error('[KakaoRedirect] 외부 catch 전체 에러 정보 (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      setStatus('인증 처리에 실패했습니다.');
      Swal.fire({
        icon: 'error',
        title: '인증 실패',
        text: error.message || '로그인 처리 중 오류가 발생했습니다.',
        confirmButtonColor: '#769fcd',
      }).then(() => {
        navigate('/');
      });
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('카카오 로그인 에러:', error);
      setStatus('로그인에 실패했습니다.');
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (!code) {
      console.error('인증 코드가 없습니다.');
      setStatus('인증 코드를 받지 못했습니다.');
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }

    handleKakaoAuth(code);
  }, [searchParams, handleKakaoAuth, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen p-5" style={{ backgroundColor: 'var(--color-main)' }}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-background)' }}>
          {status}
        </h2>
      </div>
    </div>
  );
}
