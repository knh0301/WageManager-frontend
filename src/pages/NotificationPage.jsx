import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdNotificationsNone } from "react-icons/md";
import { getNotifications, markAllNotificationsAsRead } from "../api/notificationApi";
import "../styles/notificationPage.css";

/**
 * 서버 시간 포맷을 한국어 형식으로 변환
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} 한국어 형식의 날짜 문자열
 */
const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // 전체 알림 조회 (size를 크게 설정)
      const response = await getNotifications({ size: 100, page: 1 });

      if (response.success && response.data) {
        const { notifications: apiNotifications } = response.data;

        // API 응답을 컴포넌트 형식으로 변환
        const formattedNotifications = apiNotifications.map((notification) => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          time: formatDateTime(notification.createdAt),
          icon: MdNotificationsNone,
        }));

        setNotifications(formattedNotifications);

        // 전체 알림 읽음 처리
        await markAllAsRead();
      }
    } catch (error) {
      const errorMessage = error.error?.message || error.message || "알림을 불러오는데 실패했습니다.";
      toast.error(errorMessage);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      const errorMessage = error.error?.message || error.message || "알림 읽음 처리에 실패했습니다.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="notification-page">
      <div className="notification-page-container">
        <h1 className="notification-page-title">전체 알림</h1>
        <div className="notification-page-list">
          {isLoading ? (
            <div className="notification-page-loading">
              <div className="notification-page-spinner"></div>
              <span>알림을 불러오는 중...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-page-empty">
              <span>알림이 없습니다.</span>
            </div>
          ) : (
            notifications.map((notification) => {
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
                    <div className="notification-page-time">
                      {notification.time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
