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
      console.log('카카오 액세스 토큰 획득 성공');
      console.log('access_token 값:', access_token);
      console.log('access_token 타입:', typeof access_token);
      console.log('access_token 길이:', access_token?.length);

      // 2. 백엔드 서버에 카카오 로그인 요청
      setStatus('서버에 로그인 요청 중...');
      try {
        console.log('kakaoLoginWithToken 호출 전, 전달할 토큰:', access_token);
        const loginResponse = await kakaoLoginWithToken(access_token);
        console.log('카카오 로그인 API 응답:', loginResponse);
        
        // 3-1. 기존 회원인 경우 (200 응답)
        if (loginResponse.success && loginResponse.data.accessToken) {
          console.log('기존 회원 로그인 성공:', loginResponse);
          
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
        const isUserNotFound = 
          error.status === 404 || 
          error.response?.status === 404 || 
          error.status === 401 || 
          error.response?.status === 401 ||
          error.message?.includes('404') ||
          error.message?.includes('401');
        
        if (isUserNotFound) {
          console.log('신규 회원으로 판단됨 (404/401):', error);
          
          // 회원가입 페이지로 이동하면서 카카오 액세스 토큰 전달
          navigate('/signup', { 
            state: { 
              kakaoAccessToken: access_token
            } 
          });
        } else {
          // 400, 500 등 다른 에러
          console.error('로그인 API 에러:', error);
          Swal.fire({
            icon: 'error',
            title: '로그인 실패',
            text: error.error?.message || error.message || '로그인 처리 중 오류가 발생했습니다.',
            confirmButtonColor: '#769fcd',
          }).then(() => {
            navigate('/');
          });
        }
      }

    } catch (error) {
      console.error('카카오 인증 처리 과정 실패:', error);
      setStatus('인증 처리에 실패했습니다.');
      Swal.fire({
        icon: 'error',
        title: '인증 실패',
        text: '로그인 처리 중 오류가 발생했습니다.',
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
