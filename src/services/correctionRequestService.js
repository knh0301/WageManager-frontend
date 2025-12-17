import api from "./api";

const correctionRequestService = {
  // 고용주 - 승인 대기중인 모든 요청 조회 (통합)
  getPendingApprovals: async (workplaceId, filter = "ALL") => {
    return await api.get(`/employer/workplaces/${workplaceId}/pending-approvals`, {
      params: { filter },
    });
  },

  // 고용주 - 정정 요청 목록 조회
  getEmployerRequests: async (params) => {
    return await api.get("/employer/correction-requests", { params });
  },

  // 고용주 - 정정 요청 상세 조회
  getEmployerRequest: async (id) => {
    return await api.get(`/employer/correction-requests/${id}`);
  },

  // 고용주 - 정정 요청 승인
  approveRequest: async (id) => {
    return await api.put(`/employer/correction-requests/${id}/approve`);
  },

  // 고용주 - 정정 요청 반려
  rejectRequest: async (id) => {
    return await api.put(`/employer/correction-requests/${id}/reject`);
  },

  // 근로자 - 정정 요청 생성
  createRequest: async (data) => {
    return await api.post("/worker/correction-requests", data);
  },

  // 근로자 - 내 정정 요청 목록 조회
  getWorkerRequests: async (params) => {
    return await api.get("/worker/correction-requests", { params });
  },

  // 근로자 - 내 정정 요청 상세 조회
  getWorkerRequest: async (id) => {
    return await api.get(`/worker/correction-requests/${id}`);
  },

  // 근로자 - 정정 요청 취소
  cancelRequest: async (id) => {
    return await api.delete(`/worker/correction-requests/${id}`);
  },
};

export default correctionRequestService;
