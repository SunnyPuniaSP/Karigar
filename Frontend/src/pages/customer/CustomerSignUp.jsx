import React from "react";
import { SignUpFormCustomer } from "../ui/SignUpFormCustomer";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCustomerDetails } from "@/store/customerAuthSlice";
import { toast } from "sonner";
const CustomerSignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleSubmit = (data) => {
    api
      .post("/api/v1/customer/register", data)
      .then(() => {
        const logindata = {
          email: data.email,
          password: data.password,
        };
        api
          .post("/api/v1/customer/login", logindata)
          .then((res) => {
            const { data } = res;
            dispatch(setCustomerDetails(data.data.customer));
            navigate("/customer/auth/home");
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
        <SignUpFormCustomer handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CustomerSignUp;
