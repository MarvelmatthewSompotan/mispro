import React from "react";
import Logo from "../molecules/logo/Logo";
import LoginForm from "../molecules/loginForm/LoginForm";
import group from "../../assets/image/Group.png";
import "../css/LoginPage.css";

const LoginPage = () => (
  <div className="login-page">
    <div className="login-left">
      <Logo />
      <LoginForm />
    </div>
    <div className="login-right">
      <img
        src={group}
        alt="Books Illustration"
        className="login-illustration"
      />
    </div>
  </div>
);

export default LoginPage;
