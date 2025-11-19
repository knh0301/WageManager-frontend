import { useNavigate } from "react-router-dom";
import "../../styles/employerMyPage.css";

const mockRequests = [
  {
    id: 1,
    workerName: "박지민",
    requestedDate: "2025-11-20",
    shift: "오전 9시 - 오후 3시",
    status: "대기중",
  },
  {
    id: 2,
    workerName: "최도윤",
    requestedDate: "2025-11-22",
    shift: "오후 1시 - 오후 9시",
    status: "대기중",
  },
];

export default function EmployerMyPageReceive() {
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="mypage-main">
      <h1 className="mypage-main-heading">마이페이지 - 받은 근무 요청</h1>
      <div className="mypage-content">
        <nav className="mypage-nav">
          <div className="mypage-profile-card">
            <div className="mypage-avatar-wrapper">
              <div className="mypage-avatar-placeholder" />
            </div>
            <div className="mypage-profile-name">김나현</div>
            <hr />
          </div>
          <ul>
            <li>
              <button
                type="button"
                className="mypage-nav-li"
                onClick={() => handleNavClick("/employer/employer-mypage")}
              >
                내 프로필 수정
              </button>
            </li>
            <li>
              <button
                type="button"
                className="mypage-nav-checked"
                onClick={() =>
                  handleNavClick("/employer/employer-mypage-receive")
                }
              >
                받은 근무 요청
              </button>
            </li>
          </ul>
        </nav>
        <div className="mypage-container">
          <h1 className="mypage-title">받은 근무 요청</h1>
          <div className="mypage-receive-list">
            {mockRequests.length === 0 ? (
              <p>아직 받은 근무 요청이 없습니다.</p>
            ) : (
              mockRequests.map((request) => (
                <div key={request.id} className="mypage-receive-card">
                  <div>
                    <strong>근로자</strong>
                    <p>{request.workerName}</p>
                  </div>
                  <div>
                    <strong>요청일</strong>
                    <p>{request.requestedDate}</p>
                  </div>
                  <div>
                    <strong>근무시간</strong>
                    <p>{request.shift}</p>
                  </div>
                  <div>
                    <strong>상태</strong>
                    <p>{request.status}</p>
                  </div>
                  <div className="mypage-receive-actions">
                    <button type="button" className="mypage-edit-button">
                      승인
                    </button>
                    <button type="button" className="mypage-edit-button decline">
                      거절
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
