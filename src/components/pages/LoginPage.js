import React, { useEffect } from "react";
import Logo from "../atoms/logo/Logo";
import LoginForm from "../atoms/loginForm/LoginForm";
import group from "../../assets/Group.png";
import "../styles/LoginPage.css";

const LoginPage = () => {
  useEffect(() => {
    console.log("LoginPage mounted - URL:", window.location.pathname);
  }, []);

  return (
    <div className="login-page" style={{ backgroundColor: '#f0f8ff' }}>
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
};

export default LoginPage;
