import api from "./api";

const userService = {
  // 내 정보 조회
  getMyInfo: async () => {
    return await api.get("/users/me");
  },

  // 내 정보 수정
  updateMyInfo: async (data) => {
    return await api.put("/users/me", data);
  },

  // 회원 탈퇴 (DELETE /api/users/me 엔드포인트가 있다고 가정)
  deleteMyAccount: async () => {
    return await api.delete("/users/me");
  },
};

export default userService;
