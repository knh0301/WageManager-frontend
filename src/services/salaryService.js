import api from "./api";

const salaryService = {
  // 급여 목록 조회 (고용주)
  getSalaries: async (params) => {
    return await api.get("/employer/salaries", { params });
  },

  // 급여 상세 조회
  getSalary: async (id) => {
    return await api.get(`/employer/salaries/${id}`);
  },

  // 급여 계산
  calculateSalary: async (data) => {
    return await api.post("/employer/salaries/calculate", data);
  },
};

export default salaryService;
