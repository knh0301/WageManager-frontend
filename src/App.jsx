import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuthToken } from "./features/auth/authSlice";
import LoginPage from "./pages/auth/LoginPage.jsx";
import WorkerLayout from "./layouts/WorkerLayout.jsx";
import EmployerLayout from "./layouts/EmployerLayout.jsx";
import WorkerMonthlyCalendarPage from "./pages/workers/WorkerMonthlyCalendarPage.jsx";
import WorkerWeeklyCalendarPage from "./pages/workers/WorkerWeeklyCalendarPage.jsx";
import WorkerRemittancePage from "./pages/workers/WorkerRemittancePage.jsx";
import WorkerMyPage from "./pages/workers/WorkerMyPage.jsx";
import DailyCalendarPage from "./pages/employer/DailyCalendarPage.jsx";
import RemittanceManagePage from "./pages/employer/RemittanceManagePage.jsx";
import WorkerManagePage from "./pages/employer/WorkerManagePage.jsx";
import EmployerMyPage from "./pages/employer/EmployerMyPage.jsx";
import EmployerMyPageReceive from "./pages/employer/EmployerMyPageReceive.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import KakaoRedirect from "./pages/auth/KakaoRedirect.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";

function App() {
  const dispatch = useDispatch();

  // 새로고침 시 localStorage의 정보를 Redux에 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const userType = localStorage.getItem('userType');

    if (token && userId && name && userType) {
      dispatch(setAuthToken({
        accessToken: token,
        userId: Number(userId),
        name: name,
        userType: userType,
      }));
    }
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth" element={<KakaoRedirect />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/worker" element={<WorkerLayout />}>
          <Route
            index
            element={<Navigate to="/worker/monthly-calendar" replace />}
          />
          <Route path="monthly-calendar" element={<WorkerMonthlyCalendarPage />} />
          <Route path="weekly-calendar" element={<WorkerWeeklyCalendarPage />} />
          <Route path="remittance" element={<WorkerRemittancePage />} />
          <Route path="mypage" element={<WorkerMyPage />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        <Route path="/employer" element={<EmployerLayout />}>
          <Route
            index
            element={<Navigate to="/employer/daily-calendar" replace />}
          />
          <Route path="daily-calendar" element={<DailyCalendarPage />} />
          <Route path="remittance-manage" element={<RemittanceManagePage />} />
          <Route path="worker-manage" element={<WorkerManagePage />} />
          <Route path="employer-mypage" element={<EmployerMyPage />} />
          <Route
            path="employer-mypage-receive"
            element={<EmployerMyPageReceive />}
          />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
