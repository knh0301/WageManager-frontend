import kakaoLoginIcon from "../../assets/kakao_login_medium_wide.png";

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function LoginPage() {

  const buildKakaoAuthUrl = () => {
    const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  
    return `${baseUrl}?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
  };

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = buildKakaoAuthUrl();
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5" style={{ backgroundColor: 'var(--color-main)' }}>
      <div className="text-center flex flex-col items-center gap-10">
        <h1 className="text-5xl font-bold m-0" style={{ color: 'var(--color-background)' }}>월급관리소</h1>
        
        <button 
          className="bg-transparent border-0 p-0 cursor-pointer transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          onClick={handleKakaoLogin}
        >
          <img 
            src={kakaoLoginIcon} 
            alt="카카오 로그인"
            className="block w-full h-auto"
          />
        </button>
      </div>
    </div>
  );
}

