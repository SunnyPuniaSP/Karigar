import React from "react";
import { SignUpFormWorker } from "../ui/SignUpFormWorker";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "../../store/workerAuthSlice";
import { toast } from "sonner";
const WorkerSignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = (data) => {
    api
      .post("/api/v1/worker/register", data)
      .then(() => {
        const logindata = {
          email: data.email,
          password: data.password,
        };
        api
          .post("/api/v1/worker/login", logindata)
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
          });
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred";
        toast(errorMessage, {
          duration: 3000,
          className: "bg-white border border-red-200 shadow",
        });
      });
  };
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpFormWorker handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default WorkerSignUp;
