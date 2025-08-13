import React, { useState } from "react";
import { LoginFormWorker } from "../ui/LoginFormWorker";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "../../store/workerAuthSlice";
import { toast } from "sonner";
import Loader from "../style/Loader.jsx";

const WorkerLogin = () => {
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleSubmit = (data) => {
    setLoader(true);
    api
      .post("/api/v1/worker/login", data)
      .then((res) => {
        const { data } = res;
        dispatch(setWorkerDetails(data.data.worker));
        navigate("/worker/auth/home");
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred";
        toast(errorMessage, {
          duration: 3000,
          className: "bg-white border border-red-200 shadow",
        });
      })
      .finally(() => {
        setLoader(false);
      });
  };
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginFormWorker handleSubmit={handleSubmit} />
      </div>
      {loader && <Loader />}
    </div>
  );
};

export default WorkerLogin;
