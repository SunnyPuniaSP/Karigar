import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SearchingWorker = () => {
  const { serviceRequestId } = useParams();

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workerAccepted, setWorkerAccepted] = useState(false);
  const [workerDetails, setWorkerDetails] = useState(null);

  // Polling for service request status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 4000); // poll every 4 seconds
    
    fetchStatus(); // initial fetch

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatus = () => {
        axios.get(`/api/v1/service-request/${serviceRequestId}/status`)
        .then((res)=>{
            const data = res.data.data;
            setRequestData(data);

            if (data.orderStatus === "connected" || data.orderStatus === "onway") {
                setWorkerAccepted(true);
                setLoading(false);
            } 
        })
       .catch((error)=>{
            console.error("Error fetching request status", error);
            alert("Something went wrong while checking the request status");
       })
  };

  // Fetch worker details when worker is assigned
  useEffect(() => {
    if (workerAccepted && requestData?.workerId) {
      axios
        .get(`/api/v1/worker/${requestData.workerId}/get-details`)
        .then((res) => {
          setWorkerDetails(res.data.data);
        })
        .catch((err) => {
          console.error("Error fetching worker details", err);
          alert("Worker accepted your request, but details couldn't be fetched.");
        });
    }
  }, [workerAccepted, requestData]);

  if (loading && !workerAccepted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">
            Searching for available workers...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we find a nearby technician for your issue.
          </p>
      </div>
    );
  }

  if (workerAccepted && requestData && workerDetails) {
    const job = requestData;

    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Worker Found ✅</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Worker Info */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-4">Worker Details</h2>
            <p><strong>Name:</strong> {workerDetails.fullName}</p>
            <p><strong>Phone:</strong> {workerDetails.phone}</p>
            <p><strong>Rating:</strong> {workerDetails.rating || 'N/A'}</p>
          </div>

          {/* Job Info */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-4">Your Job Details</h2>
            <p><strong>Category:</strong> {job.category}</p>
            <p><strong>Description:</strong> {job.description || 'No description provided'}</p>
            <p><strong>Status:</strong> {job.orderStatus}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SearchingWorker;
