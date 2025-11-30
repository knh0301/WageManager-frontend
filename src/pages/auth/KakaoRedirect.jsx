import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { kakaoLogin, kakaoSignup } from '../../api/authApi';
import axios from "axios";

export default function KakaoRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('처리 중...');

  const handleKakaoAuth = useCallback(async (code) => {
    try {
      setStatus('로그인 처리 중...');
      
      // 먼저 로그인 시도 (기존 회원인 경우)
      try {
        const response = await kakaoLogin(code);
        
        // 로그인 성공
        if (response.token) {
          // 토큰 저장 (localStorage 또는 Redux store)
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // 사용자 역할에 따라 리다이렉트
          const userRole = response.user?.role || response.user?.userType;
          if (userRole === 'EMPLOYER' || userRole === 'employer') {
            navigate('/employer');
          } else {
            navigate('/worker');
          }
          return;
        }
      } catch (loginError) {
        // 로그인 실패 시 회원가입 필요로 판단
        console.log('기존 회원이 아니거나 로그인 실패, 회원가입 진행:', loginError);
      }

      // 회원가입 필요 (추가 정보 입력 페이지로 이동하거나 자동 회원가입)
      setStatus('회원가입 처리 중...');
      
      // TODO: 회원가입 시 추가 정보가 필요한 경우 별도 페이지로 이동
      // 현재는 자동 회원가입으로 처리 (백엔드 API에 따라 수정 필요)
      const signupResponse = await kakaoSignup(code, {});
      
      if (signupResponse.token) {
        localStorage.setItem('token', signupResponse.token);
        localStorage.setItem('user', JSON.stringify(signupResponse.user));
        
        const userRole = signupResponse.user?.role || signupResponse.user?.userType;
        if (userRole === 'EMPLOYER' || userRole === 'employer') {
          navigate('/employer');
        } else {
          navigate('/worker');
        }
      }
    } catch (error) {
      console.error('카카오 인증 처리 실패:', error);
      setStatus('인증 처리에 실패했습니다.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [navigate]);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    handleKakaoAuth(code);
  }, [searchParams]);

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

