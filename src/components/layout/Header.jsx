import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { MdNotificationsNone } from "react-icons/md";
import NotificationDropdown from "./NotificationDropdown.jsx";
import "../../styles/header.css";
import logoImage from "../../image/logo.png";

export default function Header() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Redux에서 사용자 정보 가져오기
  const authState = useSelector((state) => state.auth);
  const userName = authState.name;
  
  // 디버깅: Redux 상태 확인
  console.log('=== Redux auth 상태 ===');
  console.log('전체 auth state:', authState);
  console.log('userId:', authState.userId);
  console.log('name:', authState.name);
  console.log('userType:', authState.userType);
  console.log('accessToken:', authState.accessToken ? '있음' : '없음');
  console.log('workerCode:', authState.workerCode);
  console.log('kakaoPayLink:', authState.kakaoPayLink);
  console.log('========================');

  const toggleNotification = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
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
          </button>
          {isNotificationOpen && (
            <div ref={dropdownRef}>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={closeNotification}
              />
            </div>
          )}
        </div>
        <span>{userName || '사용자'} 님</span>
        <a href="#">로그아웃</a>
      </div>
    </header>
  );
}
