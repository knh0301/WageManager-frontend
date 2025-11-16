import "../../styles/employerMyPage.css";

export default function EmployerMyPage() {
  const user = {
    name: "김나현",
    birthDate: "2003-03-01",
    gender: "woman",
    phone: "010-1234-5678",
    email: "abc@gmail.com",
    password: "password123",
  };

  return (
    <div className="mypage-container">
      <h1 className="mypage-title">기본정보</h1>
      <div className="mypage-basic-info">
        <div className="mypage-name">
          <span className="mypage-label">이름</span>
          <input type="text" value={user.name} />
        </div>
        <div className="mypage-brith">
          <span className="mypage-label">생년월일</span>
          <input type="date" value={user.birthDate} />
        </div>
        <div className="mypage-gender">
          <span className="mypage-label">성별</span>
          <select name="gender" id="" value={user.gender}>
            <option value="man">남성</option>
            <option value="woman">여성</option>
          </select>
        </div>
        <button className="mypage-edit-button">수정</button>
      </div>
      <hr />
      <div className="mypage-phone">
        <span className="mypage-label">전화번호</span>
        <input type="tel" value={user.phone} />
        <button className="mypage-edit-button">수정</button>
      </div>
      <hr />
      <div className="mypage-email">
        <span className="mypage-label">이메일</span>
        <input type="email" value={user.email} />
        <button className="mypage-edit-button">수정</button>
      </div>
      <hr />
      <div className="mypage-password">
        <span className="mypage-label">비밀번호</span>
        <input type="password" value={user.password} />
        <button className="mypage-edit-button">수정</button>
      </div>
    </div>
  );
}
