import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '../ui/button'

const FindJobs = () => {
    const [jobs,setJobs]=useState([])
    useEffect(()=>{
        const interval=setInterval(() => {
            fetchJobs();
        }, 4000);

        fetchJobs();

        return ()=>clearInterval(interval)
    },[])
    const fetchJobs=()=>{
        axios.get("/api/v1/service-request/find-requests")
        .then((res)=>{
            setJobs(res.data.data);
        })
        .catch((err)=>{
            console.log("error while finding jobs",err)
            alert("something went wrong when i fetching requests from backend")
        })
    }

    const handleReject=(customerId)=>{
        axios.patch("/api/v1/worker/temporary-blockCustomer",{customerId})
        .catch((err)=>{
            console.log("error while rejecting and temporary blocking customer ",err);
            alert("error while rejecting and temporary blocking customer ");
        })
    }
  return (
    <div className="p-4">
  {jobs.length === 0 ? (
    <div className="text-center text-gray-500 text-lg font-semibold">Searching for job requests...</div>
  ) : (
    <div className="flex flex-wrap gap-4">
      {jobs.map((job, index) => (
        <div
          key={index}
          className="w-80 p-4 rounded-xl shadow-md bg-white border border-gray-200 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div>
              <label className="font-medium text-gray-700">Customer ID:</label>
              <p className="text-gray-800">{job.customerId}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Category:</label>
              <p className="text-gray-800">{job.category}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Description:</label>
              <p className="text-gray-800">{job.description || "Not Provided"}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Audio Message:</label>
              {job.audioNoteUrl ? (
                <audio src={job.audioNoteUrl} controls className="mt-1 w-full" />
              ) : (
                <p className="text-gray-500">Not Provided</p>
              )}
            </div>
          </div>
          <div className='flex justify-between gap-3 mt-2'>
              <Button className="w-35">Accept</Button>
              <Button onClick={()=>{handleReject(job.customerId)}} variant="destructive" className="w-35">Reject</Button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

  )
}

export default FindJobs