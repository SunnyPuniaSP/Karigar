import React from 'react'
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const LandingPageWorker = () => {
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
            <Button onClick={()=>{navigate("/worker/login")}}>Login</Button>
            <Button variant="secondary" onClick={()=>{navigate("/worker/sign-up")}} >Sign Up</Button>
        </div>
    </div>
  )
}

export default LandingPageWorker