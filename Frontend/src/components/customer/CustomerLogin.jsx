import React from "react";
import { LoginFormCustomer } from "../ui/LoginFormCustomer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const handleSubmit = (data) => {
    console.log("Sending data:", data);
    axios
      .post("/api/v1/customer/login", data)
      .then(() => {
        navigate("/customer/auth/home");
      })
      .catch((error) => {
        const message =
          error.data?.message || "Login failed. Please try again.";
        console.error("Registration failed:", error);
        alert(message);
      });
  };
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginFormCustomer handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CustomerLogin;
