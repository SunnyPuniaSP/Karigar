import React from "react";
import { SignUpFormWorker } from "../ui/SignUpFormWorker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "../../store/workerAuthSlice";
const WorkerSignUp = () => {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const handleSubmit = (data) => {
      console.log("Sending data:", data);
      axios.post("/api/v1/worker/register",data)
      .then(() => {
        const logindata={
          email: data.email,
          password: data.password
        }
        axios.post("/api/v1/worker/login", logindata)
        .then((res) => {
          

          const { data } = res;
          console.log("inside login then after worker registration", data.data.worker)
                          dispatch(setWorkerDetails(data.data.worker));
                          navigate("/worker/auth/home");
        })
        .catch((error) => {
          console.error("Login failed:", error);
          alert("Registration successful but login failed. Please try logging in manually.");
        });
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
      });
    }
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpFormWorker handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default WorkerSignUp;
