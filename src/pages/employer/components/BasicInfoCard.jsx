import PropTypes from "prop-types";
import { FaUser } from "react-icons/fa";

export default function BasicInfoCard({ workerData, onDismiss }) {
  const basicInfo = workerData?.basicInfo ?? {};
  return (
    <div className="info-card">
      <div className="info-card-header">
        <h3 className="info-card-title">기본 정보</h3>
        <button type="button" className="dismiss-button" onClick={onDismiss}>
          퇴사
        </button>
      </div>
      <div className="info-card-content">
        <div className="basic-info-header">
          <div className="profile-icon">
            <FaUser />
          </div>
          <div>
            <div className="worker-name">{basicInfo.name ?? "-"}</div>
            <div className="worker-birthdate">
              {workerData.basicInfo.birthDate}
            </div>
          </div>
        </div>
        <div className="info-field-row">
          <div className="info-field">
            <label className="info-label">전화 번호</label>
            <div className="info-value">{basicInfo.phone ?? "-"}</div>
          </div>
          <div className="info-field">
            <label className="info-label">이메일</label>
            <div className="info-value">{basicInfo.email ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

BasicInfoCard.propTypes = {
  workerData: PropTypes.shape({
    basicInfo: PropTypes.shape({
      name: PropTypes.string.isRequired,
      birthDate: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
