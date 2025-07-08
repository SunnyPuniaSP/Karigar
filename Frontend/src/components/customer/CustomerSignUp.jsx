import React from "react";
import { SignUpFormCustomer } from "../ui/SignUpFormCustomer";
import axios from "axios";
const CustomerSignUp = () => {
  const handleSubmit = (data) => {
    console.log("Sending data:", data);
    axios.post("/api/v1/customer/register",data)
    .then(() => {
      alert("Registration successful! Please login.");
    })
    .catch((error) => {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    });
  }
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpFormCustomer handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CustomerSignUp;
