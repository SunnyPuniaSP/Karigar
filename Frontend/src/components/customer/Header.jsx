import React from 'react'
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const Header = () => {
  return (
    <nav>
      <div style={{ backgroundColor: "#0B1D3A" }} className=" text-white p-2 h-[60px] w-full flex items-center justify-between">
        <div>
          <img src={logo} alt="" className="h-[50px] w-[100px]" />
        </div>
        <div >
          <ul className="flex items-center gap-10">
            <li>
              <NavLink to="/customer/auth/home">Home</NavLink>
            </li>
            <li>
              <NavLink to="/customer/auth/my-requests">My Requests</NavLink>
            </li>
            <li>
              <NavLink to="/customer/auth/current-request">Live Request</NavLink>
            </li>
          </ul>
        </div>
        <div>
          <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src="https://placehold.co/1600x600"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Header