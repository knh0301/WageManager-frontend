import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import kakaoLoginIcon from "../../assets/kakao_login_medium_wide.png";
import { devLogin } from '../../api/authApi';
import { setAuthToken } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const buildKakaoAuthUrl = () => {
  if (!REST_API_KEY) {
    return null;
  }
  if (!REDIRECT_URI) {
    return null;
  }
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: REST_API_KEY,
    redirect_uri: REDIRECT_URI,
  });
  const authUrl = `${baseUrl}?${params.toString()}`;
  return authUrl;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = buildKakaoAuthUrl();
    if (kakaoAuthUrl) {
      window.location.href = kakaoAuthUrl;
    } else {
      console.error('카카오 로그인 설정 오류: 환경 변수가 설정되지 않았습니다.');
      alert('카카오 로그인 설정이 완료되지 않았습니다. 관리자에게 문의하세요.');
    }
  };

  const handleDevLogin = async () => {
    try {
      // 기본값으로 개발자 로그인 (WORKER 타입)
      const response = await devLogin('1', '테스트 사용자', 'WORKER');
      
      if (response.success && response.data?.accessToken) {
        // localStorage에 모든 데이터 저장
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('userId', String(response.data.userId));
        localStorage.setItem('name', response.data.name || '');
        localStorage.setItem('userType', response.data.userType || '');
        
        // Redux에 모든 데이터 저장
        dispatch(setAuthToken({
          accessToken: response.data.accessToken,
          userId: response.data.userId,
          name: response.data.name,
          userType: response.data.userType,
        }));
        
        // userType에 따라 리다이렉트
        if (response.data.userType === 'EMPLOYER') {
          navigate('/employer');
        } else {
          navigate('/worker');
        }
      } else {
        throw new Error(response.error?.message || '개발자 로그인 실패');
      }
    } catch (error) {
      console.error('개발자 로그인 에러:', error);
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: error.error?.message || error.message || '개발자 로그인 중 오류가 발생했습니다.',
        confirmButtonColor: '#769fcd',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5" style={{ backgroundColor: 'var(--color-main)' }}>
      <div className="text-center flex flex-col items-center gap-10">
        <h1 className="text-5xl font-bold m-0" style={{ color: 'var(--color-background)' }}>월급관리소</h1>
        <button 
          className="bg-transparent border-0 p-0 cursor-pointer transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          onClick={handleKakaoLogin}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <img 
            src={kakaoLoginIcon} 
            alt="카카오 로그인"
            className="block w-full h-auto"
            style={{ pointerEvents: 'none' }}
            draggable={false}
          />
        </button>
        {/* 개발자 로그인 버튼 (개발 환경에서만 표시) */}
        {import.meta.env.DEV && (
          <button
            onClick={handleDevLogin}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 active:opacity-80"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-main)',
              border: '2px solid var(--color-background)',
              cursor: 'pointer',
            }}
          >
            개발자 로그인
          </button>
        )}
      </div>
    </div>
  );
}

