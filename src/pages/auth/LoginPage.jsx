import kakaoLoginIcon from "../../assets/kakao_login_medium_wide.png";

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
  const handleKakaoLogin = () => {
    const kakaoAuthUrl = buildKakaoAuthUrl();
    if (kakaoAuthUrl) {
      window.location.href = kakaoAuthUrl;
    } else {
      console.error('카카오 로그인 설정 오류: 환경 변수가 설정되지 않았습니다.');
      alert('카카오 로그인 설정이 완료되지 않았습니다. 관리자에게 문의하세요.');
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
      </div>
    </div>
  );
}

