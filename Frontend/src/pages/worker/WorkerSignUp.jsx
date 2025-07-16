import React from "react";
import { SignUpFormWorker } from "../ui/SignUpFormWorker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "../../store/workerAuthSlice";
const WorkerSignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = (data) => {
    axios
      .post("/api/v1/worker/register", data)
      .then(() => {
        const logindata = {
          email: data.email,
          password: data.password,
        };
        axios
          .post("/api/v1/worker/login", logindata)
          .then((res) => {
            const { data } = res;
            dispatch(setWorkerDetails(data.data.worker));
            navigate("/worker/auth/home");
          })
          .catch((err) => {
            console.log(
              "Registration successful but login failed. Please try logging in manually",
              err
            );
          });
      })
      .catch((err) => {
        console.log("Registration failed. Please try again", err);
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
