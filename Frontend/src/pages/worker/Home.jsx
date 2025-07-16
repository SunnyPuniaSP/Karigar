import React from "react";
import customerhomehero from "../../assets/customerhomehero.png";
import { Button } from "../ui/button";
import api from "../../api.js";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "../../store/workerAuthSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { fullName, isOnline } = useSelector((state) => state.workerAuth);

  const toggleStatus = () => {
    if (!isOnline) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const location = {
            latitude: lat,
            longitude: lng,
          };

          api
            .patch("/api/v1/worker/update-start-location", location)
            .then(() => {
              api
                .patch("/api/v1/worker/toggle-isOnline")
                .then((res) => {
                  dispatch(setWorkerDetails(res.data.data));
                })
                .catch((err) => {
                  console.log(
                    "something went wrong while toggle your status at backend",
                    err
                  );
                });
            })
            .catch((err) => {
              console.log("Failed to update location at backend", err);
            });
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    } else {
      api
        .patch("/api/v1/worker/toggle-isOnline")
        .then((res) => {
          dispatch(setWorkerDetails(res.data.data));
        })
        .catch((err) => {
          console.log(
            "something went wrong while toggle your status at backend",
            err
          );
        });
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center p-5 gap-5">
        <div className="w-1/2 flex flex-col gap-5">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="text-blue-600">{fullName}</span>!
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Get matched with nearby customers and start earning by providing
            your expert services—flexible, rewarding, and reliable.
          </p>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-base font-medium">Status:</span>
            <div
              className={`relative w-14 h-8 transition-colors duration-300 rounded-full cursor-pointer ${
                isOnline ? "bg-green-500" : "bg-gray-300"
              }`}
              onClick={toggleStatus}
              tabIndex={0}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                  isOnline ? "translate-x-6" : ""
                }`}
              ></span>
            </div>
            <span
              className={`ml-2 font-semibold ${
                isOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
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
