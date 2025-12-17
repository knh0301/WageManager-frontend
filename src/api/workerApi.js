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

// 계좌 정보 수정 (카카오페이 링크)
export const updateAccountInfo = async (accountData) => {
  try {
    const response = await httpClient.put('/api/users/me/account', accountData);
    return response;
  } catch (error) {
    console.error('[workerApi] updateAccountInfo 에러:', error);
    throw error;
  }
};

// 근로자 계약 목록 조회
export const getContracts = async () => {
  try {
    const response = await httpClient.get('/api/worker/contracts');
    return response;
  } catch (error) {
    console.error('[workerApi] getContracts 에러:', error);
    throw error;
  }
};

// 근로자 계약 상세 정보 조회
export const getContractDetail = async (contractId) => {
  try {
    const response = await httpClient.get(`/api/worker/contracts/${contractId}`);
    return response;
  } catch (error) {
    console.error('[workerApi] getContractDetail 에러:', error);
    throw error;
  }
};

// 정정 요청 목록 조회
export const getCorrectionRequests = async () => {
  try {
    const response = await httpClient.get('/api/worker/correction-requests');
    return response;
  } catch (error) {
    console.error('[workerApi] getCorrectionRequests 에러:', error);
    throw error;
  }
};

