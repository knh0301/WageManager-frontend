import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import Swal from 'sweetalert2';

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
      });
      return;
    }

    if (!phone) {
      Swal.fire({
        icon: 'warning',
        title: '전화번호를 입력해주세요.',
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
      }).then(() => {
        navigate('/');
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5" style={{ backgroundColor: 'var(--color-main)' }}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">회원가입</h2>
        
        <div className="mb-6 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input 
            type="text" 
            value={name} 
            disabled 
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
          />
        </div>

        <div className="mb-6 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-left">역할 선택</label>
          <div className="flex gap-4">
            <button
              onClick={() => setUserType('WORKER')}
              className={`flex-1 py-3 px-4 rounded-md border-2 transition-all ${
                userType === 'WORKER' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              근로자
            </button>
            <button
              onClick={() => setUserType('EMPLOYER')}
              className={`flex-1 py-3 px-4 rounded-md border-2 transition-all ${
                userType === 'EMPLOYER' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              고용주
            </button>
          </div>
        </div>

        <button
          onClick={handleSignup}
          className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-md transition-colors"
        >
          가입 완료
        </button>
      </div>
    </div>
  );
}

