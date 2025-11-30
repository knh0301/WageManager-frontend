import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { checkKakaoUser } from '../../api/authApi';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function KakaoRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      console.log('액세스 토큰 획득 성공');

      // 2. 액세스 토큰으로 카카오 사용자 정보(ID) 요청
      setStatus('카카오 사용자 정보 요청 중...');
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      const kakaoId = userResponse.data.id;
      console.log('카카오 ID 획득:', kakaoId);

      // 3. 백엔드 서버에 가입 여부 확인
      setStatus('서버에 회원 정보 확인 중...');
      try {
        const serverResponse = await checkKakaoUser(kakaoId);
        
        // 4-1. 기존 회원인 경우 -> 로그인 성공 처리
        console.log('기존 회원 확인됨:', serverResponse);
        
        if (serverResponse.success) {
            // 임시로 사용자 정보 저장
            localStorage.setItem('user', JSON.stringify(serverResponse.data));
            
            const userRole = serverResponse.data.role || 'WORKER'; 
            
            if (userRole === 'EMPLOYER' || userRole === 'employer') {
                navigate('/employer');
            } else {
                navigate('/worker');
            }
        }
        
      } catch (error) {
        // 4-2. 404 에러 등 발생 시 -> 신규 회원으로 판단하여 회원가입 진행
        console.log('신규 회원으로 판단됨 (또는 조회 실패):', error);
        
        // 회원가입 로직 (추가 정보 입력 페이지로 이동하거나 자동 가입)
        setStatus('신규 회원입니다. 회원가입을 진행합니다...');
        
        // 카카오 프로필 정보에서 닉네임 등 가져오기
        const kakaoAccount = userResponse.data.kakao_account;
        const profile = kakaoAccount?.profile;
        const name = profile?.nickname;
        const profileImageUrl = profile?.profile_image_url;
        
        // 회원가입 페이지로 이동하면서 카카오 정보 전달
        navigate('/signup', { 
          state: { 
            kakaoId,
            name,
            profileImageUrl
          } 
        });
      }

    } catch (error) {
      console.error('카카오 인증 처리 과정 실패:', error);
      setStatus('인증 처리에 실패했습니다.');
      alert('로그인 처리 중 오류가 발생했습니다.');
      navigate('/');
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
