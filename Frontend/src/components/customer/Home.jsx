import React from "react";
import customerhomehero from "../../assets/customerhomehero.png";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate=useNavigate();
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
            <Button className="w-75" onClick={()=>navigate("/customer/auth/select-category")}>Book a Service</Button>
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
