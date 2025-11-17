import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/employerMyPage.css";

export default function EmployerMyPage() {
  const initialUser = {
    name: "김나현",
    birthDate: "2003-03-01",
    gender: "woman",
    phone: "010-1234-5678",
    email: "abc@gmail.com",
    password: "password123",
  };

  const [user, setUser] = useState(initialUser);
  const [editableSections, setEditableSections] = useState({
    basic: false,
    phone: false,
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const toggleEdit = (section) => {
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

  return (
    <div className="mypage-container">
      <h1 className="mypage-title">기본정보</h1>
      <div className="mypage-basic-info">
        <div className="mypage-name">
          <span className="mypage-label">이름</span>
          <input
            type="text"
            value={user.name}
            disabled={!editableSections.basic}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div className="mypage-brith">
          <span className="mypage-label">생년월일</span>
          <input
            type="date"
            value={user.birthDate}
            disabled={!editableSections.basic}
            onChange={(e) => handleChange("birthDate", e.target.value)}
          />
        </div>
        <div className="mypage-gender">
          <span className="mypage-label">성별</span>
          <select
            name="gender"
            value={user.gender}
            disabled={!editableSections.basic}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="man">남성</option>
            <option value="woman">여성</option>
          </select>
        </div>
        <button
          className="mypage-edit-button"
          onClick={() => toggleEdit("basic")}
        >
          {editableSections.basic ? "완료" : "수정"}
        </button>
      </div>
      <hr />
      <div className="mypage-phone">
        <span className="mypage-label">전화번호</span>
        <input
          type="tel"
          value={user.phone}
          disabled={!editableSections.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <button
          className="mypage-edit-button"
          onClick={() => toggleEdit("phone")}
        >
          {editableSections.phone ? "완료" : "수정"}
        </button>
      </div>
      <hr />
      <div className="mypage-email">
        <span className="mypage-label">이메일</span>
        <input
          type="email"
          value={user.email}
          disabled={!editableSections.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <button
          className="mypage-edit-button"
          onClick={() => toggleEdit("email")}
        >
          {editableSections.email ? "완료" : "수정"}
        </button>
      </div>
      <hr />
      <div className="mypage-password">
        <span className="mypage-label">비밀번호</span>
        <div className="mypage-password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={user.password}
            disabled={!editableSections.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          <button
            type="button"
            className="mypage-view-button"
            onMouseEnter={() => setShowPassword(true)}
            onMouseLeave={() => setShowPassword(false)}
            onFocus={() => setShowPassword(true)}
            onBlur={() => setShowPassword(false)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          className="mypage-edit-button"
          onClick={() => toggleEdit("password")}
        >
          {editableSections.password ? "완료" : "수정"}
        </button>
      </div>
    </div>
  );
}
