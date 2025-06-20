import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
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
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Create your account"
      subtitle={
        <>
          Or{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            sign in to your existing account
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
            label="Full Name"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

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
            autoComplete="new-password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <FormInput
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </FormContainer>
    </PageLayout>
  );
};

export default Register;
