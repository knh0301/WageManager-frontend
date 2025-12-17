import httpClient from './httpClient';

// 사용자 프로필 조회
export const getUserProfile = async () => {
  try {
    const response = await httpClient.get('/api/users/me');
    return response;
  } catch (error) {
    console.error('[workerApi] getUserProfile 에러:', error);
    throw error;
  }
};

// 근로자 정보 조회
export const getWorkerInfo = async (userId) => {
  try {
    const response = await httpClient.get(`/api/workers/user/${userId}`);
    return response;
  } catch (error) {
    console.error('[workerApi] getWorkerInfo 에러:', error);
    throw error;
  }
};

// 사용자 프로필 수정
export const updateUserProfile = async (userData) => {
  try {
    const response = await httpClient.put('/api/users/me', userData);
    return response;
  } catch (error) {
    console.error('[workerApi] updateUserProfile 에러:', error);
    throw error;
  }
};

