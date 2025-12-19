import httpClient from './httpClient';

/**
 * 알림 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.size - 페이지 크기 (기본값: 4)
 * @param {number} params.page - 페이지 번호 (기본값: 1)
 * @returns {Promise<Object>} 알림 목록 응답
 */
export const getNotifications = async ({ size = 4, page = 1 } = {}) => {
  const queryParams = new URLSearchParams({
    size: size.toString(),
    page: page.toString(),
  });

  const response = await httpClient.get(`/api/notifications?${queryParams}`);
  return response;
};

/**
 * 알림 읽음 처리
 * @param {number} id - 알림 ID
 * @returns {Promise<Object>} 읽음 처리 응답
 */
export const markNotificationAsRead = async (id) => {
  const response = await httpClient.put(`/api/notifications/${id}/read`);
  return response;
};

/**
 * 전체 알림 읽음 처리
 * @returns {Promise<Object>} 읽음 처리 응답
 */
export const markAllNotificationsAsRead = async () => {
  const response = await httpClient.put('/api/notifications/read-all');
  return response;
};

