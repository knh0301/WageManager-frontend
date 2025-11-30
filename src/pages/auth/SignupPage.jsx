import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { kakaoRegister } from '../../api/authApi';
import { setAuthToken } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';
import { FaUser, FaTimes } from 'react-icons/fa';
import './SignupPage.css';

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { kakaoAccessToken } = location.state || {};

  const [userType, setUserType] = useState('');

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

    try {
      const response = await kakaoRegister(kakaoAccessToken, userType);

      if (response.success && response.data.accessToken) {
        // accessToken을 localStorage에 저장
        localStorage.setItem('token', response.data.accessToken);
        
        // Redux에 저장
        dispatch(setAuthToken({
          accessToken: response.data.accessToken,
          name: response.data.name,
          userType: response.data.userType,
        }));

        Swal.fire({
          icon: 'success',
          title: '회원가입 완료!',
          text: '로그인되었습니다.',
          confirmButtonColor: '#769fcd',
        }).then(() => {
          // userType에 따라 리다이렉트
          if (response.data.userType === 'EMPLOYER') {
            navigate('/employer');
          } else {
            navigate('/worker');
          }
        });
      } else {
        throw new Error(response.error?.message || '회원가입 실패');
      }
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
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

