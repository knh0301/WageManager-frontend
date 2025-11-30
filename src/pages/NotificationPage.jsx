import React from "react";
import { MdMic, MdAttachFile } from "react-icons/md";
import "../styles/notificationPage.css";

export default function NotificationPage() {
  // 임시 알림 데이터 (나중에 API로 교체)
  const notifications = [
    {
      id: 1,
      type: "announcement",
      title: "시스템 프로그래밍[202502-CSE3209-002]",
      message: "새 공지사항이 등록되었습니다.",
      icon: MdMic,
    },
    {
      id: 2,
      type: "file",
      title: "시스템 프로그래밍[202502-CSE3209-002]",
      message: "새 파일이(가) 등록되었습니다.",
      icon: MdAttachFile,
    },
    {
      id: 3,
      type: "file",
      title: "시스템 프로그래밍[202502-CSE3209-002]",
      message: "새 파일이(가) 등록되었습니다.",
      icon: MdAttachFile,
    },
    {
      id: 4,
      type: "file",
      title: "이산구조[202502-CSE1312-005]",
      message: "새 파일이(가) 등록되었습니다.",
      icon: MdAttachFile,
    },
  ];

  return (
    <div className="notification-page">
      <div className="notification-page-container">
        <h1 className="notification-page-title">전체 알림</h1>
        <div className="notification-page-list">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} className="notification-page-item">
                <div className="notification-page-icon-wrapper">
                  <Icon className="notification-page-icon" />
                </div>
                <div className="notification-page-content">
                  <div className="notification-page-title-text">
                    {notification.title}
                  </div>
                  <div className="notification-page-message">
                    {notification.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

