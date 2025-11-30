import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { registerUser, kakaoLoginWithToken } from '../../api/authApi';
import { setAuthToken, setUserDetails } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';
import { FaUser, FaTimes } from 'react-icons/fa';
import './SignupPage.css';

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { kakaoAccessToken } = location.state || {};

  const [userType, setUserType] = useState('');
  const [phone, setPhone] = useState('');
  const [kakaoId, setKakaoId] = useState(null);
  const [kakaoName, setKakaoName] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 디버깅: kakaoId 확인
  console.log('SignupPage - kakaoId:', kakaoId);

  // 카카오 액세스 토큰으로 카카오 ID 가져오기
  useEffect(() => {
    const fetchKakaoUserInfo = async () => {
      if (!kakaoAccessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${kakaoAccessToken}`,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        });

        const kakaoIdFromResponse = userResponse.data.id;
        const kakaoAccount = userResponse.data.kakao_account;
        const profile = kakaoAccount?.profile;
        const name = profile?.nickname;
        const profileImageUrlFromResponse = profile?.profile_image_url;
        
        console.log('카카오 ID:', kakaoIdFromResponse);
        console.log('카카오 이름:', name);
        console.log('카카오 프로필 이미지 URL:', profileImageUrlFromResponse);
        console.log('카카오 사용자 전체 데이터:', userResponse.data);
        
        setKakaoId(String(kakaoIdFromResponse));
        setKakaoName(name || '');
        setProfileImageUrl(profileImageUrlFromResponse || '');
      } catch (error) {
        console.error('카카오 사용자 정보 가져오기 실패:', error);
        Swal.fire({
          icon: 'error',
          title: '오류 발생',
          text: '카카오 사용자 정보를 가져오는데 실패했습니다.',
          confirmButtonColor: '#769fcd',
        }).then(() => {
          navigate('/');
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKakaoUserInfo();
  }, [kakaoAccessToken, navigate]);

  // 카카오 액세스 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!kakaoAccessToken) {
    Swal.fire({
      icon: 'error',
      title: '잘못된 접근입니다.',
      text: '로그인 페이지로 이동합니다.',
    }).then(() => {
      navigate('/');
    });
    return null;
  }

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="signup-container">
        <div className="signup-box">
          <div className="signup-content">
            <p>카카오 사용자 정보를 가져오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 전화번호 입력 핸들러 (숫자만 허용)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    if (value.length <= 11) { // 최대 11자리
      setPhone(value);
    }
  };

  // 회원가입 버튼 활성화 조건
  const isSignupButtonDisabled = !userType || !phone || phone.length < 10 || phone.length > 11;

  const handleSignup = async () => {
    if (!userType) {
      Swal.fire({
        icon: 'warning',
        title: '역할을 선택해주세요.',
        text: '고용주 또는 근로자 중 하나를 선택해야 합니다.',
        confirmButtonColor: '#769fcd',
      });
      return;
    }

    if (!phone || phone.length < 10 || phone.length > 11) {
      Swal.fire({
        icon: 'warning',
        title: '전화번호를 올바르게 입력해주세요.',
        text: '전화번호는 10자리 또는 11자리 숫자여야 합니다.',
        confirmButtonColor: '#769fcd',
      });
      return;
    }

    try {
      // 1. 회원 정보 등록
      const registerData = {
        kakaoId: kakaoId,
        name: kakaoName || '',
        phone: phone,
        userType: userType,
        profileImageUrl: profileImageUrl || '',
      };

      console.log('회원 정보 등록 요청 데이터:', registerData);
      const registerResponse = await registerUser(registerData);
      console.log('회원 정보 등록 응답:', registerResponse);

      if (!registerResponse.success || !registerResponse.data.userId) {
        throw new Error(registerResponse.error?.message || '회원 정보 등록 실패');
      }

      // 2. 회원가입 성공 후 로그인 처리
      console.log('카카오 로그인 요청 중...');
      const loginResponse = await kakaoLoginWithToken(kakaoAccessToken);
      console.log('카카오 로그인 응답:', loginResponse);

      if (!loginResponse.success || !loginResponse.data.accessToken) {
        throw new Error(loginResponse.error?.message || '로그인 실패');
      }

      // accessToken을 localStorage에 저장
      localStorage.setItem('token', loginResponse.data.accessToken);

      // Redux에 모든 정보 저장
      dispatch(setUserDetails({
        kakaoId: kakaoId,
        name: registerResponse.data.name || kakaoName,
        phone: phone,
        userType: registerResponse.data.userType,
        profileImageUrl: profileImageUrl || '',
        userId: registerResponse.data.userId,
        workerCode: registerResponse.data.workerCode,
      }));

      // accessToken도 Redux에 저장
      dispatch(setAuthToken({
        accessToken: loginResponse.data.accessToken,
        userId: registerResponse.data.userId,
        name: registerResponse.data.name || kakaoName,
        userType: registerResponse.data.userType,
      }));

      Swal.fire({
        icon: 'success',
        title: '회원가입 완료!',
        text: '로그인되었습니다.',
        confirmButtonColor: '#769fcd',
      }).then(() => {
        // userType에 따라 리다이렉트
        if (registerResponse.data.userType === 'EMPLOYER') {
          navigate('/employer');
        } else {
          navigate('/worker');
        }
      });
    } catch (error) {
      console.error('회원가입 에러:', error);
      Swal.fire({
        icon: 'error',
        title: '회원가입 실패',
        text: error.error?.message || error.message || '알 수 없는 오류가 발생했습니다.',
        confirmButtonColor: '#769fcd',
      }).then(() => {
        navigate('/');
      });
    }
  };

  return (
    <div className="signup-container">
      {/* 하얀색 박스 */}
      <div className="signup-box">
        {/* 헤더 - 회원가입 제목과 X 버튼 */}
        <div className="signup-header">
          <h2 className="signup-title">회원가입</h2>
          <button
            onClick={() => navigate('/')}
            className="close-button"
          >
            <FaTimes size={20} />
          </button>
        </div>
        {/* 내용 영역 */}
        <div className="signup-content">
          {/* 전화번호 입력 */}
          <div className="form-group">
            <label className="form-label">
              전화번호 <span className="required-star">*</span>
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={handlePhoneChange}
              placeholder="01012345678"
              maxLength={11}
              className="form-input"
            />
            {phone && (phone.length < 10 || phone.length > 11) && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                전화번호는 10자리 또는 11자리 숫자여야 합니다.
              </p>
            )}
          </div>
          {/* 역할 선택 */}
          <div className="form-group">
            <label className="form-label">
              역할 <span className="required-star">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="userType" 
                  value="WORKER"
                  checked={userType === 'WORKER'}
                  onChange={() => setUserType('WORKER')}
                  className="radio-input"
                />
                <span className="radio-text">근로자</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="userType" 
                  value="EMPLOYER"
                  checked={userType === 'EMPLOYER'}
                  onChange={() => setUserType('EMPLOYER')}
                  className="radio-input"
                />
                <span className="radio-text">고용주</span>
              </label>
            </div>
          </div>
          {/* 가입하기 버튼 */}
          <button
            onClick={handleSignup}
            className="submit-button"
            disabled={isSignupButtonDisabled}
            style={{
              opacity: isSignupButtonDisabled ? 0.5 : 1,
              cursor: isSignupButtonDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

