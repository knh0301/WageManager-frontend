import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../styles/addWorkplacePage.css";

export default function AddWorkplacePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    businessNumber: "",
  });
  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 사업자 등록 번호가 변경되면 인증 상태 초기화
    if (name === "businessNumber") {
      setIsVerified(false);
    }
  };

  const handleVerify = () => {
    if (!formData.businessNumber.trim()) {
      Swal.fire("입력 오류", "사업자 등록 번호를 입력해주세요.", "warning");
      return;
    }
    // TODO: 실제 사업자 등록 번호 검증 API 연동
    setIsVerified(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.companyName.trim()) {
      Swal.fire("입력 오류", "근무지 이름을 입력해주세요.", "warning");
      return;
    }

    if (!formData.address.trim()) {
      Swal.fire("입력 오류", "근무지 주소를 입력해주세요.", "warning");
      return;
    }

    if (!formData.businessNumber.trim()) {
      Swal.fire("입력 오류", "사업자 등록 번호를 입력해주세요.", "warning");
      return;
    }

    // TODO: 백엔드 API 연동

    Swal.fire({
      title: "추가 완료",
      text: "근무지가 성공적으로 추가되었습니다.",
      icon: "success",
    }).then(() => {
      navigate("/employer/worker-manage");
    });
  };

  return (
    <div className="add-workplace-page">
      <div className="add-workplace-container">
        <h1 className="add-workplace-title">근무지 추가</h1>

        <form onSubmit={handleSubmit} className="add-workplace-form">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">근무지 이름</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="form-input"
                placeholder=""
              />
            </div>

            <div className="form-group">
              <label className="form-label">근무지 주소</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder=""
              />
            </div>

            <div className="form-group">
              <label className="form-label">사업자 등록 번호</label>
              <div className="business-number-group">
                <input
                  type="text"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder=""
                />
                <button type="button" className="verify-button" onClick={handleVerify}>
                  검색
                </button>
              </div>
              {isVerified && <p className="form-note">✓ 확인되었습니다.</p>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
