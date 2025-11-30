import React from "react";
import { MdNotificationsNone } from "react-icons/md";
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
        <button className="header-icon" aria-label="알림">
          <MdNotificationsNone />
        </button>
        <span>{user.name} 님</span>
        <a href="#">로그아웃</a>
      </div>
    </header>
  );
}
