import React, { useState } from "react";
import Input from "../../atoms/input/Input";
import Checkbox from "../../atoms/checkbox/Checkbox";
import Button from "../Button";
import Label from "../Label";
import "../../styles/LoginForm.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const LoginForm = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    staySignedIn: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        navigate("/home");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <Label htmlFor="email" className="login-title">
        Login to your account
      </Label>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <Input
        type="email"
        placeholder="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <div className="login-form-options">
        <Checkbox
          checked={form.staySignedIn}
          onChange={handleChange}
          name="staySignedIn"
          label="Stay signed in"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
