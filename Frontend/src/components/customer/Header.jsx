import React from 'react'
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Button } from '../ui/button';
import {useDispatch} from "react-redux"
import { clearCustomerDetails } from '../../store/customerAuthSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from "sonner"

const Header = () => {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const {liveServiceId,isLiveRequest}=useSelector((state)=>state.customerAuth)
  const profilePhoto=useSelector(state=>state.customerAuth.profilePhoto);
  const logout=()=>{
    dispatch(clearCustomerDetails());
    navigate("/customer")
  }
  const liveJob = () => {
    if (!isLiveRequest) {
      toast("You do not have any ongoing request", {
        duration: 6000,
        className: "bg-white shadow-lg border border-gray-200",
      });
    } else {
      navigate(`/customer/auth/service-request/${liveServiceId}`);
    }
  };
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
              <button
                onClick={liveJob}
                className="bg-transparent border-none text-white cursor-pointer font-medium"
              >
                Live Request
              </button>
            </li>
          </ul>
        </div>
        <div className='flex gap-5'>
          <button onClick={()=>navigate("/customer/auth/profile")} className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={profilePhoto || "https://th.bing.com/th/id/OIP.6UhgwprABi3-dz8Qs85FvwHaHa?w=205&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
          <Button onClick={logout} variant="destructive" className="my-auto">Logout</Button>
        </div>
      </div>
    </nav>
  )
}

export default Header