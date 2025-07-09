import React from "react";
import { LoginFormWorker } from "../ui/LoginFormWorker";
import axios from "axios";
const workerLogin = () => {
  const handleSubmit = (data) => {
    console.log("Sending data:", data);
    axios
      .post("/api/v1/worker/login", data)
      .then(() => {
        alert("Login successful! Welcome back.");
      })
      .catch((error) => {
        const errorMsg =
          error?.response?.data?.message ||
          "Something went wrong. Please try again.";
        alert(errorMsg);
      });
  };
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginFormWorker handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default workerLogin;
