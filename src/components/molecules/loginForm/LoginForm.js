import React, { useState } from "react";
import Input from "../../atoms/input/Input";
import Checkbox from "../../atoms/checkbox/Checkbox";
import Button from "../../atoms/button/Button";
import Label from "../../atoms/label/Label";
import "../../css/LoginForm.css";

const LoginForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    staySignedIn: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle login
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <Label htmlFor="username">Login to your account</Label>
      <Input
        type="text"
        placeholder="Username or Email"
        name="username"
        value={form.username}
        onChange={handleChange}
      />
      <Input
        type="password"
        placeholder="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
      />
      <div className="login-form-options">
        <Checkbox
          checked={form.staySignedIn}
          onChange={handleChange}
          name="staySignedIn"
          label="Stay signed in"
        />
      </div>
      <Button type="submit">Login</Button>
    </form>
  );
};

export default LoginForm;
