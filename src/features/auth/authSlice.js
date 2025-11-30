import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  workerCode: null,
  kakaoPayLink: null,
  accessToken: null,
  name: null,
  userType: null,
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
    clearAuth: (state) => {
      state.userId = null;
      state.workerCode = null;
      state.kakaoPayLink = null;
      state.accessToken = null;
      state.name = null;
      state.userType = null;
    },
  },
});

export const { setUserInfo, setAuthToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;

