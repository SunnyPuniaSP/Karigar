import React from "react";
import { LoginFormWorker } from "../ui/LoginFormWorker";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "../../store/workerAuthSlice";
const WorkerLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleSubmit = (data) => {
    api
      .post("/api/v1/worker/login", data)
      .then((res) => {
        const { data } = res;
        dispatch(setWorkerDetails(data.data.worker));
        navigate("/worker/auth/home");
      })
      .catch((err) => {
        console.log("Something went wrong. Please try again", err);
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

export default WorkerLogin;
