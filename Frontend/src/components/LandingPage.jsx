import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
  return (
    <div>
      <div
        style={{
          backgroundImage: 'url("https://placehold.co/1600x600")',
          width: "100%",
          height: "600px",
        }}
        className="flex items-center gap-5 justify-center bg-cover bg-center"
      >
        <Button onClick={()=>{navigate("/customer")}} >I am Customer</Button>
        <Button variant="secondary" onClick={()=>{navigate("/worker")}}>I am Worker</Button>
      </div>
    </div>
  );
};

export default LandingPage;
