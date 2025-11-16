import React from "react";
import "../../styles/header.css";
import logoImage from "../../image/logo.png";

export default function Header() {
  const user = {
    name: "김나현",
  };

  return (
    <header className="header-bar">
      <img src={logoImage} alt="월급 관리소" className="header-logo" />
      <div>
        <span>{user.name} 님</span>
        <a href="#">로그아웃</a>
      </div>
    </header>
  );
}
