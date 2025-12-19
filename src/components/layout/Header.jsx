import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdNotificationsNone } from "react-icons/md";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { logout } from "../../api/authApi";
import { clearAuth } from "../../features/auth/authSlice";
import "../../styles/header.css";
import logoImage from "../../image/logo.png";

export default function Header() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux에서 사용자 정보 가져오기
  const authState = useSelector((state) => state.auth);
  const userName = authState.name;
  const accessToken = authState.accessToken || localStorage.getItem('token');

  const toggleNotification = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  const handleLogout = async () => {
    try {
      // 이미 정의된 accessToken 사용
      const response = await logout(accessToken);

      // 200 응답인 경우
      if (response.success && response.data) {
        // Redux 상태 초기화
        dispatch(clearAuth());

        // LocalStorage 초기화
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        localStorage.removeItem('userType');

        // 성공 메시지 표시
        toast.success('로그아웃이 완료되었습니다.');

        // 로그인 페이지로 이동
        navigate('/');
      } else {
        // success가 false인 경우에도 로컬 상태는 초기화
        dispatch(clearAuth());
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        localStorage.removeItem('userType');

        const errorMessage = response.error?.message || '로그아웃 처리 중 오류가 발생했습니다.';
        const errorCode = response.error?.code || 'UNKNOWN';
        toast.error(`[${errorCode}] ${errorMessage}`);
        navigate('/');
      }
    } catch (error) {
      // 400, 404, 500 등 에러 응답인 경우
      // 에러 메시지 표시 (에러 번호 포함)
      const errorMessage = error.error?.message || error.message || '로그아웃 처리 중 오류가 발생했습니다.';
      const errorCode = error.error?.code || error.errorCode || 'UNKNOWN';
      const statusCode = error.status || error.response?.status || '';
      const statusText = statusCode ? `[${statusCode}]` : '';

      toast.error(`${statusText} [${errorCode}] ${errorMessage}`);

      // 에러가 발생해도 로컬 상태는 초기화 (보안상 안전)
      dispatch(clearAuth());
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('userType');

      // 로그인 페이지로 이동
      navigate('/');
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        closeNotification();
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <header className="header-bar">
      <img src={logoImage} alt="월급 관리소" className="header-logo" />
      <div className="header-right">
        <div className="header-notification-wrapper" ref={notificationButtonRef}>
          <button
            className="header-icon"
            aria-label="알림"
            onClick={toggleNotification}
          >
            <MdNotificationsNone />
            {unreadCount > 0 && (
              <span className="header-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          {isNotificationOpen && (
            <div ref={dropdownRef}>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={closeNotification}
                onUnreadCountChange={handleUnreadCountChange}
              />
            </div>
          )}
        </div>
        <span>{userName || '사용자'} 님</span>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            textDecoration: 'underline'
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
