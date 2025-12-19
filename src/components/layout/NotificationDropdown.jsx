import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { MdNotificationsNone } from "react-icons/md";
import { getNotifications, markNotificationAsRead } from "../../api/notificationApi";
import "../../styles/notificationDropdown.css";

/**
 * 서버 시간 포맷을 한국어 형식으로 변환
 * @param {string} dateString - ISO 형식의 날짜 문자열 (예: 2025-12-18T00:40:37.565902)
 * @returns {string} 한국어 형식의 날짜 문자열 (예: 2025년 12월 18일 00:40)
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

export default function NotificationDropdown({ isOpen, onClose, onUnreadCountChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // 읽지 않은 알림들을 읽음 처리
  const markNotificationsAsRead = async (notificationsList) => {
    const unreadNotifications = notificationsList.filter((n) => !n.isRead);

    for (const notification of unreadNotifications) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        const errorMessage = error.error?.message || error.message || "알림 읽음 처리에 실패했습니다.";
        toast.error(errorMessage);
      }
    }

    // 읽음 처리 후 unreadCount 업데이트
    if (unreadNotifications.length > 0 && onUnreadCountChange) {
      const newUnreadCount = Math.max(0, unreadCount - unreadNotifications.length);
      setUnreadCount(newUnreadCount);
      onUnreadCountChange(newUnreadCount);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await getNotifications({ size: 4, page: 1 });

      if (response.success && response.data) {
        const { notifications: apiNotifications, unreadCount: apiUnreadCount } = response.data;

        // API 응답을 컴포넌트 형식으로 변환
        const formattedNotifications = apiNotifications.map((notification) => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          time: formatDateTime(notification.createdAt),
          icon: MdNotificationsNone,
          isRead: notification.isRead,
        }));

        setNotifications(formattedNotifications);
        setUnreadCount(apiUnreadCount);

        // 부모 컴포넌트에 unreadCount 전달
        if (onUnreadCountChange) {
          onUnreadCountChange(apiUnreadCount);
        }

        // 읽지 않은 알림들을 읽음 처리
        await markNotificationsAsRead(apiNotifications);
      }
    } catch (error) {
      // 에러 메시지 표시
      const errorMessage = error.error?.message || error.message || "알림을 불러오는데 실패했습니다.";
      toast.error(errorMessage);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = () => {
    onClose();
    // 현재 경로가 /worker 또는 /employer로 시작하는지 확인
    if (location.pathname.startsWith("/worker")) {
      navigate("/worker/notifications");
    } else if (location.pathname.startsWith("/employer")) {
      navigate("/employer/notifications");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3>전체 알림</h3>
          {unreadCount > 0 && (
            <span className="notification-unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="notification-list">
          {isLoading ? (
            <div className="notification-loading">
              <div className="notification-spinner"></div>
              <span>알림을 불러오는 중...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <span>알림이 없습니다.</span>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="notification-item">
                  <div className="notification-icon-wrapper">
                    <Icon className="notification-icon" />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                </div>
              );
            })
          )}
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

