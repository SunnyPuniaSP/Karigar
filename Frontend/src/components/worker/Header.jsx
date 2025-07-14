import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { clearWorkerDetails } from "../../store/workerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profilePhoto, isOnline } = useSelector((state) => state.workerAuth);
  const { liveServiceId, isLiveRequest } = useSelector(
    (state) => state.workerAuth
  );
  const logout = () => {
    if (isOnline) {
      axios
        .patch("/api/v1/worker/toggle-isOnline")
        .then(() => {
          dispatch(clearWorkerDetails());
          navigate("/worker");
        })
        .catch(() => {
          alert(
            "something went wrong while toggling your status to offline at backend "
          );
        });
    } else {
      dispatch(clearWorkerDetails());
      navigate("/worker");
    }
  };
  const findRequests = () => {
    if (isLiveRequest) {
      toast("You already have an ongoing request", {
        description: (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Please complete your current request before searching for a new
              one.
            </p>
            <Button
              onClick={() => navigate(`/worker/auth/job/${liveServiceId}`)}
              className="px-3 py-1 text-sm font-mediumrounded-md transition"
            >
              Track
            </Button>
          </div>
        ),
        duration: 6000,
        className: "bg-white shadow-lg border border-gray-200",
      });
    } else {
      console.log("navigating to jobs page");
      navigate("/worker/auth/find-jobs");
    }
  };
  const liveJob = () => {
    if (!isLiveRequest) {
      toast("You do not have any ongoing request", {
        description: (
          <div className="mt-2 flex items-center justify-between gap-3">
            <Button
              onClick={() => navigate(`/worker/auth/find-jobs`)}
              className="px-3 py-1 text-sm font-mediumrounded-md transition"
            >
              Find Job
            </Button>
          </div>
        ),
        duration: 6000,
        className: "bg-white shadow-lg border border-gray-200",
      });
    } else {
      navigate(`/worker/auth/job/${liveServiceId}`);
    }
  };
  return (
    <nav>
      <div
        style={{ backgroundColor: "#0B1D3A" }}
        className=" text-white p-2 h-[60px] w-full flex items-center justify-between"
      >
        <div>
          <img src={logo} alt="" className="h-[50px] w-[100px]" />
        </div>
        <div>
          <ul className="flex items-center gap-10">
            <li>
              <NavLink to="/worker/auth/home">Home</NavLink>
            </li>
            <li>
              <button
                onClick={findRequests}
                className="bg-transparent border-none text-white cursor-pointer font-medium"
              >
                Find Jobs
              </button>
            </li>
            <li>
              <button
                onClick={liveJob}
                className="bg-transparent border-none text-white cursor-pointer font-medium"
              >
                Live Job
              </button>
            </li>
            <li>
              <NavLink to="/worker/auth/my-requests">My Jobs</NavLink>
            </li>
            <li>
              <NavLink to="/worker/auth/current-request">Wallet</NavLink>
            </li>
          </ul>
        </div>
        <div className="flex gap-5">
          <button
            onClick={() => navigate("/worker/auth/profile")}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300"
          >
            <img
              src={
                profilePhoto ||
                "https://th.bing.com/th/id/OIP.6UhgwprABi3-dz8Qs85FvwHaHa?w=205&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
          <Button onClick={logout} variant="destructive" className="my-auto">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
