import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../features/auth/authSlice";
import { FaCamera, FaUser } from "react-icons/fa";
import "../../styles/employerMyPage.css";
import Swal from "sweetalert2";
import userService from "../../services/userService";

export default function EmployerMyPage() {
  const [user, setUser] = useState(null);
  const [editableSections, setEditableSections] = useState({
    name: false,
    phone: false,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 초기 데이터 로드
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getMyInfo();
        setUser(data);
        setProfileImage(data.profileImageUrl);
      } catch (error) {
        Swal.fire("오류", "사용자 정보를 불러오는데 실패했습니다.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleEdit = async (section) => {
    const isCurrentlyEditing = editableSections[section];

    // 완료 버튼을 눌렀을 때 (저장)
    if (isCurrentlyEditing) {
      try {
        const updateData = {};
        if (section === "name") {
          updateData.name = user.name;
        } else if (section === "phone") {
          // 전화번호 형식 검증
          const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
          if (!phoneRegex.test(user.phone)) {
            Swal.fire("입력 오류", "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)", "error");
            return;
          }
          updateData.phone = user.phone;
        }

        await userService.updateMyInfo(updateData);
        Swal.fire("저장 완료", "정보가 수정되었습니다.", "success");
      } catch (error) {
        Swal.fire("수정 실패", error.message || "정보 수정 중 오류가 발생했습니다.", "error");
        return;
      }
    }

    setEditableSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (field, value) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 업로드 로직 (실제로는 서버에 업로드 후 URL 받아야 함)
    // 현재는 로컬 URL만 생성
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);

    // TODO: 실제 서버에 이미지 업로드 후 profileImageUrl 업데이트
    // const formData = new FormData();
    // formData.append("image", file);
    // const uploadedUrl = await uploadImage(formData);
    // await userService.updateMyInfo({ profileImageUrl: uploadedUrl });
  };

  const handleWithdraw = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "회원 탈퇴 하시겠습니까?",
      text: "탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.",
      showCancelButton: true,
      confirmButtonText: "탈퇴",
      cancelButtonText: "취소",
      confirmButtonColor: "var(--color-red)",
    });

    if (result.isConfirmed) {
      try {
        await userService.deleteMyAccount();

        Swal.fire("탈퇴 완료", "회원 탈퇴가 완료되었습니다.", "success");

        // 로그아웃 처리
        dispatch(clearAuth());
        localStorage.clear();
        navigate("/");
      } catch (error) {
        Swal.fire("탈퇴 실패", error.message || "회원 탈퇴 중 오류가 발생했습니다.", "error");
      }
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="mypage-main">
        <div className="mypage-content">
          <div>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mypage-main">
        <div className="mypage-content">
          <div>사용자 정보를 불러올 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-main">
      <div className="mypage-content">
        <nav className="mypage-nav">
          <div className="mypage-profile-card">
            <div className="mypage-avatar-wrapper">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필"
                  className="mypage-avatar-image"
                />
              ) : (
                <div className="mypage-avatar-placeholder">
                  <FaUser />
                </div>
              )}
              <label className="mypage-avatar-camera">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </label>
            </div>
            <div className="mypage-profile-name">{user.name}</div>
            <hr />
          </div>
          <ul>
            <li>
              <button
                type="button"
                className="mypage-nav-checked"
                onClick={() => handleNavClick("/employer/employer-mypage")}
              >
                내 프로필 수정
              </button>
            </li>
            <li>
              <button
                type="button"
                className="mypage-nav-li"
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
          <h1 className="mypage-title">기본정보</h1>
          <div className="mypage-basic-info">
            <div className="mypage-name">
              <span className="mypage-label">이름</span>
              <input
                type="text"
                value={user.name || ""}
                disabled={!editableSections.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <button
              className="mypage-edit-button"
              onClick={() => toggleEdit("name")}
            >
              {editableSections.name ? "완료" : "수정"}
            </button>
          </div>
          <hr />
          <div className="mypage-phone">
            <span className="mypage-label">전화번호</span>
            <input
              type="tel"
              value={user.phone || ""}
              disabled={!editableSections.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="010-1234-5678"
            />
            <button
              className="mypage-edit-button"
              onClick={() => toggleEdit("phone")}
            >
              {editableSections.phone ? "완료" : "수정"}
            </button>
          </div>
          <div className="mypage-withdraw-section">
            <button
              className="mypage-withdraw-button"
              onClick={handleWithdraw}
            >
              회원 탈퇴 &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
