import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdMic, MdAttachFile } from "react-icons/md";
import "../../styles/notificationDropdown.css";

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewAll = () => {
    onClose();
    // 현재 경로가 /worker 또는 /employer로 시작하는지 확인
    if (location.pathname.startsWith("/worker")) {
      navigate("/worker/notifications");
    } else if (location.pathname.startsWith("/employer")) {
      navigate("/employer/notifications");
    }
  };
  // 임시 알림 데이터 (나중에 API로 교체)
  const notifications = [
    {
      id: 1,
      type: "announcement",
      title: "시스템 프로그래밍[202502-CSE3209-002]",
      message: "새 공지사항이 등록되었습니다.",
      time: "20분전",
      icon: MdMic,
    },
    {
      id: 2,
      type: "file",
      title: "시스템 프로그래밍[202502-CSE3209-002]",
      message: "새 파일이(가) 등록되었습니다.",
      time: "42분전",
      icon: MdAttachFile,
    },
    {
      id: 3,
      type: "file",
      title: "시스템 프로그래밍[202502-CSE3209-002]",
      message: "새 파일이(가) 등록되었습니다.",
      time: "42분전",
      icon: MdAttachFile,
    },
    {
      id: 4,
      type: "file",
      title: "이산구조[202502-CSE1312-005]",
      message: "새 파일이(가) 등록되었습니다.",
      time: "2일전",
      icon: MdAttachFile,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3>전체 알림</h3>
        </div>
        <div className="notification-list">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} className="notification-item">
                <div className="notification-icon-wrapper">
                  <Icon className="notification-icon" />
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">{notification.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="notification-footer">
          <button
            className="notification-view-all-btn"
            onClick={handleViewAll}
          >
            모두 보기
          </button>
        </div>
      </div>
    </>
  );
}

