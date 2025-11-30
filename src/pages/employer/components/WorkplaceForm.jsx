import PropTypes from "prop-types";
import Swal from "sweetalert2";

export default function WorkplaceForm({
  title,
  formData,
  onFormDataChange,
  onCancel,
  onSave,
  cancelButtonText = "취소",
  saveButtonText = "저장",
  autoFocus = false,
}) {
  const validateForm = () => {
    if (!formData.name?.trim()) {
      Swal.fire("입력 오류", "근무지 이름을 입력해주세요.", "error");
      return false;
    }

    if (!formData.address?.trim()) {
      Swal.fire("입력 오류", "주소를 입력해주세요.", "error");
      return false;
    }

    if (!formData.businessNumber?.trim()) {
      Swal.fire("입력 오류", "사업자 등록 번호를 입력해주세요.", "error");
      return false;
    }

    // 사업자 등록 번호 형식 검증 (예: 123-45-67890)
    const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberPattern.test(formData.businessNumber.trim())) {
      Swal.fire(
        "입력 오류",
        "사업자 등록 번호 형식이 올바르지 않습니다. (예: 123-45-67890)",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const handleBusinessNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, "");
    // 자동으로 하이픈 추가 (123-45-67890 형식)
    let formatted = value.replace(/-/g, "");
    if (formatted.length > 3) {
      formatted = formatted.slice(0, 3) + "-" + formatted.slice(3);
    }
    if (formatted.length > 6) {
      formatted = formatted.slice(0, 6) + "-" + formatted.slice(6, 11);
    }
    onFormDataChange({
      ...formData,
      businessNumber: formatted,
    });
  };

  return (
    <div className="info-card">
      <div className="info-card-header">
        <h3 className="info-card-title">{title}</h3>
      </div>
      <div className="info-card-content">
        <div className="info-field">
          <label className="info-label">근무지 이름</label>
          <input
            type="text"
            className="info-input"
            placeholder="근무지 이름을 입력하세요"
            value={formData.name || ""}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                name: e.target.value,
              })
            }
            autoFocus={autoFocus}
          />
        </div>

        <div className="info-field">
          <label className="info-label">주소</label>
          <input
            type="text"
            className="info-input"
            placeholder="주소를 입력하세요"
            value={formData.address || ""}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                address: e.target.value,
              })
            }
          />
        </div>

        <div className="info-field">
          <label className="info-label">사업자 등록 번호</label>
          <input
            type="text"
            className="info-input"
            placeholder="123-45-67890"
            value={formData.businessNumber || ""}
            onChange={handleBusinessNumberChange}
            maxLength={12}
          />
        </div>

        <div className="toggle-row">
          <div className="toggle-item">
            <label className="toggle-label">5인 미만 사업장</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.isSmallBusiness || false}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    isSmallBusiness: e.target.checked,
                  })
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="add-worker-button-container">
          <button type="button" className="cancel-button" onClick={onCancel}>
            {cancelButtonText}
          </button>
          <button
            type="button"
            className="add-button-large"
            onClick={handleSave}
          >
            {saveButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

WorkplaceForm.propTypes = {
  title: PropTypes.string.isRequired,
  formData: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    businessNumber: PropTypes.string,
    isSmallBusiness: PropTypes.bool,
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  cancelButtonText: PropTypes.string,
  saveButtonText: PropTypes.string,
  autoFocus: PropTypes.bool,
};
