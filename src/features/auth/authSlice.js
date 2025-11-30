import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  workerCode: null,
  kakaoPayLink: null,
  accessToken: null,
  name: null,
  userType: null,
  kakaoId: null,
  phone: null,
  profileImageUrl: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userId = action.payload.userId;
      state.workerCode = action.payload.workerCode;
      state.kakaoPayLink = action.payload.kakaoPayLink;
    },
    setAuthToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.name = action.payload.name;
      state.userType = action.payload.userType;
    },
    setUserDetails: (state, action) => {
      state.kakaoId = action.payload.kakaoId;
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.userType = action.payload.userType;
      state.profileImageUrl = action.payload.profileImageUrl;
      state.userId = action.payload.userId;
      state.workerCode = action.payload.workerCode;
    },
    clearAuth: (state) => {
      state.userId = null;
      state.workerCode = null;
      state.kakaoPayLink = null;
      state.accessToken = null;
      state.name = null;
      state.userType = null;
      state.kakaoId = null;
      state.phone = null;
      state.profileImageUrl = null;
    },
  },
});

export const { setUserInfo, setAuthToken, setUserDetails, clearAuth } = authSlice.actions;
export default authSlice.reducer;

