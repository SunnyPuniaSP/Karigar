import React from "react";
import { LoginForm } from "../ui/LoginForm";
import axios from "axios";

const CustomerLogin = () => {
  const handleSubmit = (data) => {
    console.log("Sending data:", data);
    axios
      .post("/api/v1/customer/login", data)
      .then(() => {
        alert("Login successful! Welcome back.");
      })
      .catch((error) => {
        const message = error.data?.message || "Login failed. Please try again.";
        console.error("Registration failed:", error);
        alert(message);
      });
  };
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CustomerLogin;
