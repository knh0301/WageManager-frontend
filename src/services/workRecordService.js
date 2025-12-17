import api from "./api";

const workRecordService = {
  // 근무 기록 목록 조회
  getWorkRecords: async (workplaceId, startDate, endDate) => {
    return await api.get("/employer/work-records", {
      params: {
        workplaceId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
  },

  // 근무 기록 상세 조회
  getWorkRecord: async (id) => {
    return await api.get(`/employer/work-records/${id}`);
  },

  // 근무 기록 생성
  createWorkRecord: async (data) => {
    return await api.post("/employer/work-records", data);
  },

  // 근무 기록 수정
  updateWorkRecord: async (id, data) => {
    return await api.put(`/employer/work-records/${id}`, data);
  },

  // 근무 기록 삭제
  deleteWorkRecord: async (id) => {
    return await api.delete(`/employer/work-records/${id}`);
  },

  // 근무 기록 승인
  approveWorkRecord: async (id) => {
    return await api.put(`/employer/work-records/${id}/approve`);
  },

  // 근무 기록 거절
  rejectWorkRecord: async (id) => {
    return await api.put(`/employer/work-records/${id}/reject`);
  },

  // 근무 완료 처리
  completeWorkRecord: async (id) => {
    return await api.put(`/employer/work-records/${id}/complete`);
  },

  // 근무 기록 일괄 등록
  createWorkRecordsBatch: async (data) => {
    return await api.post("/employer/work-records/batch", data);
  },
};

export default workRecordService;
