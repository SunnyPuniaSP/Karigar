import React from "react";
import customerhomehero from "../../assets/customerhomehero.png";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"
import { useSelector } from "react-redux";
const Home = () => {
  const navigate=useNavigate();
  const {liveServiceId,isLiveRequest}=useSelector((state)=>state.customerAuth)
  const bookService=()=>{
    if(isLiveRequest){
      toast("You already have an ongoing request", {
        description: (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Please complete your current request before creating a new one.
            </p>
            <Button
              onClick={() => navigate(`/customer/auth/service-request/${liveServiceId}`)}
              className="px-3 py-1 text-sm font-mediumrounded-md transition"
            >
              Track
            </Button>
          </div>
        ),
        duration: 6000,
        className: "bg-white shadow-lg border border-gray-200",
      });
    }
    else{
      navigate("/customer/auth/select-category")
    }
  }
  return (
    <div>
      <div className="flex justify-center items-center p-5 gap-5">
        <div className="w-1/2 flex flex-col gap-5">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="text-blue-600">[Name]</span>!
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Find skilled, verified technicians for all your home service
            needs—fast, secure, and hassle-free.
          </p>

          <div className="display flex gap-5">
            <Button className="w-75" onClick={bookService}>Book a Service</Button>
            <Button variant="secondary" className="w-75">
              Track Current Request
            </Button>
          </div>
        </div>
        <div className="w-1/2">
          <img
            className="rounded-xl"
            src={customerhomehero}
            alt="customerhomehero"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
