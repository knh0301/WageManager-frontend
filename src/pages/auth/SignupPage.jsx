import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import Swal from 'sweetalert2';
import { FaUser, FaTimes } from 'react-icons/fa';
import './SignupPage.css';

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { kakaoId, name, profileImageUrl } = location.state || {};

  const [userType, setUserType] = useState('');
  const [phone, setPhone] = useState('');

  // 카카오 정보가 없으면 로그인 페이지로 리다이렉트
  if (!kakaoId) {
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

    if (!phone) {
      Swal.fire({
        icon: 'warning',
        title: '전화번호를 입력해주세요.',
        confirmButtonColor: '#769fcd',
      });
      return;
    }

    try {
      const userData = {
        kakaoId: String(kakaoId),
        name: name || '이름 없음',
        phone,
        userType,
        profileImageUrl: profileImageUrl || '',
      };

      const response = await registerUser(userData);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: '회원가입 완료!',
          text: '로그인 페이지로 이동합니다.',
          confirmButtonColor: '#769fcd',
        }).then(() => {
          navigate('/');
        });
      } else {
        throw new Error(response.error?.message || '회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      Swal.fire({
        icon: 'error',
        title: '회원가입 실패',
        text: error.message || '알 수 없는 오류가 발생했습니다.',
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
          {/* 프로필 이미지 */}
          <div className="profile-image-container">
            <div className="profile-image-wrapper">
              <div className="profile-image">
                {profileImageUrl ? (
                  <img 
                    src={profileImageUrl} 
                    alt="Profile" 
                  />
                ) : (
                  <FaUser style={{ fontSize: '3rem', color: '#9ca3af' }} />
                )}
              </div>
            </div>
          </div>
          {/* 이름 */}
          <div className="form-group">
            <label className="form-label">
              이름 <span className="required-star">*</span>
            </label>
            <input 
              type="text" 
              value={name} 
              disabled 
              className="form-input"
            />
          </div>
          {/* 전화번호 */}
          <div className="form-group">
            <label className="form-label">
              전화번호 <span className="required-star">*</span>
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="form-input"
            />
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
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

