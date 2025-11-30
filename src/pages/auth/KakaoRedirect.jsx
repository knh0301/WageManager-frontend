import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { checkKakaoUser } from '../../api/authApi';
import { completeKakaoLogin } from '../../features/auth/authThunks';
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
      console.log('액세스 토큰 획득 성공');

      // 2. 액세스 토큰으로 카카오 사용자 정보(ID) 요청
      setStatus('카카오 사용자 정보 요청 중...');
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      // 카카오에서 가져온 전체 사용자 데이터 출력
      console.log('=== 카카오 사용자 전체 데이터 ===');
      console.log(JSON.stringify(userResponse.data, null, 2));
      console.log('==============================');

      const kakaoId = userResponse.data.id;
      console.log('카카오 ID:', kakaoId);

      // 3. 백엔드 서버에 가입 여부 확인
      setStatus('서버에 회원 정보 확인 중...');
      try {
        const serverResponse = await checkKakaoUser(kakaoId);
        // 4-1. 기존 회원인 경우 (200 응답)
        if (serverResponse.success && serverResponse.data.userId) {
          console.log('기존 회원 확인됨:', serverResponse);
          try {
            // Redux thunk로 로그인 처리 (userId, workerCode, kakaoPayLink 저장 + dev/login 호출)
            const loginResult = await dispatch(completeKakaoLogin({
              userId: serverResponse.data.userId,
              workerCode: serverResponse.data.workerCode,
              kakaoPayLink: serverResponse.data.kakaoPayLink,
            })).unwrap();
            if (loginResult.success) {
              // userType에 따라 리다이렉트
              if (loginResult.userType === 'EMPLOYER') {
                navigate('/employer');
              } else {
                navigate('/worker');
              }
            }
          } catch (loginError) {
            // dev/login API 에러 처리 (400, 404, 500)
            console.error('로그인 API 에러:', loginError);            
            // 404 에러인 경우 -> 신규 회원으로 판단하여 회원가입 진행
            if (loginError.status === 404 || loginError.response?.status === 404 || loginError.message?.includes('404')) {
              console.log('dev/login에서 404 발생 - 신규 회원으로 판단됨:', loginError);
              
              // 회원가입 로직
              setStatus('신규 회원입니다. 회원가입을 진행합니다...');
              
              // 카카오 프로필 정보에서 닉네임 등 가져오기
              const kakaoAccount = userResponse.data.kakao_account;
              const profile = kakaoAccount?.profile;
              const name = profile?.nickname;
              const profileImageUrl = profile?.profile_image_url;
              
              console.log('=== 추출한 카카오 사용자 정보 ===');
              console.log('카카오 ID:', kakaoId);
              console.log('이름:', name);
              console.log('프로필 이미지 URL:', profileImageUrl);
              console.log('================================');
              
              // 회원가입 페이지로 이동하면서 카카오 정보 전달
              navigate('/signup', { 
                state: { 
                  kakaoId,
                  name,
                  profileImageUrl
                } 
              });
            } else {
              // 400, 500 등 다른 에러
              Swal.fire({
                icon: 'error',
                title: '로그인 실패',
                text: loginError.error?.message || loginError.message || '로그인 처리 중 오류가 발생했습니다.',
                confirmButtonColor: '#769fcd',
              }).then(() => {
                navigate('/');
              });
            }
          }
        } else {
          // 400 에러 등 (success는 true지만 data가 비어있음)
          throw new Error(serverResponse.error?.message || '잘못된 요청입니다.');
        }
      } catch (error) {
        // 4-2. 404 에러 등 발생 시 -> 신규 회원으로 판단하여 회원가입 진행
        if (error.status === 404 || error.response?.status === 404 || error.message?.includes('404')) {
          console.log('신규 회원으로 판단됨:', error);
          
          // 회원가입 로직
          setStatus('신규 회원입니다. 회원가입을 진행합니다...');
          
          // 카카오 프로필 정보에서 닉네임 등 가져오기
          const kakaoAccount = userResponse.data.kakao_account;
          const profile = kakaoAccount?.profile;
          const name = profile?.nickname;
          const profileImageUrl = profile?.profile_image_url;
          
          console.log('=== 추출한 카카오 사용자 정보 ===');
          console.log('카카오 ID:', kakaoId);
          console.log('이름:', name);
          console.log('프로필 이미지 URL:', profileImageUrl);
          console.log('카카오 계정 정보:', kakaoAccount);
          console.log('프로필 정보:', profile);
          console.log('================================');
          
          // 회원가입 페이지로 이동하면서 카카오 정보 전달
          navigate('/signup', { 
            state: { 
              kakaoId,
              name,
              profileImageUrl
            } 
          });
        } else {
          // 400, 500 등 다른 에러 또는 네트워크 에러
          console.error('서버 에러:', error);
          
          // 네트워크 에러인 경우 (status가 0)
          if (error.status === 0) {
            Swal.fire({
              icon: 'error',
              title: '서버 연결 실패',
              text: error.message || '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.',
              confirmButtonColor: '#769fcd',
            }).then(() => {
              navigate('/');
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: '오류 발생',
              text: error.response?.data?.error?.message || error.message || '서버 오류가 발생했습니다.',
              confirmButtonColor: '#769fcd',
            }).then(() => {
              navigate('/');
            });
          }
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
