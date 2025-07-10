import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearWorkerDetails } from "../../store/workerAuthSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";

const WorkerHome = () => {
  const worker = useSelector((state) => state.workerAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleToggleStatus = async () => {
    try {
      const res = await axios.patch("/api/v1/worker/toggle-status");
      alert(`You are now ${res.data.data.isOnline ? "Online" : "Offline"}`);
      window.location.reload(); // or update redux state directly
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Something went wrong");
    }
  };

  const handleLogout = () => {
    dispatch(clearWorkerDetails());
    navigate("/worker/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl p-8 relative">
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        {/* Profile Image */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={worker.profilePhoto || "https://via.placeholder.com/120"}
              alt="Profile"
              className="h-28 w-28 rounded-full border-4 border-blue-500 shadow-lg"
            />
            <span
              className={`absolute bottom-0 right-0 h-5 w-5 rounded-full ring-2 ring-white ${
                worker.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{worker.fullName}</h2>
          <p className="text-sm text-gray-500">{worker.email}</p>
          <p className="text-sm text-gray-500">{worker.phone}</p>
        </div>

        {/* Status Toggle */}
        <div className="text-center mt-6">
          <p className="mb-2 font-medium text-gray-700">Your Status:</p>
          <button
            onClick={handleToggleStatus}
            className={`px-6 py-2 text-white font-semibold rounded-full transition duration-300 ${
              worker.isOnline ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {worker.isOnline ? "Online ✅" : "Offline 🚫"}
          </button>
        </div>

        {/* Categories */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Categories You Serve</h3>
          <div className="flex flex-wrap gap-2">
            {worker.workingCategory.map((cat, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm shadow"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-sm text-gray-500 text-center border-t pt-4">
          <p>
            Verified:{" "}
            <span className={worker.isVerified ? "text-green-600" : "text-red-600"}>
              {worker.isVerified ? "Yes ✅" : "No ❌"}
            </span>
          </p>
          <p className="mt-1">Experience: {worker.yearOfExperience || "0"} years</p>
        </div>
      </div>
    </div>
  );
};

export default WorkerHome;
