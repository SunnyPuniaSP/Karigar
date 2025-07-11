/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../ui/button";

const SearchingWorker = () => {
  const navigate = useNavigate();
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
  }, []);

  const fetchStatus = () => {
    axios
      .get(`/api/v1/service-request/${serviceRequestId}/status`)
      .then((res) => {
        const data = res.data.data;
        setRequestData(data);
        if (data.orderStatus === "connected" || data.orderStatus === "onway") {
          setWorkerAccepted(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching request status", error);
        alert("Something went wrong while checking the request status");
      });
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

  const cancelSearch = () => {
    axios
      .post(`/api/v1/service-request/${serviceRequestId}/delete-request`)
      .then(() => {
        navigate("/customer/auth/home");
      })
      .catch((err) => {
        console.log("Something went wrong while deleting request", err);
        alert("Something went wrong while deleting request");
      });
  };

  const STATUS_MAP = {
    connected: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🤝",
      label: "Connected: Worker coming soon",
    },
    onway: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🚗",
      label: "Worker on the way",
    },
    arrived: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "🏠",
      label: "Worker has arrived",
    },
    inspecting: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      icon: "🧐",
      label: "Worker is inspecting the issue",
    },
    repairAmountQuoted: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "💬",
      label: "Quote provided",
    },
    payment_pending_quote_amount: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "💳",
      label: "Payment pending",
    },
    payment_pending_visiting_fee: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "💰",
      label: "Visiting fee payment pending",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "🎉",
      label: "Job completed",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "❌",
      label: "Request cancelled",
    },

  };

  const StatusBanner = ({ orderStatus }) => {
    const { bg, text, icon, label } = STATUS_MAP[orderStatus];
    return (
      <div
        className={`w-full max-w-2xl mx-auto flex items-center gap-4 px-6 py-4 rounded-xl shadow ${bg} ${text} mb-6`}
      >
        <span className="text-3xl">{icon}</span>
        <div className="font-bold text-lg">{label}</div>
      </div>
    );
  };

  // ⏳ Show loading while searching for worker
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
        <Button
          onClick={cancelSearch}
          className="mt-5 cursor-pointer"
          variant="destructive"
        >
          Cancel Search
        </Button>
      </div>
    );
  }

  // ✅ Show status + worker info once connected
  if (workerAccepted && requestData && workerDetails) {
    const job = requestData;

    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-10 px-4">
        <StatusBanner orderStatus={job.orderStatus} />
        
      </div>
    );
  }

  return null; // fallback if nothing matches
};

export default SearchingWorker;
