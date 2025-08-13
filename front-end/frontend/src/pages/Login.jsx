import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { register, login, forgotPassword } from "../services/api";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const navigate = useNavigate();
  const { checkAuthStatus } = useContext(ShopContext);

  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (currentState === "Sign Up") {
        const res = await register(formData);
        if (res.message) {
          toast.success("Registration successful! Please login.");
          setCurrentState("Login");
          setFormData({ name: "", email: "", password: "" });
        }
      } else {
        const res = await login({
          email: formData.email,
          password: formData.password,
        });
        if (res.message && res.token) {
          // Store the token in localStorage for API calls
          console.log("Login response received:", res);
          console.log("Token length:", res.token.length);
          localStorage.setItem("token", res.token);
          console.log("Token stored in localStorage");
          toast.success("Login successful!");
          // Wait for auth state to update before navigating
          await checkAuthStatus();
          // Add a small delay to ensure state is updated
          setTimeout(() => {
            navigate("/");
          }, 100);
        } else {
          console.error("Login response missing token:", res);
          toast.error("Login failed: No token received");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err.error || err.message || "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const res = await forgotPassword(forgotPasswordEmail);
      toast.success(res.message);
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMessage =
        err.error || err.message || "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mt-10 mb-2">
          <p className="text-3xl prata-regular">{currentState}</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        {currentState === "Login" ? (
          ""
        ) : (
          <input
            type="text"
            name="name"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={onChangeHandler}
          />
        )}
        <input
          type="email"
          name="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="hello@gmail.com"
          required
          value={formData.email}
          onChange={onChangeHandler}
        />
        <input
          type="password"
          name="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          required
          value={formData.password}
          onChange={onChangeHandler}
        />
        <div className="flex justify-between w-full text-sm mt-[-8px]">
          <p
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot your password?
          </p>
          {currentState === "Login" ? (
            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer hover:text-blue-600 transition-colors"
            >
              Create a new account
            </p>
          ) : (
            <p
              onClick={() => setCurrentState("Login")}
              className="cursor-pointer hover:text-blue-600 transition-colors"
            >
              Login here
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2 mt-4 font-light text-white bg-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {loading
            ? "Processing..."
            : currentState === "Login"
            ? "Sign In"
            : "Sign Up"}
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Forgot Password</h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
