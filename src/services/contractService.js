import api from "./api";

const contractService = {
  // 사업장의 근로자 목록 조회
  getContractsByWorkplace: async (workplaceId) => {
    return await api.get(`/employer/workplaces/${workplaceId}/workers`);
  },

  // 계약 상세 조회
  getContract: async (id) => {
    return await api.get(`/employer/contracts/${id}`);
  },

  // 사업장에 근로자 추가 (계약 생성)
  createContract: async (workplaceId, data) => {
    return await api.post(`/employer/workplaces/${workplaceId}/workers`, data);
  },

  // 계약 수정
  updateContract: async (id, data) => {
    return await api.put(`/employer/contracts/${id}`, data);
  },

  // 계약 종료
  deleteContract: async (id) => {
    return await api.delete(`/employer/contracts/${id}`);
  },

  // 근무지별 근로자 이름 목록 조회 (간편 조회용)
  getWorkersByWorkplace: async (workplaceId) => {
    const contracts = await api.get(`/employer/workplaces/${workplaceId}/workers`);
    // 계약에서 근로자 이름 추출 (중복 제거)
    const workerNames = [...new Set(contracts.map(c => c.workerName))];
    return workerNames;
  },

  // 근로자 이름으로 contractId 조회
  getContractIdByWorkerName: async (workplaceId, workerName) => {
    const contracts = await api.get(`/employer/workplaces/${workplaceId}/workers`);
    const contract = contracts.find(c => c.workerName === workerName);
    return contract?.contractId || null;
  },
};

export default contractService;
