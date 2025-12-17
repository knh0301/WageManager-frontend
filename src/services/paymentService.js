import api from "./api";

const paymentService = {
  // 급여 송금 (고용주)
  createPayment: async (data) => {
    return await api.post("/employer/payments", data);
  },

  // 송금 내역 조회 (근로자)
  getPayments: async (params) => {
    return await api.get("/worker/payments", { params });
  },
};

export default paymentService;
