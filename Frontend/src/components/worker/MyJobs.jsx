import React, { useEffect, useState } from "react";
import axios from "axios";
import nopastjobs from "../../assets/nopastjobs.png"

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get("/api/v1/worker/past-jobs")
      .then((res) => {
        setJobs(res.data.data);
      })
      .catch(() => {
        alert("Error in finding past jobs");
      });
  }, []);

  const formatDate = (datetime) => {
    return new Date(datetime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center px-4 text-gray-600 gap-3">
  <img src={nopastjobs} className="h-50"/>
  <h2 className="text-xl font-semibold text-gray-700">No Past Completed Jobs Yet</h2>
  <p className="max-w-xs text-sm text-gray-500">
    Once you complete jobs, you'll see them listed here.
  </p>
</div>

      ) : (
        <div className="flex flex-wrap  gap-3  justify-center ">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white shadow-md rounded-2xl w-[700px] p-5 mb-5  border border-gray-100"
            >
              <div className="flex justify-between items-start">
                
                <div className="flex gap-3 items-center">
                  <img
                    src={
                      String(job.customerPhoto) !== ""
                        ? job.customerPhoto
                        : "https://th.bing.com/th/id/OIP.6UhgwprABi3-dz8Qs85FvwHaHa?w=205&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
                    }
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                  <span style={{ color: "#0B1D3A" }} className="font-medium">{job.customerName}</span>
                </div>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    job.acceptedAt
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {job.acceptedAt ? (
                    <p>Repair Quote Accepted</p>
                  ) : (
                    <p>Repair Quote Rejected</p>
                  )}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                
                <p>
                  <span style={{ color: "#0B1D3A" }} className="font-medium">Date & Time: </span>
                  {formatDate(job.connectedAt)}
                </p>
                  <p>
                  <span style={{ color: "#0B1D3A" }} className="font-medium">Category: </span>
                  {job.category}
                </p>
                <p>
                  <span style={{ color: "#0B1D3A" }} className="font-medium">Payment: </span>₹
                  {job.acceptedAt ? (
                    job.quoteAmount
                  ) : (
                    <span>{job.visitingCharge} (Visiting Charge)</span>
                  )}
                </p>

                <p>
                  <span style={{ color: "#0B1D3A" }} className="font-medium">Payment Mode: </span>
                  {job.paymentType === "online" ? (
                    <span>Online</span>
                  ) : (
                    <span>Cash</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
