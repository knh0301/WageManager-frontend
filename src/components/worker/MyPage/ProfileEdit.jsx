import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "../../../pages/workers/WorkerMyPage.css";

export default function ProfileEdit({ user, onUserUpdate }) {
  const [editableSections, setEditableSections] = useState({
    basic: false,
    phone: false,
    kakaoPay: false,
  });
  const [localUser, setLocalUser] = useState(user);
  const [errors, setErrors] = useState({});

  // user prop이 변경될 때 localUser 동기화
  // 단, 사용자가 수정 중이 아닐 때만 동기화하여 입력 중인 데이터를 보호
  useEffect(() => {
    const isEditing = Object.values(editableSections).some((value) => value);
    if (!isEditing) {
      setLocalUser(user);
      setErrors({});
    }
  }, [user, editableSections]);

  const validateField = (section, value) => {
    if (!value || value.trim() === "") {
      return { isValid: false, message: "필수 입력 항목입니다." };
    }

    switch (section) {
      case "phone": {
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(value)) {
          return {
            isValid: false,
            message: "전화번호는 010-XXXX-XXXX 형식이어야 합니다.",
          };
        }
        break;
      }
      case "name": {
        if (value.trim().length < 2) {
          return { isValid: false, message: "이름은 2자 이상이어야 합니다." };
        }
        break;
      }
      default:
        break;
    }

    return { isValid: true, message: "" };
  };

  const toggleEdit = (section) => {
    const wasEditing = editableSections[section];

    if (wasEditing) {
      // 완료 버튼을 눌렀을 때 유효성 검사
      const fieldName =
        section === "kakaoPay"
          ? "kakaoPayLink"
          : section === "basic"
            ? "name"
            : section;
      const fieldValue = localUser[fieldName];

      // basic 섹션의 경우 이름만 검증
      if (section === "basic") {
        const validation = validateField("name", localUser.name);
        if (!validation.isValid) {
          setErrors({ basic: validation.message });
          return;
        }
      } else {
        const validation = validateField(section, fieldValue);
        if (!validation.isValid) {
          setErrors({ [section]: validation.message });
          return;
        }
      }

      // 유효성 검사 통과 시 에러 초기화 및 API 호출
      setErrors({});
      onUserUpdate(localUser, section);
    }

    setEditableSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

    // 수정 모드로 전환 시 해당 필드의 에러 초기화
    if (!wasEditing) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[section];
        delete newErrors.basic;
        return newErrors;
      });
    }
  };

  const handleChange = (field, value) => {
    setLocalUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 전화번호 입력 핸들러 (하이픈 자동 추가)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    
    // 하이픈 자동 추가: 010-1234-5678 형식
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    if (value.length <= 13) { // 최대 13자리 (하이픈 포함)
      handleChange("phone", value);
    }
  };

  // kakaoId를 그대로 출력 (형식 변환 없이)
  const formatKakaoId = (kakaoId) => {
    if (!kakaoId) return "";
    return String(kakaoId);
  };

  const getUserTypeText = (userType) => {
    if (!userType) return "";
    return userType === "EMPLOYER" ? "고용주" : "근로자";
  };

  return (
    <div className="worker-mypage-container">
      <h1 className="worker-mypage-title">기본 정보</h1>

      {/* 이름, 생년월일, 역할 */}
      <div className="worker-mypage-basic-info">
        <div className="worker-mypage-name-row">
          <div className="worker-mypage-name-text-wrapper">
            <div className="worker-mypage-name-text">{localUser.name || ""}</div>
            <div className="worker-mypage-birth-text">
              {formatKakaoId(localUser.birthDate)}
            </div>
            <div className="worker-mypage-gender-text">
              {getUserTypeText(localUser.userType)}
            </div>
          </div>
          <button
            className="worker-mypage-edit-button"
            onClick={() => toggleEdit("basic")}
          >
            {editableSections.basic ? "완료" : "수정"}
          </button>
        </div>
        {editableSections.basic && (
          <div className="worker-mypage-edit-fields">
            <div className="worker-mypage-name">
              <span className="worker-mypage-label">이름</span>
              <input
                type="text"
                value={localUser.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.basic ? "worker-mypage-input-error" : ""}
              />
              {errors.basic && (
                <span className="worker-mypage-error-message">
                  {errors.basic}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <hr />

      {/* 전화번호 */}
      <div className="worker-mypage-field">
        <span className="worker-mypage-label">전화 번호</span>
        <div className="worker-mypage-input-wrapper">
          <input
            type="tel"
            value={localUser.phone || ""}
            disabled={!editableSections.phone}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            maxLength={13}
            className={errors.phone ? "worker-mypage-input-error" : ""}
          />
          {errors.phone && (
            <span className="worker-mypage-error-message">{errors.phone}</span>
          )}
        </div>
        <button
          className="worker-mypage-edit-button"
          onClick={() => toggleEdit("phone")}
        >
          {editableSections.phone ? "완료" : "수정"}
        </button>
      </div>
      <hr />

      {/* 카카오페이 송금 링크 */}
      <div className="worker-mypage-field">
        <span className="worker-mypage-label">카카오페이 송금 링크</span>
        <input
          type="text"
          value={localUser.kakaoPayLink || ""}
          disabled={!editableSections.kakaoPay}
          onChange={(e) => handleChange("kakaoPayLink", e.target.value)}
        />
        <button
          className="worker-mypage-edit-button"
          onClick={() => toggleEdit("kakaoPay")}
        >
          {editableSections.kakaoPay ? "완료" : "수정"}
        </button>
      </div>
      <hr />

      {/* 근무자 코드 (읽기 전용) */}
      <div className="worker-mypage-field">
        <span className="worker-mypage-label">근무자 코드</span>
        <input
          type="text"
          value={localUser.employeeCode || ""}
          readOnly
          className="worker-mypage-readonly"
        />
      </div>
      <hr />

      {/* 계정 이용 */}
      <div className="worker-mypage-account-section">
        <h2 className="worker-mypage-section-title">계정 이용</h2>
        <a href="#" className="worker-mypage-link">
          서비스 이용 동의 <span className="worker-mypage-arrow">→</span>
        </a>
      </div>
      <hr />

      {/* 회원 탈퇴 */}
      <div className="worker-mypage-withdraw">
        <a href="#" className="worker-mypage-withdraw-link">
          회원 탈퇴 <span className="worker-mypage-arrow">→</span>
        </a>
      </div>
    </div>
  );
}

ProfileEdit.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    birthDate: PropTypes.string,
    userType: PropTypes.string,
    phone: PropTypes.string,
    kakaoPayLink: PropTypes.string,
    employeeCode: PropTypes.string,
    profileImageUrl: PropTypes.string,
  }).isRequired,
  onUserUpdate: PropTypes.func.isRequired,
};

