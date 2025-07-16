import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setIsLiveRequest,
  setLiveServiceId,
} from "../../store/workerAuthSlice";
const FindJobs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchJobs();
    }, 4000);

    fetchJobs();

    return () => clearInterval(interval);
  }, []);
  const fetchJobs = () => {
    axios
      .get("/api/v1/service-request/find-requests")
      .then((res) => {
        setJobs(res.data.data);
      })
      .catch((err) => {
        console.log("error while finding jobs", err);
      });
  };

  const handleReject = (customerId) => {
    axios
      .patch("/api/v1/worker/temporary-blockCustomer", { customerId })
      .catch((err) => {
        console.log(
          "error while rejecting and temporary blocking customer ",
          err
        );
      });
  };

  const handleAccept = (serviceRequestId) => {
    axios
      .post(`/api/v1/service-request/${serviceRequestId}/accept`)
      .then(() => {
        dispatch(setIsLiveRequest());
        dispatch(setLiveServiceId(serviceRequestId));
        navigate(`/worker/auth/job/${serviceRequestId}`);
      })
      .catch((err) => {
        console.log("error while accepting the request", err);
      });
  };
  return (
    <div className="p-4">
      {jobs.length === 0 ? (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">
            No job requests at the moment
          </h2>
          <p className="text-gray-500 mt-2">
            Hang tight! We're actively searching for jobs that match your
            skills. We'll notify you as soon as something comes up.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="w-350 p-4 rounded-xl shadow-md bg-white border border-gray-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div>
                  <label style={{ color: "#0B1D3A" }} className="font-medium ">
                    Customer Name :{" "}
                  </label>
                  <span className="text-gray-800">{job.customerName}</span>
                </div>
                <div>
                  <label style={{ color: "#0B1D3A" }} className="font-medium ">
                    Category :{" "}
                  </label>
                  <span className="text-gray-800">{job.category}</span>
                </div>
                <div>
                  <label style={{ color: "#0B1D3A" }} className="font-medium ">
                    Distance :{" "}
                  </label>
                  <span className="text-gray-800">{job.distance_km}KM</span>
                </div>
                <div>
                  <div>
                    <label
                      style={{ color: "#0B1D3A" }}
                      className="font-medium "
                    >
                      Description :{" "}
                    </label>
                    <span className="text-gray-800">
                      {job.description || "Not Provided"}
                    </span>
                  </div>
                </div>
                <div className="">
                  <label style={{ color: "#0B1D3A" }} className="font-medium ">
                    Audio Message
                  </label>
                  {job.audioNoteUrl ? (
                    <audio src={job.audioNoteUrl} controls className="mt-2" />
                  ) : (
                    <span className="text-gray-500"> Not Provided</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <Button
                  onClick={() => {
                    handleReject(job.customerId);
                  }}
                  variant="destructive"
                  className="w-35"
                >
                  Reject
                </Button>
                <Button onClick={() => handleAccept(job._id)} className="w-35">
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindJobs;
