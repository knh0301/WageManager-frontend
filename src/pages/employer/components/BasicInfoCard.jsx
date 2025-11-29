import { FaUser } from "react-icons/fa";

export default function BasicInfoCard({ workerData, onDismiss }) {
  return (
    <div className="info-card">
      <div className="info-card-header">
        <h3 className="info-card-title">기본 정보</h3>
        <button
          type="button"
          className="dismiss-button"
          onClick={onDismiss}
        >
          퇴사
        </button>
      </div>
      <div className="info-card-content">
        <div className="basic-info-header">
          <div className="profile-icon">
            <FaUser />
          </div>
          <div>
            <div className="worker-name">{workerData.basicInfo.name}</div>
            <div className="worker-birthdate">
              {workerData.basicInfo.birthDate}
            </div>
          </div>
        </div>
        <div className="info-field-row">
          <div className="info-field">
            <label className="info-label">전화 번호</label>
            <div className="info-value">{workerData.basicInfo.phone}</div>
          </div>
          <div className="info-field">
            <label className="info-label">이메일</label>
            <div className="info-value">{workerData.basicInfo.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}



