import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { register, login } from "../services/api";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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

  return (
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
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create a new account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login here
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-8 py-2 mt-4 font-light text-white bg-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Processing..."
          : currentState === "Login"
          ? "Sign In"
          : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
