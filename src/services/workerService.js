import api from "./api";

const workerService = {
  // 근로자 코드로 조회
  getWorkerByCode: async (workerCode) => {
    return await api.get(`/workers/code/${workerCode}`);
  },

  // 근로자 ID로 조회
  getWorkerById: async (workerId) => {
    return await api.get(`/workers/${workerId}`);
  },

  // 사용자 ID로 근로자 조회
  getWorkerByUserId: async (userId) => {
    return await api.get(`/workers/user/${userId}`);
  },

  // 근로자 정보 수정
  updateWorker: async (workerId, data) => {
    return await api.put(`/workers/${workerId}`, data);
  },
};

export default workerService;
