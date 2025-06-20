import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Sign in to your account"
      subtitle={
        <>
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            create a new account
          </Link>
        </>
      }
      maxWidth="sm"
      centerContent
    >
      <FormContainer>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <ErrorMessage message={error} />
          
          <FormInput
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />

          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </FormContainer>
    </PageLayout>
  );
};

export default Login;
