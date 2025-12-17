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

