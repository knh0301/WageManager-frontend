import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { kakaoRegister } from '../../api/authApi';
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
  const [name, setName] = useState(''); // 이름 입력 필드 추가
  const [kakaoPayLink, setKakaoPayLink] = useState('');
  const [kakaoPayTouched, setKakaoPayTouched] = useState(false);
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
        // 카카오 이름 정보 가져오기 (우선순위: profile.nickname > kakao_account.name > properties.nickname)
        const kakaoNameFromResponse = profile?.nickname || kakaoAccount?.name || userResponse.data.properties?.nickname || '카카오사용자';
        const profileImageUrlFromResponse = profile?.profile_image_url;
        
        console.log('카카오 ID:', kakaoIdFromResponse);
        console.log('카카오 이름:', kakaoNameFromResponse);
        console.log('카카오 프로필 이미지 URL:', profileImageUrlFromResponse);
        console.log('카카오 사용자 전체 데이터:', userResponse.data);
        console.log('카카오 계정 정보:', kakaoAccount);
        console.log('카카오 프로필 정보:', profile);
        
        setKakaoId(String(kakaoIdFromResponse));
        setKakaoName(kakaoNameFromResponse || '카카오사용자');
        setProfileImageUrl(profileImageUrlFromResponse || '');
        // 카카오에서 가져온 이름을 기본값으로 설정 (사용자가 수정 가능)
        if (kakaoNameFromResponse) {
          setName(kakaoNameFromResponse);
        }
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

  // 전화번호 입력 핸들러 (하이픈 자동 추가)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    
    // 하이픈 자동 추가: 010-1234-5678 형식
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    if (value.length <= 13) { // 최대 13자리 (하이픈 포함)
      setPhone(value);
    }
  };

  // 전화번호 형식 검증 (하이픈 포함: 010-1234-5678)
  const isValidPhone = phone && /^01[0-9]-\d{4}-\d{4}$/.test(phone);
  
  // 이름 검증 (2자 이상, 한글/영문/숫자 허용)
  const isValidName = name && name.trim().length >= 2;
  
  // 카카오페이 링크 형식 검증 (https://qr.kakaopay.com/로 시작)
  const isValidKakaoPayLink = kakaoPayLink && /^https:\/\/qr\.kakaopay\.com\/.*$/.test(kakaoPayLink);
  
  // 회원가입 버튼 활성화 조건
  const isSignupButtonDisabled = !userType || !isValidPhone || !isValidName || !isValidKakaoPayLink;

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

    // 이름 검증
    if (!isValidName) {
      Swal.fire({
        icon: 'warning',
        title: '이름을 올바르게 입력해주세요.',
        text: '이름은 2자 이상 입력해주세요.',
        confirmButtonColor: '#769fcd',
      });
      return;
    }

    // 전화번호 형식 검증
    if (!isValidPhone) {
      Swal.fire({
        icon: 'warning',
        title: '전화번호를 올바르게 입력해주세요.',
        text: '전화번호는 010-1234-5678 형식으로 입력해주세요.',
        confirmButtonColor: '#769fcd',
      });
      return;
    }

    // 카카오페이 링크 형식 검증
    if (!isValidKakaoPayLink) {
      Swal.fire({
        icon: 'warning',
        title: '카카오페이 링크를 올바르게 입력해주세요.',
        text: '카카오페이 링크는 https://qr.kakaopay.com/로 시작해야 합니다.',
        confirmButtonColor: '#769fcd',
      });
      return;
    }

    try {
      // 카카오 회원가입 API 호출 (회원가입 + 로그인 동시 처리)
      console.log('카카오 회원가입 요청 중...');
      const registerResponse = await kakaoRegister(
        kakaoAccessToken,
        userType,
        phone,
        kakaoPayLink,
        profileImageUrl || ''
      );
      console.log('카카오 회원가입 응답:', registerResponse);

      if (!registerResponse.success || !registerResponse.data?.accessToken) {
        throw new Error(registerResponse.error?.message || '회원가입 실패');
      }

      // 액세스 토큰, userId 출력
      console.log('액세스 토큰:', registerResponse.data.accessToken);
      console.log('userId:', registerResponse.data.userId);
      console.log('userType:', registerResponse.data.userType);

      // localStorage에 모든 데이터 저장
      localStorage.setItem('token', registerResponse.data.accessToken);
      localStorage.setItem('userId', String(registerResponse.data.userId));
      localStorage.setItem('name', registerResponse.data.name || kakaoName || '');
      localStorage.setItem('userType', registerResponse.data.userType || '');

      // Redux에 모든 정보 저장
      dispatch(setAuthToken({
        accessToken: registerResponse.data.accessToken,
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
      
      // 에러 상태 코드 확인
      const statusCode = Number(error.response?.status) || Number(error.status) || 0;
      
      // 에러 유형에 따른 처리
      let errorTitle = '회원가입 실패';
      let shouldRedirect = false;
      let redirectPath = '/';
      
      if (statusCode === 0) {
        // 네트워크 오류: 현재 페이지 유지하여 재시도 가능하게
        errorTitle = '네트워크 오류';
        shouldRedirect = false;
      } else if (statusCode === 400 || statusCode === 409) {
        // 잘못된 요청이나 중복: 홈으로 리다이렉트
        shouldRedirect = true;
      } else if (statusCode >= 500) {
        // 서버 오류: 현재 페이지 유지하여 재시도 가능하게
        errorTitle = '서버 오류';
        shouldRedirect = false;
      }
      
      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: error.error?.message || error.message || '알 수 없는 오류가 발생했습니다.',
        confirmButtonColor: '#769fcd',
      }).then(() => {
        if (shouldRedirect) {
          navigate(redirectPath);
        }
        // shouldRedirect가 false면 현재 페이지 유지 (재시도 가능)
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
          {/* 이름 입력 */}
          <div className="form-group">
            <label className="form-label">
              이름 <span className="required-star">*</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              maxLength={20}
              className="form-input"
            />
            {name && !isValidName && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                이름은 2자 이상 입력해주세요.
              </p>
            )}
          </div>
          {/* 전화번호 입력 */}
          <div className="form-group">
            <label className="form-label">
              전화번호 <span className="required-star">*</span>
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              maxLength={13}
              className="form-input"
            />
            {phone && !isValidPhone && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                전화번호는 010-1234-5678 형식으로 입력해주세요.
              </p>
            )}
          </div>
          {/* 카카오페이 링크 입력 */}
          <div className="form-group">
            <label className="form-label">
              카카오페이 링크 <span className="required-star">*</span>
            </label>
            <input 
              type="url" 
              value={kakaoPayLink}
              onChange={(e) => {
                setKakaoPayLink(e.target.value);
                setKakaoPayTouched(true);
              }}
              onBlur={() => setKakaoPayTouched(true)}
              placeholder="https://qr.kakaopay.com/..."
              className="form-input"
            />
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              💡 카카오페이 앱에서 "송금" → "QR코드 보기" → 링크 복사
            </p>
            {kakaoPayTouched && kakaoPayLink && !isValidKakaoPayLink && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                카카오페이 링크는 https://qr.kakaopay.com/로 시작해야 합니다.
              </p>
            )}
            {kakaoPayTouched && !kakaoPayLink && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                카카오페이 링크를 입력해주세요.
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

